const BIRTH_DATE = SITE_CONFIG.birthday;
const configuredDate = new Date(BIRTH_DATE.year, BIRTH_DATE.month - 1, BIRTH_DATE.day);
if (configuredDate.getFullYear() !== BIRTH_DATE.year
  || configuredDate.getMonth() !== BIRTH_DATE.month - 1
  || configuredDate.getDate() !== BIRTH_DATE.day) {
  throw new Error('Ngày sinh trong config.js không hợp lệ. Tháng phải từ 1 đến 12.');
}

function getBirthdayState(now) {
  const thisYear = new Date(now.getFullYear(), BIRTH_DATE.month - 1, BIRTH_DATE.day);
  const isBirthday = now.getMonth() === BIRTH_DATE.month - 1 && now.getDate() === BIRTH_DATE.day;
  const target = new Date(thisYear);

  if (!isBirthday && now > thisYear) target.setFullYear(target.getFullYear() + 1);

  return {
    target,
    isBirthday,
    age: target.getFullYear() - BIRTH_DATE.year,
    secondsLeft: Math.max(0, Math.floor((target - now) / 1000)),
  };
}

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const audio = document.querySelector('audio');
const music = document.querySelector('#music');
let previousDay = '';

document.title = SITE_CONFIG.title;
document.querySelector('meta[name="description"]').setAttribute('content', SITE_CONFIG.description);
document.querySelectorAll('[data-text]').forEach(element => {
  element.textContent = SITE_CONFIG.text[element.dataset.text];
});
audio.src = SITE_CONFIG.audioSrc;
document.querySelector('#footer-date').textContent = configuredDate.toLocaleDateString(SITE_CONFIG.locale, {
  day: 'numeric', month: 'long',
});

function burst() {
  if (motion.matches) return;
  document.dispatchEvent(new Event('birthday:celebrate'));
}

function showView(view) {
  document.querySelectorAll('.scene').forEach(scene => {
    scene.hidden = scene.id !== view;
    scene.setAttribute('aria-labelledby', `${scene.id}-title`);
  });
  if (view === 'birthday') burst();
  else {
    audio.pause();
    audio.currentTime = 0;
  }
}

function updateCountdown() {
  const now = new Date();
  const state = getBirthdayState(now);
  const seconds = state.secondsLeft;
  const values = [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];

  ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
    const element = document.getElementById(id);
    const value = String(values[index]).padStart(index === 0 ? 3 : 2, '0');
    if (element.textContent === value) return;
    element.textContent = value;
    element.classList.remove('tick');
    void element.offsetWidth; // Khởi động lại animation khi chữ số thay đổi.
    element.classList.add('tick');
  });

  document.querySelector('#age').textContent = state.age;
  document.querySelector('#date').textContent = state.target.toLocaleDateString(SITE_CONFIG.locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Tự chọn màn hình theo ngày thực tế, không cho xem trước qua URL.
  const today = now.toDateString();
  if (today !== previousDay) {
    showView(state.isBirthday ? 'birthday' : 'countdown');
    previousDay = today;
  }
}

document.querySelector('#celebrate').addEventListener('click', burst);

function updateMusic() {
  const playing = !audio.paused;
  music.classList.toggle('playing', playing);
  music.setAttribute('aria-pressed', String(playing));
  document.querySelector('#musicText').textContent = playing
    ? SITE_CONFIG.text.pauseMusic : SITE_CONFIG.text.playMusic;
}

music.addEventListener('click', async () => {
  if (!audio.paused) {
    audio.pause();
    return;
  }
  try {
    await audio.play();
  } catch {
    document.querySelector('#musicText').textContent = SITE_CONFIG.text.retryMusic;
  }
});
['play', 'pause', 'ended'].forEach(event => audio.addEventListener(event, updateMusic));

updateCountdown();
setInterval(updateCountdown, 1000);
