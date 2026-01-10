import { db } from './firebase.js'; 
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// DOM
const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
const loading = document.getElementById('loading');
const filterButtons = document.getElementById('filterButtons');
const filterSelect = document.getElementById('filterSelect');
const modalOverlay = document.getElementById('modalOverlay');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalMsg = document.getElementById('modalMsg');

const MAX_VISIBLE_STARS = 30;

let allGuests = [];
let filteredGuests = [];
let activeStars = [];
let playbackQueue = [];
let currentCategoryFilter = 'all';

const colorMap = {
    'groom_friend': '144, 202, 249',
    'bride_friend': '255, 128, 171',
    'groom_family': '129, 212, 250',
    'bride_family': '244, 143, 177',
    'colleague':    '165, 214, 167',
    'classmate':    '206, 147, 216',
    'vip':          '255, 202, 40',
    'default':      '212, 175, 55'
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

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Click Detection
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    for (let i = activeStars.length - 1; i >= 0; i--) {
        const bubble = activeStars[i];
        const dist = Math.hypot(clickX - bubble.x, clickY - bubble.y);
        if (dist < bubble.size * 1.1) {
            openModal(bubble.data);
            break;
        }
    }
});

function openModal(data) {
    modalImg.src = data.imageData;
    modalName.textContent = data.name;
    modalMsg.textContent = data.message || "（沒有留下訊息）";
    modalOverlay.style.display = 'flex';
    requestAnimationFrame(() => modalOverlay.classList.add('show'));
}

class Bubble {
    constructor(data, mode) {
        this.data = data;
        this.mode = mode; 
        
        // 修改 1: 氣泡半徑改為 35
        this.size = 35; 
        
        this.image = new Image();
        this.image.src = data.imageData;
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; };
        this.scale = 0; 
        this.targetScale = 1;
        this.floatOffset = Math.random() * 100;
        this.initPosition();
    }

    initPosition() {
        const speed = this.mode === 'flow' ? 1.2 : 0.6;
        let valid = false;
        // 斜向飛行檢查
        while (!valid) {
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
            if (Math.abs(this.vx) > 0.3 && Math.abs(this.vy) > 0.3) {
                valid = true;
            }
        }

        if (this.mode === 'bounce') {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        } else {
            // Flow: 根據縮小後的 size 調整生成邊距
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.x = this.vx > 0 ? -this.size * 2 : canvas.width + this.size * 2;
                this.y = Math.random() * canvas.height;
            } else {
                this.x = Math.random() * canvas.width;
                this.y = this.vy > 0 ? -this.size * 2 : canvas.height + this.size * 2;
            }
        }
    }

    update(time) {
        this.x += this.vx;
        this.y += this.vy;
        this.y += Math.sin(time * 0.002 + this.floatOffset) * 0.2;
        if (this.scale < this.targetScale) this.scale += 0.02;

        if (this.mode === 'bounce') {
            const padding = this.size;
            if (this.x < padding || this.x > canvas.width - padding) this.vx *= -1;
            if (this.y < padding || this.y > canvas.height - padding) this.vy *= -1;
        } else {
            const margin = 150;
            if ((this.vx > 0 && this.x > canvas.width + margin) || (this.vx < 0 && this.x < -margin) || (this.vy > 0 && this.y > canvas.height + margin) || (this.vy < 0 && this.y < -margin)) {
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
        
        // 陰影維持
        ctx.shadowColor = `rgba(${rgb}, 0.6)`;
        ctx.shadowBlur = 10; // 配合尺寸稍微縮小模糊範圍
        ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 2;

        // 畫氣泡本體
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        
        // 修改 2: 實色背景 (白色 #ffffff，不透明)
        ctx.fillStyle = "#ffffff"; 
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${rgb}, 0.8)`;
        ctx.stroke();

        // 畫頭像
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, this.size - 3, 0, Math.PI * 2); // 內縮範圍微調
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.image, -this.size, -this.size, this.size * 2, this.size * 2);
        
        // 畫名字
        ctx.restore();
        ctx.fillStyle = "#5d4037";
        
        // 修改 3: 字體縮小為 11px
        ctx.font = "600 11px 'Noto Sans TC'";
        ctx.textAlign = "center";
        
        const name = this.data.name;
        const textWidth = ctx.measureText(name).width;
        
        // 名字背景條 (實色背景讓字更清楚)
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        // 位置調整: y + size + 間距
        ctx.roundRect(this.x - textWidth/2 - 4, this.y + this.size + 5, textWidth + 8, 16, 8);
        ctx.fill();
        
        ctx.fillStyle = "#5d4037";
        ctx.fillText(name, this.x, this.y + this.size + 17);
    }
}

// ... (後續邏輯保持不變) ...
function updateGuestFilter() {
    if (currentCategoryFilter === 'all') { filteredGuests = [...allGuests]; } 
    else { filteredGuests = allGuests.filter(g => g.category === currentCategoryFilter); }
    playbackQueue = []; 
    const isCrowded = filteredGuests.length > MAX_VISIBLE_STARS;
    if (!isCrowded) { activeStars.forEach(star => star.mode = 'bounce'); }
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
        while (attempts < maxAttempts) {
            const potentialGuest = playbackQueue.pop();
            const isAlreadyOnScreen = activeStars.some(s => s.data.id === potentialGuest.id);
            if (isAlreadyOnScreen) { playbackQueue.unshift(potentialGuest); attempts++; } 
            else { candidate = potentialGuest; break; }
        }
        if (candidate) { activeStars.push(new Bubble(candidate, mode)); } else { break; }
    }
}
function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function renderFilterUI() {
    filterButtons.innerHTML = '';
    filterOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = opt.label;
        if (opt.id === currentCategoryFilter) btn.classList.add('active');
        btn.onclick = () => applyFilter(opt.id);
        filterButtons.appendChild(btn);
    });
    filterSelect.innerHTML = '';
    filterOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.id;
        option.textContent = opt.label;
        filterSelect.appendChild(option);
    });
    filterSelect.onchange = (e) => applyFilter(e.target.value);
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
    filterSelect.value = filterId;
}
function startListening() {
    const q = query(collection(db, "guests"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        loading.style.display = 'none';
        allGuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateGuestFilter();
        spawnStars();
    }, (error) => { console.error(error); loading.textContent = "連線失敗"; });
}
function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = activeStars.length - 1; i >= 0; i--) {
        const bubble = activeStars[i];
        bubble.update(time);
        bubble.draw();
        if (bubble.isDead) activeStars.splice(i, 1);
    }
    spawnStars();
    requestAnimationFrame(animate);
}
renderFilterUI();
startListening();
requestAnimationFrame(animate);
