import { assets } from './assets.js';

// === 第一階段核心：筆觸設定 (Brush Settings) ===

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const templateGrid = document.getElementById('templateGrid');
const clearBtn = document.getElementById('clearBtn');

// 1. 初始化 Canvas 物理屬性
// 這是風格統一的關鍵：確保手繪線條圓潤且寬度與 SVG 模板一致
function initCanvas() {
    ctx.strokeStyle = '#2c3e50'; // 對應 CSS var(--ink-color)
    ctx.lineWidth = 3;           // 對應 SVG stroke-width="3"
    ctx.lineCap = 'round';       // 線條端點圓潤
    ctx.lineJoin = 'round';      // 轉折處圓潤
}

// 2. 渲染資產 (Assets Rendering)
// 將 assets.js 中的模板生成為按鈕
function renderAssets() {
    Object.keys(assets).forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'tpl-btn';
        btn.innerHTML = assets[key].icon; // 顯示 Emoji
        btn.title = key;
        
        // 點擊事件：將 SVG 畫到 Canvas 上
        btn.addEventListener('click', () => drawTemplateToCanvas(key));
        templateGrid.appendChild(btn);
    });
}

// 3. 模板繪製邏輯
// 將 SVG 字串轉換為 Canvas 點陣圖
function drawTemplateToCanvas(key) {
    // 先清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const svgString = assets[key].svg;
    const img = new Image();
    // 建立 Blob 物件，讓瀏覽器把 SVG 當作圖片讀取
    const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        initCanvas(); // 重置筆觸設定，避免被重設
    };
    img.src = url;
}

// 簡單的清除功能 (第一階段測試用)
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvas();
});

// 啟動
initCanvas();
renderAssets();