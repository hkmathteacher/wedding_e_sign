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
const BOTTOM_MARGIN = 140; 
// 限制 dpr 最大為 2，保證效能
const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    // 全域縮放，讓邏輯座標對齊物理像素
    ctx.scale(dpr, dpr);
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
        
        // 氣泡快取 (Off-screen canvas)
        this.cacheCanvas = null;
        
        this.image = new Image();
        this.image.src = data.imageData;
        this.loaded = false;
        this.image.onload = () => { 
            this.loaded = true;
            this.createCache(); // 圖片載入後立即建立快取
        };
        
        this.scale = 0; 
        this.targetScale = 1;
        this.floatOffset = Math.random() * 100;
        
        this.initPosition();
    }

    // ★ 核心優化：建立靜態快取 ★
    // 把複雜的濾鏡、疊加、文字繪製運算只做一次，存成圖片
    createCache() {
        const padding = 20; // 預留陰影和文字空間
        const diameter = this.size * 2;
        const canvasSize = diameter + padding * 2; // 邏輯尺寸
        
        // 建立離屏 Canvas
        const c = document.createElement('canvas');
        c.width = canvasSize * dpr; // 物理尺寸
        c.height = (canvasSize + 30) * dpr; // 預留下方文字高度
        const cx = c.getContext('2d');
        cx.scale(dpr, dpr); // 縮放
        
        // 將原點移到氣泡中心 (相對快取畫布)
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        cx.translate(centerX, centerY);
        
        const rgb = colorMap[this.data.category] || colorMap['default'];

        // 1. 陰影
        cx.shadowColor = `rgba(${rgb}, 0.5)`;
        cx.shadowBlur = 10;
        cx.shadowOffsetY = 2;

        // 2. 氣泡背景
        cx.beginPath();
        cx.arc(0, 0, this.size, 0, Math.PI * 2);
        cx.fillStyle = "#FFFFFF"; 
        cx.fill();
        
        cx.lineWidth = 2;
        cx.strokeStyle = `rgba(${rgb}, 0.9)`;
        cx.stroke();

        // 3. 畫頭像 (裁切與濾鏡)
        cx.shadowBlur = 0;
        cx.save();
        cx.beginPath();
        cx.arc(0, 0, this.size - 2, 0, Math.PI * 2);
        cx.closePath();
        cx.clip();
        
        // 濾鏡與疊加 (只在這裡運算一次！)
        cx.filter = "contrast(1.5) saturate(1.2)";
        cx.imageSmoothingEnabled = false;
        
        const s = this.size * 2;
        const offset = -this.size;
        // 疊加 8 次確保深色
        for(let k=0; k<8; k++) cx.drawImage(this.image, offset, offset, s, s);
        
        cx.restore(); // 移除 clip 和 filter

        // 4. 名字標籤
        cx.font = "bold 11px 'Noto Sans TC', sans-serif";
        cx.textAlign = "center";
        
        const name = this.data.name;
        const textWidth = cx.measureText(name).width;
        
        cx.fillStyle = "rgba(255, 255, 255, 0.9)";
        if (cx.roundRect) {
            cx.beginPath();
            cx.roundRect(-textWidth/2 - 4, this.size + 5, textWidth + 8, 14, 7);
            cx.fill();
        } else {
            cx.fillRect(-textWidth/2 - 4, this.size + 5, textWidth + 8, 14);
        }
        
        cx.fillStyle = "#5d4037";
        cx.fillText(name, 0, this.size + 16);
        
        // 儲存快取
        this.cacheCanvas = c;
        // 計算繪製時的偏移量 (因為原點在中心)
        this.cacheOffsetX = -centerX;
        this.cacheOffsetY = -centerY;
        // 邏輯尺寸 (繪製時用)
        this.cacheLogicalW = c.width / dpr;
        this.cacheLogicalH = c.height / dpr;
    }

    initPosition() {
        const speed = this.mode === 'flow' ? 1.5 : 0.8;
        let attempts = 0;
        let valid = false;
        
        while (!valid && attempts < 10) {
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
            if (Math.abs(this.vx) > 0.15 && Math.abs(this.vy) > 0.15) valid = true;
            attempts++;
        }
        if (!valid) { this.vx = 0.3; this.vy = 0.3; }

        const validHeight = (canvas.height / dpr) - BOTTOM_MARGIN - this.size * 2;
        const logicalWidth = canvas.width / dpr;

        if (this.mode === 'bounce') {
            this.x = Math.random() * (logicalWidth - this.size * 2) + this.size;
            this.y = Math.random() * validHeight + this.size;
        } else {
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.x = this.vx > 0 ? -this.size * 2 : logicalWidth + this.size * 2;
                this.y = Math.random() * validHeight + this.size;
            } else {
                this.x = Math.random() * logicalWidth;
                this.y = this.vy > 0 ? -this.size * 2 : validHeight; 
            }
        }
    }

    update(time) {
        this.x += this.vx;
        this.y += this.vy;
        this.y += Math.sin(time * 0.002 + this.floatOffset) * 0.2;
        
        if (this.scale < this.targetScale) this.scale += 0.02;

        const logicalWidth = canvas.width / dpr;
        const logicalHeight = canvas.height / dpr;

        if (this.mode === 'bounce') {
            const padding = this.size;
            const bottomLimit = logicalHeight - BOTTOM_MARGIN - padding;

            if (this.x < padding) { this.x = padding; this.vx *= -1; } 
            else if (this.x > logicalWidth - padding) { this.x = logicalWidth - padding; this.vx *= -1; }

            if (this.y < padding) { this.y = padding; this.vy *= -1; } 
            else if (this.y > bottomLimit) { this.y = bottomLimit; this.vy = -Math.abs(this.vy); }
        } else {
            const margin = 150;
            if ((this.vx > 0 && this.x > logicalWidth + margin) || 
                (this.vx < 0 && this.x < -margin) || 
                (this.vy > 0 && this.y > logicalHeight + margin) || 
                (this.vy < 0 && this.y < -margin)) {
                this.isDead = true;
            }
        }
    }

    draw() {
        // 如果有快取，直接畫快取圖片 (效能極快)
        if (this.cacheCanvas) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.scale, this.scale);
            
            // 繪製快取 Canvas
            ctx.drawImage(
                this.cacheCanvas, 
                this.cacheOffsetX, 
                this.cacheOffsetY, 
                this.cacheLogicalW, 
                this.cacheLogicalH
            );
            
            ctx.restore();
        }
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
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置為物理像素
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    for (let i = activeStars.length - 1; i >= 0; i--) {
        const bubble = activeStars[i];
        bubble.update(time);
        bubble.draw(); // 現在 draw 只是貼上一張圖，超快
        if (bubble.isDead) activeStars.splice(i, 1);
    }
    spawnStars();
    requestAnimationFrame(animate);
}

renderFilterUI();
startListening();
requestAnimationFrame(animate);
