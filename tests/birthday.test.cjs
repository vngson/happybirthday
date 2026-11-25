const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const configSource = fs.readFileSync('config.example.js', 'utf8');
const config = vm.runInNewContext(`${configSource}\nSITE_CONFIG;`);
// Dùng ngày cố định cho kiểm thử, độc lập với ngày người dùng chọn khi deploy.
const fixtureConfig = { ...config, birthday: { year: 2000, month: 5, day: 20 } };
const source = fs.readFileSync('assets/js/birthday.js', 'utf8');
const logic = source.slice(0, source.indexOf('const motion ='));
const context = vm.createContext({ Date, SITE_CONFIG: fixtureConfig });
vm.runInContext(logic, context);
const stateAt = date => context.getBirthdayState(new Date(date));

let state = stateAt('2026-05-19T23:59:59');
assert.equal(state.isBirthday, false);
assert.equal(state.secondsLeft, 1);
assert.equal(state.age, 26);

for (const time of ['00:00:00', '12:30:00', '23:59:59']) {
  state = stateAt(`2026-05-20T${time}`);
  assert.equal(state.isBirthday, true);
  assert.equal(state.secondsLeft, 0);
  assert.equal(state.age, 26);
}

state = stateAt('2026-05-21T00:00:00');
assert.equal(state.isBirthday, false);
assert.equal(state.target.getFullYear(), 2027);
assert.equal(state.age, 27);
assert(state.secondsLeft > 0);
assert.equal(stateAt('2026-12-31T23:59:59').target.getFullYear(), 2027);

for (const file of ['birthday.js', 'effects.js']) {
  new vm.Script(fs.readFileSync(`assets/js/${file}`, 'utf8'), { filename: file });
}
console.log('PASS: birthday boundaries, next year, age and JavaScript syntax.');

const customContext = vm.createContext({ Date, SITE_CONFIG: { ...config, birthday: { year: 1995, month: 8, day: 10 } } });
vm.runInContext(logic, customContext);
assert.equal(customContext.getBirthdayState(new Date('2026-08-10T12:00:00')).age, 31);
assert.equal(customContext.getBirthdayState(new Date('2026-08-10T12:00:00')).isBirthday, true);
assert.throws(() => vm.runInNewContext(logic, { Date, SITE_CONFIG: { birthday: { year: 2000, month: 2, day: 30 } } }), /không hợp lệ/);
console.log('PASS: custom birthday configuration and invalid date validation.');

// Chạy toàn bộ logic với DOM giả để kiểm tra chuyển màn hình tự động qua nửa đêm.
let clock = new Date('2026-05-19T23:59:59').getTime();
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [clock])); }
}
const element = id => ({
  id, hidden: false, textContent: '', currentTime: 0,
  classList: { add() {}, remove() {}, toggle() {} },
  setAttribute() {}, addEventListener() {}, pause() {},
});
const scenes = [element('countdown'), element('birthday')];
const nodes = new Map(scenes.map(node => [`#${node.id}`, node]));
function querySelector(selector) {
  if (!nodes.has(selector)) nodes.set(selector, element(selector));
  return nodes.get(selector);
}
let tick;
vm.runInNewContext(source, {
  SITE_CONFIG: fixtureConfig,
  Date: ClockDate, Event,
  location: { search: '?view=birthday&controls=0' },
  matchMedia: () => ({ matches: true }),
  document: {
    querySelector,
    getElementById: id => querySelector(`#${id}`),
    querySelectorAll: selector => selector === '.scene' ? scenes : [],
    dispatchEvent() {},
  },
  setInterval(callback) { tick = callback; },
});
assert.equal(scenes[0].hidden, false, 'Countdown before birthday, even with old preview URL');
assert.equal(scenes[1].hidden, true);
clock = new Date('2026-05-20T00:00:00').getTime();
tick();
assert.equal(scenes[0].hidden, true);
assert.equal(scenes[1].hidden, false, 'Automatically celebrate at midnight');
assert.equal(querySelector('#age').textContent, 26);
clock = new Date('2026-05-21T00:00:00').getTime();
tick();
assert.equal(scenes[0].hidden, false, 'Automatically count down for next year');
assert.equal(scenes[1].hidden, true);
console.log('PASS: automatic screen transitions and old preview URLs ignored.');

const html = fs.readFileSync('index.html', 'utf8');
assert(fs.existsSync(config.audioSrc), `Missing configured audio: ${config.audioSrc}`);
for (const [, key] of html.matchAll(/data-text="([^"]+)"/g)) {
  assert.equal(typeof config.text[key], 'string', `Missing configured text: ${key}`);
}
for (const [, asset] of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g)) {
  assert(fs.existsSync(asset === './config.js' ? './config.example.js' : asset), `Missing page asset: ${asset}`);
}
console.log('PASS: all local page assets exist.');
