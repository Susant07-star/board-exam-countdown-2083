// --- Exam Schedule Data ---
// NPT is UTC+5:45
// 8:00 AM NPT = 2:15 AM UTC
// 11:00 AM NPT = 5:15 AM UTC
const exams = [
    { subject: "Compulsory English", date: "April 27, 2026", start: Date.UTC(2026, 3, 27, 2, 15, 0), end: Date.UTC(2026, 3, 27, 5, 15, 0), type: "core" },
    { subject: "Compulsory Nepali", date: "April 28, 2026", start: Date.UTC(2026, 3, 28, 2, 15, 0), end: Date.UTC(2026, 3, 28, 5, 15, 0), type: "core" },
    { subject: "Compulsory Mathematics", date: "April 30, 2026", start: Date.UTC(2026, 3, 30, 2, 15, 0), end: Date.UTC(2026, 3, 30, 5, 15, 0), type: "core" },
    { subject: "Physics", date: "May 4, 2026", start: Date.UTC(2026, 4, 4, 2, 15, 0), end: Date.UTC(2026, 4, 4, 5, 15, 0), type: "core" },
    { subject: "Chemistry", date: "May 6, 2026", start: Date.UTC(2026, 4, 6, 2, 15, 0), end: Date.UTC(2026, 4, 6, 5, 15, 0), type: "core" },
    { subject: "Biology", date: "May 8, 2026", start: Date.UTC(2026, 4, 8, 2, 15, 0), end: Date.UTC(2026, 4, 8, 5, 15, 0), type: "biology" },
    { subject: "Computer Science", date: "May 10, 2026", start: Date.UTC(2026, 4, 10, 2, 15, 0), end: Date.UTC(2026, 4, 10, 5, 15, 0), type: "computer" }
];

// Define a start date to calculate progress (Jan 1, 2026)
const startDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0)).getTime();

// Stream Management
let currentStream = localStorage.getItem('selectedStream') || 'computer';

function initStreamSelector() {
    const btns = document.querySelectorAll('.stream-btn');
    if (btns.length === 0) return;

    btns.forEach(btn => {
        if (btn.dataset.stream === currentStream) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        btn.addEventListener('click', (e) => {
            btns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentStream = e.currentTarget.dataset.stream;
            localStorage.setItem('selectedStream', currentStream);
            updateCountdown();
        });
    });
}

function getActiveExam() {
    const now = new Date().getTime();
    const streamExams = exams.filter(e => e.type === 'core' || e.type === currentStream);
    
    for (let i = 0; i < streamExams.length; i++) {
        const exam = streamExams[i];
        if (now < exam.end) {
            return exam;
        }
    }
    return null; // All exams completed
}

// DOM Elements
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const rotatingText = document.getElementById('rotating-text');
const countdownContainer = document.getElementById('countdown-container');
const flickerOverlay = document.getElementById('flicker');
const subjectNameEl = document.getElementById('subject-name');
const examDateEl = document.getElementById('exam-date');

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
let isExamOngoing = false;

// Update subtext
function changeSubtext() {
    if (!rotatingText || isExamOngoing) return;
    
    // Only update if not completed all exams
    if (!getActiveExam()) return;

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
    if (!hoursEl) return;
    const now = new Date().getTime();
    const activeExam = getActiveExam();

    if (!activeExam) {
        hoursEl.innerText = "00";
        minutesEl.innerText = "00";
        secondsEl.innerText = "00";
        if (rotatingText) {
            rotatingText.textContent = "All Exams Finished! 🎉";
            rotatingText.classList.remove('fade-out');
            rotatingText.classList.add('fade-in');
        }
        if (subjectNameEl) subjectNameEl.textContent = "Exams Completed";
        if (progressBar) progressBar.style.width = `100%`;
        if (progressPercent) progressPercent.innerText = `100.0000%`;
        isExamOngoing = false;
        return;
    }

    let targetTime;
    
    if (now >= activeExam.start && now < activeExam.end) {
        // Exam is ongoing
        targetTime = activeExam.end;
        if (!isExamOngoing) {
            isExamOngoing = true;
            if (rotatingText) {
                rotatingText.textContent = "🔥 EXAM ONGOING! 🔥";
                rotatingText.classList.remove('fade-out');
                rotatingText.classList.add('fade-in');
            }
        }
        if (subjectNameEl) subjectNameEl.textContent = activeExam.subject + " (Ongoing)";
    } else {
        // Exam is upcoming
        targetTime = activeExam.start;
        isExamOngoing = false;
        if (subjectNameEl) subjectNameEl.textContent = "Next: " + activeExam.subject;
    }

    if (examDateEl) examDateEl.textContent = activeExam.date;

    let timeRemaining = targetTime - now;
    if (timeRemaining < 0) timeRemaining = 0;

    // Total hours remaining (no days)
    const totalHours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes    = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds    = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Update DOM
    const oldSecs = secondsEl.innerText;

    hoursEl.innerText   = totalHours;
    minutesEl.innerText = formatTime(minutes);
    secondsEl.innerText = formatTime(seconds);

    // Add tick animation if seconds changed
    if (oldSecs !== formatTime(seconds)) {
        secondsEl.classList.remove('tick');
        void secondsEl.offsetWidth; // Trigger reflow
        secondsEl.classList.add('tick');
    }

    // Update Progress Bar based on total duration up to the LAST exam for the stream
    if (progressBar && progressPercent) {
        const streamExams = exams.filter(e => e.type === 'core' || e.type === currentStream);
        const lastExam = streamExams[streamExams.length - 1];
        const totalDuration = lastExam.end - startDate;
        
        const timeElapsed = now - startDate;
        let progress = (timeElapsed / totalDuration) * 100;
        if (progress > 100) progress = 100;
        if (progress < 0) progress = 0;
        
        progressBar.style.width = `${progress}%`;
        progressPercent.innerText = `${progress.toFixed(4)}%`;
    }
}

// Initialize
initStreamSelector();
const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // Initial call

// Random Glitch Effect
function randomGlitch() {
    if (!countdownContainer) return;
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
    if (!flickerOverlay) return;
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
