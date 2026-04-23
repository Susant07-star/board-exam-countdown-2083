// --- Target Date: April 27, 2026, 8:00 AM (Nepal Time) ---
// Nepal is UTC+5:45. We'll convert target date to UTC first to be safe across browsers.
// 2026-04-27 08:00:00 NPT = 2026-04-27 02:15:00 UTC
const targetDate = new Date(Date.UTC(2026, 3, 27, 2, 15, 0)).getTime();

// Define a start date to calculate progress (e.g., beginning of academic year or a past date)
// Let's use Jan 1, 2025 as an arbitrary start for the progress bar.
const startDate = new Date(Date.UTC(2025, 0, 1, 0, 0, 0)).getTime();
const totalDuration = targetDate - startDate;

// DOM Elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const rotatingText = document.getElementById('rotating-text');
const countdownContainer = document.getElementById('countdown-container');
const flickerOverlay = document.getElementById('flicker');

// Subtexts for rotating
const subtexts = [
    "Final battle begins...",
    "Last push, don't give up",
    "You got this 💪",
    "शुभकामना 🙏",
    "Focus mode activated 🚀",
    "Time is ticking. Make it count."
];
let subtextIndex = 0;

// Update subtext
function changeSubtext() {
    rotatingText.classList.remove('fade-in');
    rotatingText.classList.add('fade-out');
    
    setTimeout(() => {
        subtextIndex = (subtextIndex + 1) % subtexts.length;
        rotatingText.textContent = subtexts[subtextIndex];
        rotatingText.classList.remove('fade-out');
        rotatingText.classList.add('fade-in');
    }, 500); // Wait for fade-out
}

setInterval(changeSubtext, 4000); // Change every 4 seconds

// Add leading zero
const formatTime = (time) => (time < 10 ? `0${time}` : time);

// Main countdown function
function updateCountdown() {
    const now = new Date().getTime();
    let timeRemaining = targetDate - now;

    if (timeRemaining < 0) {
        timeRemaining = 0;
        // You could add special "EXAM STARTED" logic here
        rotatingText.textContent = "It's Time! Good Luck! 🔥";
        clearInterval(countdownInterval);
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Update DOM
    const oldSecs = secondsEl.innerText;
    
    daysEl.innerText = formatTime(days);
    hoursEl.innerText = formatTime(hours);
    minutesEl.innerText = formatTime(minutes);
    secondsEl.innerText = formatTime(seconds);

    // Add tick animation if seconds changed
    if (oldSecs !== formatTime(seconds)) {
        secondsEl.classList.remove('tick');
        void secondsEl.offsetWidth; // Trigger reflow
        secondsEl.classList.add('tick');
    }

    // Update Progress Bar
    const timeElapsed = now - startDate;
    let progress = (timeElapsed / totalDuration) * 100;
    if (progress > 100) progress = 100;
    if (progress < 0) progress = 0;
    
    progressBar.style.width = `${progress}%`;
    progressPercent.innerText = `${progress.toFixed(4)}%`;
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // Initial call

// Random Glitch Effect
function randomGlitch() {
    countdownContainer.classList.add('glitch-active');
    setTimeout(() => {
        countdownContainer.classList.remove('glitch-active');
    }, 150);

    // Schedule next glitch
    const nextGlitch = Math.random() * 10000 + 5000; // Between 5s and 15s
    setTimeout(randomGlitch, nextGlitch);
}
setTimeout(randomGlitch, 3000);

// Random Screen Flicker
function randomFlicker() {
    if (Math.random() > 0.7) {
        flickerOverlay.classList.add('on');
        setTimeout(() => {
            flickerOverlay.classList.remove('on');
        }, Math.random() * 50 + 20); // 20-70ms flicker
    }
    
    setTimeout(randomFlicker, Math.random() * 5000 + 2000); // 2s to 7s
}
setTimeout(randomFlicker, 2000);


// --- Particle / Star Background ---
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.alphaSpeed = (Math.random() - 0.5) * 0.01;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around
        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;
        
        // Twinkle
        this.alpha += this.alphaSpeed;
        if (this.alpha <= 0.1 || this.alpha >= 0.8) {
            this.alphaSpeed *= -1;
        }
    }
    
    draw() {
        ctx.fillStyle = `rgba(168, 85, 247, ${this.alpha})`;
        // Mix in some blue particles occasionally
        if (this.size > 1.8) {
             ctx.fillStyle = `rgba(0, 212, 255, ${this.alpha})`;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const numParticles = Math.min(Math.floor(width * height / 10000), 100); // Responsive particle count
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();
