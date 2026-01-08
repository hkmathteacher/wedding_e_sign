import { assets, categoryColors } from './assets.js';

// === DOM 元素 ===
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const templateGrid = document.getElementById('templateGrid');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const submitBtn = document.getElementById('submitBtn');
const categorySelect = document.getElementById('guestCategory');
const canvasWrapper = document.getElementById('canvasWrapper');

// === 狀態變數 ===
let isDrawing = false;
let historyStack = []; // 儲存繪圖步驟以供 Undo
const MAX_HISTORY = 10; // 最多復原 10 步

// === 1. 初始化 (Init) ===

function init() {
    initCanvas();
    renderTemplates();
    bindEvents();
    updateCategoryColor(); // 初始顏色設定
    saveState(); // 儲存初始白紙狀態
}

// 設定畫筆物理屬性
function initCanvas() {
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// === 2. 繪圖核心 (Drawing Core) ===

// 取得精確座標 (支援 Mouse & Touch)
function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (evt.touches && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    } else {
        clientX = evt.clientX;
        clientY = evt.clientY;
    }

    // 計算 CSS 尺寸與實際像素的比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDraw(e) {
    // 只有左鍵才畫 (滑鼠)
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    // 防止手機滾動頁面
    if(e.cancelable) e.preventDefault();
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    if(e.cancelable) e.preventDefault();
}

function endDraw(e) {
    if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
        saveState(); // 畫完一筆，存一次檔
    }
}

// === 3. 歷史紀錄與操作 (History & Actions) ===

function saveState() {
    if (historyStack.length >= MAX_HISTORY) {
        historyStack.shift(); // 移除最舊的
    }
    // 將當前畫布轉為 Base64 字串存起來
    historyStack.push(canvas.toDataURL());
}

function undo() {
    if (historyStack.length <= 1) {
        // 如果只剩一張白紙，就清空
        clearCanvas(false);
        return;
    }
    
    historyStack.pop(); // 移除當前狀態
    const prevState = historyStack[historyStack.length - 1]; // 取得上一步
    
    const img = new Image();
    img.src = prevState;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

function clearCanvas(saveToHistory = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvas(); // 確保畫筆設定還在
    if (saveToHistory) saveState();
}

// === 4. 模板與 UI 邏輯 ===

function renderTemplates() {
    Object.keys(assets).forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'tpl-btn';
        btn.innerHTML = assets[key].icon;
        // 使用 touchstart 讓手機反應更快，click 作為備用
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            applyTemplate(key);
        });
        templateGrid.appendChild(btn);
    });
}

function applyTemplate(key) {
    // 模板是蓋上去還是清空重畫？這裡設計為「清空重畫」以保持極簡
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const svgString = assets[key].svg;
    const img = new Image();
    const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        initCanvas();
        saveState(); // 套用模板也算一步
    };
    img.src = url;
}

function updateCategoryColor() {
    const colorVar = categoryColors[categorySelect.value] || '#2c3e50';
    // 改變畫布邊框顏色
    canvasWrapper.style.borderColor = colorVar;
    // 改變下拉選單左側顏色條
    categorySelect.style.borderLeftColor = colorVar;
}

// === 5. 資料送出 (Submission) ===

function handleSubmit() {
    const name = document.getElementById('guestName').value.trim();
    const category = categorySelect.value;
    const message = document.getElementById('guestMessage').value.trim();

    if (!name) {
        alert('請留下您的尊姓大名 😉');
        document.getElementById('guestName').focus();
        return;
    }

    // 取得最終圖片
    const imageData = canvas.toDataURL('image/png');

    // 打包資料
    const payload = {
        name,
        category,
        message,
        imageData, // 這是一個很長的 Base64 字串
        timestamp: new Date().toISOString()
    };

    console.log('📦 Data Prepared:', payload);

    // 顯示模擬結果
    const debug = document.getElementById('debug-console');
    debug.style.display = 'block';
    debug.innerHTML = `<strong>模擬傳送成功!</strong><br>
                       Name: ${name}<br>
                       Size: ${Math.round(imageData.length/1024)} KB`;

    alert(`謝謝 ${name}！\n您的祝福已準備好飛向星空！`);
}

// === 6. 事件綁定 (Event Binding) ===

function bindEvents() {
    // 1. Mouse Events
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);
    
    // 2. Touch Events (Mobile)
    // passive: false 是必須的，否則無法 preventDefault 滾動
    canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('touchend', endDraw);

    // 3. UI Buttons
    undoBtn.addEventListener('click', undo);
    clearBtn.addEventListener('click', () => clearCanvas(true));
    submitBtn.addEventListener('click', handleSubmit);
    
    // 4. Input Changes
    categorySelect.addEventListener('change', updateCategoryColor);
}

// 啟動
init();