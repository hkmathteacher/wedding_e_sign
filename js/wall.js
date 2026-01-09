// === 修改點 1: 改從 firebase.js 引入已經設定好的 db ===
import { db } from './firebase.js'; 
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// (這裡不再需要 firebaseConfig 和 initializeApp 了，因為已經在 firebase.js 做過了)

// 參數
const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
const loading = document.getElementById('loading');
const filterBar = document.getElementById('filterBar');
const MAX_VISIBLE_STARS = 30;

let allGuests = [];
let filteredGuests = [];
let activeStars = [];
let playbackQueue = [];
let currentCategoryFilter = 'all';

// RGB 顏色映射 (用於光暈)
const colorMap = {
    'groom_friend': '179, 229, 252',
    'bride_friend': '255, 205, 210',
    'groom_family': '178, 223, 219',
    'bride_family': '248, 187, 208',
    'colleague':    '220, 237, 200',
    'classmate':    '225, 190, 231',
    'vip':          '255, 249, 196',
    'default':      '255, 255, 255'
};

const filterOptions = [
    { id: 'all', label: '全部顯示' },
    { id: 'groom_friend', label: '🤵 新郎朋友' },
    { id: 'bride_friend', label: '👰 新娘朋友' },
    { id: 'groom_family', label: '🏡 新郎親戚' },
    { id: 'bride_family', label: '💕 新娘親戚' },
    { id: 'colleague', label: '💼 同事' },
    { id: 'classmate', label: '🎓 同學' },
    { id: 'vip', label: '🌟 貴賓' }
];

// 初始化
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Star Class
class Star {
    constructor(data, mode) {
        this.data = data;
        this.mode = mode;
        this.size = 60;
        this.image = new Image();
        this.image.src = data.imageData;
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; };
        this.alpha = Math.random();
        this.alphaDir = 0.005 + Math.random() * 0.005;
        this.scale = 0; 
        this.isDead = false; 
        this.initPosition();
    }

    initPosition() {
        const speed = this.mode === 'flow' ? 1.5 : 0.8;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        if (Math.abs(this.vx) < 0.2) this.vx = 0.5;
        if (Math.abs(this.vy) < 0.2) this.vy = 0.5;

        if (this.mode === 'bounce') {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        } else {
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.x = this.vx > 0 ? -this.size : canvas.width + this.size;
                this.y = Math.random() * canvas.height;
            } else {
                this.x = Math.random() * canvas.width;
                this.y = this.vy > 0 ? -this.size : canvas.height + this.size;
            }
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha += this.alphaDir;
        if (this.alpha > 0.9 || this.alpha < 0.4) this.alphaDir *= -1;
        if (this.scale < 1) this.scale += 0.02;

        if (this.mode === 'bounce') {
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        } else {
            const margin = 100;
            if ((this.vx > 0 && this.x > canvas.width + margin) ||
                (this.vx < 0 && this.x < -margin) ||
                (this.vy > 0 && this.y > canvas.height + margin) ||
                (this.vy < 0 && this.y < -margin)) {
                this.isDead = true;
            }
        }
    }

    draw() {
        if (!this.loaded) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        
        const rgb = colorMap[this.data.category] || colorMap['default'];
        const gradient = ctx.createRadialGradient(0, 0, this.size * 0.5, 0, 0, this.size * 1.5);
        gradient.addColorStop(0, `rgba(${rgb}, ${this.alpha})`);
        gradient.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.image, -this.size/2, -this.size/2, this.size, this.size);
        
        ctx.restore();
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.data.name, this.x, this.y + this.size/2 + 20);
    }
}

// 邏輯控制
function updateGuestFilter() {
    if (currentCategoryFilter === 'all') {
        filteredGuests = [...allGuests];
    } else {
        filteredGuests = allGuests.filter(g => g.category === currentCategoryFilter);
    }
    playbackQueue = []; 
    const isCrowded = filteredGuests.length > MAX_VISIBLE_STARS;
    if (!isCrowded) {
        activeStars.forEach(star => star.mode = 'bounce');
    }
}

function spawnStars() {
    const targetCount = Math.min(filteredGuests.length, MAX_VISIBLE_STARS);
    const isCrowded = filteredGuests.length > MAX_VISIBLE_STARS;
    const mode = isCrowded ? 'flow' : 'bounce';

    while (activeStars.length < targetCount) {
        if (playbackQueue.length === 0) {
            if (filteredGuests.length === 0) break;
            playbackQueue = shuffleArray(filteredGuests);
        }
        
        let candidate = null;
        let attempts = 0;
        const maxAttempts = playbackQueue.length;

        // 防重疊檢查
        while (attempts < maxAttempts) {
            const potentialGuest = playbackQueue.pop();
            const isAlreadyOnScreen = activeStars.some(s => s.data.id === potentialGuest.id);
            if (isAlreadyOnScreen) {
                playbackQueue.unshift(potentialGuest);
                attempts++;
            } else {
                candidate = potentialGuest;
                break;
            }
        }

        if (candidate) {
            activeStars.push(new Star(candidate, mode));
        } else {
            break;
        }
    }
}

// UI 按鈕
function renderFilterButtons() {
    filterBar.innerHTML = '';
    filterOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = opt.label;
        if (opt.id === currentCategoryFilter) btn.classList.add('active');
        btn.onclick = () => applyFilter(opt.id);
        filterBar.appendChild(btn);
    });
}

function applyFilter(filterId) {
    if (currentCategoryFilter === filterId) return;
    currentCategoryFilter = filterId;
    updateGuestFilter();
    activeStars = []; 
    spawnStars();
    
    document.querySelectorAll('.filter-btn').forEach((btn, index) => {
        if (filterOptions[index].id === filterId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// Firebase 監聽
function startListening() {
    // === 修改點 2: 直接使用 db ===
    const q = query(collection(db, "guests"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        loading.style.display = 'none';
        allGuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateGuestFilter();
        spawnStars();
    }, (error) => {
        console.error("讀取資料失敗:", error);
        loading.textContent = "讀取失敗，請檢查網路或 API Key";
    });
}

// Loop
function animate() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = activeStars.length - 1; i >= 0; i--) {
        const star = activeStars[i];
        star.update();
        star.draw();
        if (star.isDead) activeStars.splice(i, 1);
    }
    spawnStars();
    requestAnimationFrame(animate);
}

renderFilterButtons();
startListening();
animate();
