import { db } from './firebase.js'; // 使用共用設定
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// DOM 元素
const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
const loading = document.getElementById('loading');
const filterButtons = document.getElementById('filterButtons');
const filterSelect = document.getElementById('filterSelect');
const modalOverlay = document.getElementById('modalOverlay');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalMsg = document.getElementById('modalMsg');

const MAX_VISIBLE_STARS = 30; // 畫面最多同時顯示數量

// 資料
let allGuests = [];
let filteredGuests = [];
let activeStars = []; // 現在是 Active Bubbles
let playbackQueue = [];
let currentCategoryFilter = 'all';

// 顏色映射 (轉為 CSS 變數風格的 RGB，用於氣泡光暈)
const colorMap = {
    'groom_friend': '144, 202, 249', // 藍
    'bride_friend': '255, 128, 171', // 粉
    'groom_family': '129, 212, 250', // 青
    'bride_family': '244, 143, 177', // 桃
    'colleague':    '165, 214, 167', // 綠
    'classmate':    '206, 147, 216', // 紫
    'vip':          '255, 202, 40',  // 金
    'default':      '212, 175, 55'   // 香檳金
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

// === 1. 初始化與事件 ===
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 點擊互動偵測
canvas.addEventListener('click', (e) => {
    // 取得點擊座標
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 倒序迴圈 (從最上層的泡泡開始檢查)
    for (let i = activeStars.length - 1; i >= 0; i--) {
        const bubble = activeStars[i];
        
        // 計算距離 (圓形碰撞檢測)
        const dist = Math.hypot(clickX - bubble.x, clickY - bubble.y);
        
        // 如果點擊在泡泡範圍內 (放寬一點點判定範圍 * 1.1)
        if (dist < bubble.size * 1.1) {
            openModal(bubble.data);
            break; // 只觸發最上面那一個
        }
    }
});

function openModal(data) {
    modalImg.src = data.imageData;
    modalName.textContent = data.name;
    modalMsg.textContent = data.message || "（沒有留下訊息）";
    
    modalOverlay.style.display = 'flex';
    // 稍微延遲加 class 以觸發 CSS transition
    requestAnimationFrame(() => modalOverlay.classList.add('show'));
}

// === 2. 泡泡物件 (Bubble Class) ===
// 取代原本的 Star，改為氣泡風格
class Bubble {
    constructor(data, mode) {
        this.data = data;
        this.mode = mode; // 'bounce' or 'flow'
        
        this.size = 65; // 稍微大一點
        this.image = new Image();
        this.image.src = data.imageData;
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; };

        // 呼吸效果
        this.scale = 0; // 進場從小變大
        this.targetScale = 1;
        this.floatOffset = Math.random() * 100; // 上下漂浮的相位差

        this.initPosition();
    }

    initPosition() {
        const speed = this.mode === 'flow' ? 1.2 : 0.6;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        
        // 確保不會靜止
        if (Math.abs(this.vx) < 0.2) this.vx = 0.3;
        if (Math.abs(this.vy) < 0.2) this.vy = 0.3;

        if (this.mode === 'bounce') {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        } else {
            // Flow: 從邊界外飛入
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

        // 上下輕微漂浮 (模擬氣泡感)
        this.y += Math.sin(time * 0.002 + this.floatOffset) * 0.2;

        // 進場動畫
        if (this.scale < this.targetScale) this.scale += 0.02;

        // 邊界邏輯
        if (this.mode === 'bounce') {
            const padding = this.size;
            if (this.x < padding || this.x > canvas.width - padding) this.vx *= -1;
            if (this.y < padding || this.y > canvas.height - padding) this.vy *= -1;
        } else {
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

        // 1. 畫陰影 (柔和的光暈)
        const rgb = colorMap[this.data.category] || colorMap['default'];
        ctx.shadowColor = `rgba(${rgb}, 0.6)`;
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;

        // 2. 畫圓形外框 (金邊/彩邊)
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; // 氣泡底色
        ctx.fill();
        
        // 邊框
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(${rgb}, 0.8)`; // 依照類別顏色的邊框
        ctx.stroke();

        // 3. 畫頭像 (裁切)
        ctx.shadowBlur = 0; // 圖片不要陰影
        ctx.beginPath();
        ctx.arc(0, 0, this.size - 5, 0, Math.PI * 2); // 稍微內縮
        ctx.closePath();
        ctx.clip();
        // 繪製圖片
        ctx.drawImage(this.image, -this.size, -this.size, this.size * 2, this.size * 2);
        
        // 4. 畫名字 (在氣泡下方)
        ctx.restore();
        ctx.fillStyle = "#5d4037"; // 深咖啡色字體
        ctx.font = "600 14px 'Noto Sans TC'"; // 加粗
        ctx.textAlign = "center";
        
        // 名字背景 (讓字更清楚)
        const name = this.data.name;
        const textWidth = ctx.measureText(name).width;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.roundRect(this.x - textWidth/2 - 5, this.y + this.size + 10, textWidth + 10, 20, 10);
        ctx.fill();
        
        ctx.fillStyle = "#5d4037";
        ctx.fillText(name, this.x, this.y + this.size + 25);
    }
}

// === 3. 管理器邏輯 (維持之前的防重疊演算法) ===
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
            activeStars.push(new Bubble(candidate, mode));
        } else {
            break;
        }
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

// === 4. UI 渲染 (同時處理 按鈕 和 Select) ===
function renderFilterUI() {
    // A. 渲染按鈕 (PC)
    filterButtons.innerHTML = '';
    filterOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = opt.label;
        if (opt.id === currentCategoryFilter) btn.classList.add('active');
        btn.onclick = () => applyFilter(opt.id);
        filterButtons.appendChild(btn);
    });

    // B. 渲染下拉選單 (Mobile)
    filterSelect.innerHTML = '';
    filterOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.id;
        option.textContent = opt.label;
        filterSelect.appendChild(option);
    });
    // 監聽 Select 變化
    filterSelect.onchange = (e) => applyFilter(e.target.value);
}

function applyFilter(filterId) {
    if (currentCategoryFilter === filterId) return;
    currentCategoryFilter = filterId;
    updateGuestFilter();
    activeStars = []; 
    spawnStars();
    
    // 同步更新 UI 狀態
    // 1. 更新按鈕
    document.querySelectorAll('.filter-btn').forEach((btn, index) => {
        if (filterOptions[index].id === filterId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    // 2. 更新 Select
    filterSelect.value = filterId;
}

// === 5. 核心監聽 ===
function startListening() {
    const q = query(collection(db, "guests"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        loading.style.display = 'none';
        allGuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateGuestFilter();
        spawnStars();
    }, (error) => {
        console.error(error);
        loading.textContent = "連線失敗";
    });
}

// === 6. 動畫迴圈 ===
function animate(time) {
    // 清除畫布 (透明背景，露出 HTML 的漸層底色)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = activeStars.length - 1; i >= 0; i--) {
        const bubble = activeStars[i];
        bubble.update(time); // 傳入時間給漂浮動畫用
        bubble.draw();
        if (bubble.isDead) activeStars.splice(i, 1);
    }
    spawnStars();
    requestAnimationFrame(animate);
}

// 啟動
renderFilterUI();
startListening();
requestAnimationFrame(animate);
