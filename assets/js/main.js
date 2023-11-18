const width = window.innerWidth;
confetti.config = {
    angle: 90,
    spread: width,
    startVelocity: 50,
    decay: 0.9,
    ticks: 60,
    zIndex: 9999,
};

const confettiParticles = []; // Mảng chứa các hạt confetti

// Hàm để tạo một hạt confetti và thêm vào mảng
const createConfetti = () => {
    const confettiInstance = confetti({
        particleCount: Math.floor(Math.random() * 150 + 50),
        origin: {
            x: Math.random(),
            y: Math.random() - 0.2
        },
        colors: ["#FFD700", "#FFDF00", "#D4AF37", "#F0E68C","CCAC00","#FF0000", "#00BFFF", "#50C7C7", "#00FF00"],
    });

    confettiParticles.push(confettiInstance);
};

// Hàm để cập nhật và vẽ hiệu ứng confetti
const updateConfetti = () => {
    confettiParticles.forEach((particle, index) => {
        particle.ticks--;

        if (particle.ticks <= 0) {
            // Xóa hạt confetti khi hết thời gian
            confettiParticles.splice(index, 1);
            particle.reset();
        }
    });

    if (Math.random() > 0.95) {
        // Tạo một hạt confetti mới với xác suất 5%
        createConfetti();
    }

    requestAnimationFrame(updateConfetti);
};

// Khởi tạo hiệu ứng confetti
const startConfetti = () => {
    createConfetti();
    updateConfetti();
};

const stopConfetti = () => {
  confettiParticles.forEach((particle) => {
      particle.reset();
  });
  confettiParticles.length = 0; // Xóa mảng hạt confetti
};

function toEnglish(num) {
  const specialCases = { 1: '1st', 2: '2nd', 3: '3rd' };
  const suffixes = ['th', 'st', 'nd', 'rd', 'th'];
 
  // For special cases, return the corresponding English representation
  if (specialCases.hasOwnProperty(num)) {
     return specialCases[num];
  }
 
  // Convert the number to words using toLocaleString
  let words = num.toLocaleString('en-US', { style: 'ordinal' });
 
  // Get the last character of the word representation, which determines the suffix
  let lastChar = words.charAt(words.length - 1);
  let suffixIndex = Number(lastChar);
 
  // Replace the suffix of the word representation with the correct English ordinal suffix
  words = words.slice(0, -1) + suffixes[suffixIndex];
 
  return words;
 }

// Khai báo biến lưu trữ ngày sinh nhật mong muốn
var birthday = new Date("2023-11-17T22:42:00");
// Khai báo biến lưu trữ phần tử html hiển thị thời gian còn lại
var countdown = document.querySelector(".countdown");
var main = document.querySelector(".main");

function restartCountdown() {
  stopConfetti();
  birthday.setFullYear(birthday.getFullYear() + 1);

    // Restart the countdown
  interval = setInterval(updateCountdown, 500);
}
// Khai báo hàm để cập nhật thời gian còn lại
function updateCountdown() {
  countdown.style.display = "flex";
      // Hiển thị thẻ B bằng cách đặt display là block
    main.style.display = "none";
  // Lấy thời gian hiện tại
  var now = new Date();

  let age = birthday.getFullYear() - 2002;
  let ageOrdinal =  toEnglish(age);
  var main__wish = document.querySelector(".main__wish");
  main__wish.innerHTML = `Happy special day, my ${ageOrdinal} birthday`
  // Tính khoảng cách giữa thời gian hiện tại và ngày sinh nhật
  var distance = birthday - now;

  // Nếu khoảng cách nhỏ hơn hoặc bằng 0, tức là đã đến ngày sinh nhật
  if (distance <= 0) {
    // Dừng hàm setInterval
    clearInterval(interval);
    // Chạy chương trình chính do bạn code
    countdown.style.display = "none";
    main.style.display = "flex";
    startConfetti();

  // Chờ đợi 1 ngày trước khi chạy đoạn mã tiếp theo
    // if(distance === -5000)
    // {
    //     // Dừng hiệu ứng confetti
    //     stopConfetti();
    //     // Cập nhật ngày sinh nhật cho năm tiếp theo
    //     birthday.setFullYear(birthday.getFullYear() + 1);

    //     // Restart the countdown
    //     interval = setInterval(updateCountdown, 500);
    // } // 24 giờ
  }else {
    // Nếu khoảng cách lớn hơn 0, tức là chưa đến ngày sinh nhật

    // Tính số ngày, giờ, phút và giây còn lại
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var day_hundreds = document.getElementById("day_hundreds");
    day_hundreds.innerHTML = Math.floor(days/100);
    var day_dozens = document.getElementById("day_dozens");
    day_dozens.innerHTML = Math.floor((days%100)/10);
    var day_unit = document.getElementById("day_unit");
    day_unit.innerHTML = Math.floor((days%100)%10);
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
    var hour_dozens = document.getElementById("hour_dozens");
    hour_dozens.innerHTML = Math.floor(hours /10);
    var hour_unit = document.getElementById("hour_unit");
    hour_unit.innerHTML = Math.floor(hours %10);
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var minute_dozens = document.getElementById("minute_dozens");
    minute_dozens.innerHTML = Math.floor(minutes /10);
    var minute_unit = document.getElementById("minute_unit");
    minute_unit.innerHTML = Math.floor(minutes %10);
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var second_dozens = document.getElementById("second_dozens");
    second_dozens.innerHTML = Math.floor(seconds /10);
    var second_unit = document.getElementById("second_unit");
    second_unit.innerHTML = Math.floor(seconds %10);
  }
}

