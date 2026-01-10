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
// 底部保留高度 (避免擋住 Filter Bar)
const BOTTOM_MARGIN = 120; 

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
        // 放寬點擊判定範圍
        if (dist < bubble.size * 1.3) {
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
        const speed = this.mode === 'flow' ? 1.5 : 0.8;
        
        let attempts = 0;
        let valid = false;
        
        // 強制斜向飛行檢查
        while (!valid && attempts < 10) {
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
            if (Math.abs(this.vx) > 0.15 && Math.abs(this.vy) > 0.15) {
                valid = true;
            }
            attempts++;
        }
        
        if (!valid) {
            this.vx = 0.3;
            this.vy = 0.3;
        }

        // 計算有效的 Y 軸範圍 (扣除底部保留區)
        const validHeight = canvas.height - BOTTOM_MARGIN - this.size * 2;

        if (this.mode === 'bounce') {
            this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
            // 修正：生成位置限制在有效高度內，防止一出生就卡在底部
            this.y = Math.random() * validHeight + this.size;
        } else {
            // Flow Mode
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.x = this.vx > 0 ? -this.size * 2 : canvas.width + this.size * 2;
                this.y = Math.random() * validHeight + this.size;
            } else {
                this.x = Math.random() * canvas.width;
                // 垂直進入也要避開底部
                this.y = this.vy > 0 ? -this.size * 2 : validHeight; 
            }
        }
    }

    update(time) {
        this.x += this.vx;
        this.y += this.vy;
        this.y += Math.sin(time * 0.002 + this.floatOffset) * 0.2;
        
        if (this.scale < this.targetScale) this.scale += 0.02;

        // 計算邊界
        const padding = this.size;
        const bottomLimit = canvas.height - BOTTOM_MARGIN - padding;

        if (this.mode === 'bounce') {
            // X 軸反彈
            if (this.x < padding) {
                this.x = padding; 
                this.vx *= -1;
            } else if (this.x > canvas.width - padding) {
                this.x = canvas.width - padding; 
                this.vx *= -1;
            }

            // Y 軸反彈 (加入強制位置修正，防止卡底)
            if (this.y < padding) {
                this.y = padding;
                this.vy *= -1;
            } else if (this.y > bottomLimit) {
                this.y = bottomLimit; // 強制拉回
                this.vy *= -1;
            }
        } else {
            // Flow Mode
            const margin = 150;
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
        
        // 1. 陰影
        ctx.shadowColor = `rgba(${rgb}, 0.5)`;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 2;

        // 2. 氣泡本體
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        
        // 實色背景：純白不透明
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";; 
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${rgb}, 0.9)`;
        ctx.stroke();

        // 3. 畫頭像
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, this.size - 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        ctx.globalAlpha = 1.0;
        ctx.drawImage(this.image, -this.size, -this.size, this.size * 2, this.size * 2);
        
        // (這裡不包含 3.5 高光層)
        
        // 4. 名字標籤
        ctx.restore();
        ctx.font = "bold 11px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        
        const name = this.data.name;
        const textWidth = ctx.measureText(name).width;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.roundRect(this.x - textWidth/2 - 4, this.y + this.size + 5, textWidth + 8, 14, 7);
        ctx.fill();
        
        ctx.fillStyle = "#5d4037";
        ctx.fillText(name, this.x, this.y + this.size + 16);
    }
}

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
    console.log("開始連結 Firebase...");
    const q = query(collection(db, "guests"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        loading.style.display = 'none';
        allGuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`收到 ${allGuests.length} 筆資料`);
        updateGuestFilter();
        spawnStars();
    }, (error) => { 
        console.error("Firebase 連線錯誤:", error); 
        loading.textContent = "連線失敗 (請檢查 Console)"; 
    });
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

