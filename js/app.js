import { assets, categoryColors, brushColors } from './assets.js';
import { saveToCloud } from './firebase.js';

// DOM
const landingPage = document.getElementById('landingPage');
const drawingPage = document.getElementById('drawingPage');
const introOverlay = document.getElementById('introOverlay');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const submitBtn = document.getElementById('submitBtn');
const templateGrid = document.getElementById('templateGrid');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const categorySelect = document.getElementById('guestCategory');
const canvasWrapper = document.getElementById('canvasWrapper');
const colorPalette = document.getElementById('colorPalette');
const btnGoDraw = document.getElementById('btnGoDraw');
const btnGoWall = document.getElementById('btnGoWall');
const btnBackHome = document.getElementById('btnBackHome');
const btnGoWallFromDraw = document.getElementById('btnGoWallFromDraw');

let isDrawing = false;
let historyStack = [];
let currentColor = '#5d4037'; 
const MAX_HISTORY = 10;

function init() {
    initCanvas(); // 初始化畫布(含底圖)
    renderColorPalette();
    renderTemplates();
    bindEvents();
    updateCategoryColor();
    saveState(); // 儲存初始空白(含底圖)狀態
    
    handleIntroAnimation();
}

function handleIntroAnimation() {
    // 縮短動畫時間至 4.5s (文字動畫較快)
    setTimeout(() => {
        introOverlay.classList.add('fade-out');
        setTimeout(() => { introOverlay.style.display = 'none'; }, 800); 
    }, 4500); 
}

// === 核心：畫布邏輯 ===

function initCanvas() {
    // 設定畫筆
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// 繪製固定臉型底圖 (Guide)
function drawBaseFace() {
    ctx.save();
    // 畫一個淡淡的圓臉輪廓
    ctx.strokeStyle = '#e0e0e0'; // 極淡灰色
    ctx.lineWidth = 2;
    ctx.beginPath();
    // 參數: x, y, radius, startAngle, endAngle
    ctx.arc(140, 140, 90, 0, Math.PI * 2); 
    ctx.stroke();
    
    // 畫淡淡的十字線輔助 (選用)
    // ctx.beginPath();
    // ctx.moveTo(140, 60); ctx.lineTo(140, 220);
    // ctx.moveTo(80, 140); ctx.lineTo(200, 140);
    // ctx.stroke();
    
    ctx.restore();
}

function clearCanvas(saveToHistory = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBaseFace(); // 清除後立刻補上底圖
    initCanvas();   // 恢復畫筆設定
    if (saveToHistory) saveState();
}

// === 模板功能改為「疊加 (Overlay)」 ===
function applyTemplate(key) {
    // 注意：這裡移除了 clearCanvas()，改為直接疊加
    
    const svgString = assets[key].svg;
    const img = new Image();
    const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0); // 蓋在當前畫面上
        URL.revokeObjectURL(url);
        initCanvas(); // 確保畫完後畫筆狀態正確
        saveState();  // 記錄這一筆操作
    };
    img.src = url;
}

// Navigation
function showDrawing() {
    landingPage.classList.add('hidden');
    drawingPage.classList.remove('hidden');
    // 進來時若畫布是空的(或只有底圖)，可以再次確保尺寸正確
    // initCanvas(); 
}
function showLanding() {
    drawingPage.classList.add('hidden');
    landingPage.classList.remove('hidden');
}
function goToWall() { window.location.href = 'wall.html'; }

// Drawing Events
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}
function startDraw(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if(e.cancelable) e.preventDefault();
}
function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if(e.cancelable) e.preventDefault();
}
function endDraw(e) { if (isDrawing) { isDrawing = false; ctx.closePath(); saveState(); } }

function saveState() {
    if (historyStack.length >= MAX_HISTORY) historyStack.shift();
    historyStack.push(canvas.toDataURL());
}
function undo() {
    if (historyStack.length <= 1) { 
        clearCanvas(false); 
        return; 
    }
    historyStack.pop();
    const prevState = historyStack[historyStack.length - 1];
    const img = new Image();
    img.src = prevState;
    img.onload = () => { 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.drawImage(img, 0, 0); 
    };
}

// UI
function renderColorPalette() {
    colorPalette.innerHTML = '';
    brushColors.forEach((color, index) => {
        const btn = document.createElement('div');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color.hex;
        if (index === 0) btn.classList.add('active');
        btn.addEventListener('click', () => changeColor(color.hex, btn));
        colorPalette.appendChild(btn);
    });
}
function changeColor(hex, btn) {
    currentColor = hex;
    ctx.strokeStyle = hex;
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}
function renderTemplates() {
    templateGrid.innerHTML = '';
    Object.keys(assets).forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'tpl-btn';
        btn.innerHTML = assets[key].icon;
        btn.addEventListener('click', (e) => { e.preventDefault(); applyTemplate(key); });
        templateGrid.appendChild(btn);
    });
}
function updateCategoryColor() {
    const colorVar = categoryColors[categorySelect.value] || '#5d4037';
    canvasWrapper.style.boxShadow = `0 0 0 4px #fff, 0 0 20px ${colorVar}`;
    categorySelect.style.borderLeft = `5px solid ${colorVar}`;
}

// Submit
async function handleSubmit() {
    const name = document.getElementById('guestName').value.trim();
    const category = categorySelect.value;
    const message = document.getElementById('guestMessage').value.trim();

    if (!name) { alert('請留下您的尊姓大名 😉'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = '🚀 正在傳送...';

    try {
        const imageData = canvas.toDataURL('image/png');
        await saveToCloud({ name, category, message, imageData });
        alert('發送成功！快去星空牆找找你的作品吧！');
        submitBtn.classList.add('hidden');
        btnGoWallFromDraw.classList.remove('hidden');
    } catch (error) {
        console.error("Upload Error:", error);
        alert('傳送失敗，請再試一次');
        submitBtn.disabled = false;
        submitBtn.textContent = '✨ 簽到並傳送 ✨';
    }
}

function bindEvents() {
    btnGoDraw.addEventListener('click', showDrawing);
    btnGoWall.addEventListener('click', goToWall);
    btnBackHome.addEventListener('click', showLanding);
    btnGoWallFromDraw.addEventListener('click', goToWall);
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);
    canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('touchend', endDraw);
    undoBtn.addEventListener('click', undo);
    clearBtn.addEventListener('click', () => clearCanvas(true));
    submitBtn.addEventListener('click', handleSubmit);
    categorySelect.addEventListener('change', updateCategoryColor);
    
    // 第一次初始化確保有底圖
    drawBaseFace();
}

init();
