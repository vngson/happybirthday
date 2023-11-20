const width = window.innerWidth;
confetti.config = {
    angle: 90,
    spread: width,
    startVelocity: 50,
    ticks: 20,
    decay: 0.8,
    zIndex: 9999,
};

// Create a new confetti effect and launch it for a limited duration
const launchConfetti = () => {
  const confettiInterval = setInterval(() => {
      confetti({
          particleCount: Math.floor(Math.random() * 30 + 20),
          origin: {
              x: Math.random(),
              y: Math.random() - 0.2
          },
          colors: ["#FFD700", "#FFDF00", "#D4AF37", "#F0E68C", "CCAC00", "#FF0000", "#00BFFF", "#50C7C7", "#00FF00"]
      });
  }, 100);

  // Clear the interval after 2 seconds (200 milliseconds)
  setTimeout(() => {
      clearInterval(confettiInterval);
  }, 200);
};

const stopConfetti = () => { // Clear the confetti interval
    document.querySelectorAll('.confetti').forEach((el) => {
        el.remove();
    });
};

function numberToEnglish(num) {
    if (num < 1 || isNaN(num)) {
        return 'Invalid input';
    }

    const lastDigit = num % 10;
    const secondToLastDigit = Math.floor((num % 100) / 10);

    let suffix = 'th';

    if (secondToLastDigit !== 1) {
        switch (lastDigit) {
            case 1:
                suffix = 'st';
                break;
            case 2:
                suffix = 'nd';
                break;
            case 3:
                suffix = 'rd';
                break;
        }
    }

    return num + suffix;
}

// Khai báo biến lưu trữ ngày sinh nhật mong muốn
let birthday = new Date("2023-11-20T09:57:00");
// Khai báo biến lưu trữ năm sinh mong muốn
var birthdayYear = 2002;
// Khai báo biến lưu trữ phần tử html hiển thị thời gian còn lại
var countdown = document.querySelector(".countdown");
// Khai báo biến lưu trữ phần tử main
var main = document.querySelector(".main");
// Khai báo biến tính khoảng cách từ now đến birthday
let distance;
// Khai báo hàm để chạy chương trình
function mainFunction() {
    // Thay thế 'your-audio-element-id' bằng ID của thẻ audio của bạn
    const audioElement = document.querySelector('.main__birthday-audio'); 
    countdown.style.display = "flex";
    main.style.display = "none";
    // Khai báo biến lưu ngày hiện tại
    var now = new Date();
    // Gán giá trị khoảng cách từ now đến birthday
    distance = birthday - now;
    //Khai báo biến giá trị tuổi
    let age = Number(birthday.getFullYear() - birthdayYear);
    // Chuyển đổi sang dạng tiếng anh
    let ageOrdinal =  numberToEnglish(age);
    // Khai báo biến lưu trữ phần tử main__wish
    var main__wish = document.querySelector(".main__wish");
    // Gán giá trị innerHTML phần tử main__wish
    main__wish.innerHTML = `Happy special day, my ${ageOrdinal} birthday`
    // Nếu khoảng cách nhỏ hơn hoặc bằng 0, tức là đã đến ngày sinh nhật 
    if (distance < 0 && distance >= -86400000) {
        // Chạy chương trình chính do bạn code
        countdown.style.display = "none";
        main.style.display = "flex";
        // Sự kiện mousedown để giả mạo sự tương tác người dùng
        document.addEventListener('mousedown', function() {
            // Phát âm thanh
            audioElement.play();
            // Gỡ bỏ sự kiện mousedown để tránh lặp lại
            document.removeEventListener('mousedown', arguments.callee);
        });
        launchConfetti();
    }
    // Chờ đợi 1 ngày sau khi chúc sinh nhật thì khởi động lại việc đếm ngược đến sinh nhật năm tiếp theo
    else if (distance < -86400000) // 24 giờ 
    {
        countdown.style.display = "flex";
        main.style.display = "none";
        audioElement.pause();
        audioElement.currentTime = 0;
        // Dừng hiệu ứng confetti
        stopConfetti();
        birthday.setFullYear(birthday.getFullYear() + 1);
    }
    // Nếu khoảng cách lớn hơn 0, tức là chưa đến ngày sinh nhật
    else
    {
        // Tính số ngày, giờ, phút và giây còn lại
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var day_hundreds = document.getElementById("day_hundreds");
        day_hundreds.innerHTML = Math.floor(days / 100);
        var day_dozens = document.getElementById("day_dozens");
        day_dozens.innerHTML = Math.floor((days % 100) / 10);
        var day_unit = document.getElementById("day_unit");
        day_unit.innerHTML = Math.floor((days % 100) % 10);
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var hour_dozens = document.getElementById("hour_dozens");
        hour_dozens.innerHTML = Math.floor(hours / 10);
        var hour_unit = document.getElementById("hour_unit");
        hour_unit.innerHTML = Math.floor(hours % 10);
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var minute_dozens = document.getElementById("minute_dozens");
        minute_dozens.innerHTML = Math.floor(minutes / 10);
        var minute_unit = document.getElementById("minute_unit");
        minute_unit.innerHTML = Math.floor(minutes % 10);
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        var second_dozens = document.getElementById("second_dozens");
        second_dozens.innerHTML = Math.floor(seconds / 10);
        var second_unit = document.getElementById("second_unit");
        second_unit.innerHTML = Math.floor(seconds % 10);
    }
    setTimeout(mainFunction, 200);
}

// Khai báo biến lưu trữ hàm setInterval
mainFunction();


//Hàm chúc mừng ngày 20/10

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