// Khai báo biến lưu trữ hàm setInterval
let interval = setInterval(updateCountdown, 500);


// var count = 0;

// var flower_src = "assets/images/flower.png"

// // Create a function to generate a random number between min and max
// function random(min, max) {
//   return Math.random() * (max - min) + min;
// }

// // Create a function to create a flower element
// function createFlower() {
//   count = count + 1;
//   // Create a new image element
//   var img = document.createElement("img");
  
//   // Set the src attribute to a random flower image
//   img.src = flower_src;
  
//   // Set the class attribute to flower
//   img.className = "flower";
  
//   // Set the style attribute to a random value between 0 and 1
//   img.style.setProperty("--random", random(0, 1));

//   img.id = "flower" + count;
  
//   img.style.zIndex = 10;
  
//   // Append the image element to the body element
//   document.body.appendChild(img);
// }

// // Create a function to create a random number of flowers
// function createFlowers() {
  
//    // Clear the body element
//   //  document.body.innerHTML = "";
  
//    // Create a random number of flowers between 10 and 20
//    var n = Math.floor(random(3,5));
  
//    // Loop through the number of flowers
//    for (var i = 0; i < n; i++) {
//      // Create a flower element
//      createFlower();
//    }
// }

// // Call the createFlowers function every second
// setInterval(createFlowers,500);

// // Tạo một hàm để xóa một phần tử theo id
// function removeElement(id) {
//   var element = document.getElementById(id);
//   if (element) {
//     element.parentNode.removeChild(element);
//   }
// }

// // Tạo một hàm để xóa các bông hoa khi chúng rơi xuống cuối màn hình
// function removeFlowers() {
//   // Lấy tất cả các phần tử có class là flower
//   var flowers = document.querySelectorAll(".flower");
  
//   // Duyệt qua từng phần tử
//   for (var i = 0; i < flowers.length; i++) {
//     // Lấy phần tử hiện tại
//     var flower = flowers[i];
    
//     // Lấy giá trị của thuộc tính top
//     var top = window.getComputedStyle(flower).getPropertyValue("top");
    
//     // Chuyển đổi giá trị top thành số
//     var topValue = parseFloat(top);
    
//     // Kiểm tra nếu giá trị top lớn hơn chiều cao của cửa sổ
//     if (topValue >= window.innerHeight) {
//       // Lấy giá trị của thuộc tính id
//       var id = flower.id;
      
//       // Xóa phần tử theo id
//       removeElement(id);
//     }
//   }
// }


// var duration = 30 * 1000;
// var end = Date.now() + duration;

// (function frame() {
//   // launch a few confetti from the left edge
//   confetti({
//     particleCount: 7,
//     angle: 60,
//     spread: 55,
//     origin: { x: 0 }
//   });
//   // and launch a few from the right edge
//   confetti({
//     particleCount: 7,
//     angle: 120,
//     spread: 55,
//     origin: { x: 1 }
//   });

//   // keep going until we are out of time
//   if (Date.now() < end) {
//     requestAnimationFrame(frame);
//   }
// }());