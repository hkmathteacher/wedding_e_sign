// === 第一階段核心：資產準備 (Assets) ===

// 1. SVG 模板庫
// 統一規格：280x280, stroke-width=3, stroke=#2c3e50 (與 Canvas 筆觸一致)
export const assets = {
    // A. 經典表情
    'smile':   { icon: '😊', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="110" r="10" fill="#2c3e50"/><circle cx="180" cy="110" r="10" fill="#2c3e50"/><path d="M80 170 Q140 230 200 170"/></svg>` },
    'laugh':   { icon: '😄', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M90 120 Q100 100 110 120"/><path d="M170 120 Q180 100 190 120"/><path d="M80 160 Q140 240 200 160 Z"/></svg>` },
    'wink':    { icon: '😉', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="90" cy="120" r="8" fill="#2c3e50"/><path d="M170 120 L210 120"/><path d="M100 180 Q140 210 180 180"/></svg>` },
    'shy':     { icon: '😳', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M80 130 L110 130"/><path d="M170 130 L200 130"/><path d="M120 180 L160 180"/><line x1="70" y1="150" x2="90" y2="160" stroke-opacity="0.3"/><line x1="80" y1="145" x2="100" y2="155" stroke-opacity="0.3"/><line x1="190" y1="150" x2="210" y2="160" stroke-opacity="0.3"/><line x1="180" y1="145" x2="200" y2="155" stroke-opacity="0.3"/></svg>` },
    
    // B. 趣味裝飾
    'cool':    { icon: '😎', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M70 110 H210 L200 150 H80 Z" fill="rgba(44, 62, 80, 0.1)"/><path d="M120 190 Q140 200 160 190"/></svg>` },
    'glasses': { icon: '👓', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="120" r="35"/><circle cx="180" cy="120" r="35"/><line x1="135" y1="120" x2="145" y2="120"/><path d="M110 200 Q140 200 170 200"/></svg>` },
    'beard':   { icon: '🧔', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="5" fill="#2c3e50"/><circle cx="180" cy="100" r="5" fill="#2c3e50"/><path d="M100 160 Q140 140 180 160 Q180 190 140 210 Q100 190 100 160"/></svg>` },
    'cat':     { icon: '🐱', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M70 100 L90 50 L120 90 M210 100 L190 50 L160 90"/><circle cx="100" cy="140" r="5"/><circle cx="180" cy="140" r="5"/><path d="M130 170 L140 180 L150 170"/><path d="M140 180 L140 190 M140 190 Q120 200 110 190 M140 190 Q160 200 170 190"/><line x1="60" y1="160" x2="90" y2="160"/><line x1="60" y1="175" x2="90" y2="170"/><line x1="220" y1="160" x2="190" y2="160"/><line x1="220" y1="175" x2="190" y2="170"/></svg>` },
    
    // C. 幾何與抽象
    'crown':   { icon: '👑', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M80 100 L60 60 L100 80 L140 40 L180 80 L220 60 L200 100"/><circle cx="100" cy="140" r="8"/><circle cx="180" cy="140" r="8"/><path d="M120 200 Q140 220 160 200"/></svg>` },
    'line':    { icon: '〰️', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="140" y1="60" x2="140" y2="220"/><line x1="80" y1="120" x2="200" y2="120"/><circle cx="140" cy="140" r="60" stroke-opacity="0.5"/></svg>` },
    'robot':   { icon: '🤖', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="70" y="70" width="140" height="140" rx="20"/><line x1="60" y1="140" x2="70" y2="140"/><line x1="210" y1="140" x2="220" y2="140"/><line x1="140" y1="60" x2="140" y2="70"/><circle cx="110" cy="120" r="10"/><circle cx="170" cy="120" r="10"/><rect x="100" y="160" width="80" height="20" rx="5"/></svg>` },
    'flower':  { icon: '🌸', svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="140" cy="140" r="40"/><path d="M140 100 Q140 60 180 60 Q180 100 140 100"/><path d="M180 140 Q220 140 220 180 Q180 180 180 140"/><path d="M140 180 Q140 220 100 220 Q100 180 140 180"/><path d="M100 140 Q60 140 60 100 Q100 100 100 140"/><circle cx="125" cy="130" r="4" fill="#2c3e50"/><circle cx="155" cy="130" r="4" fill="#2c3e50"/><path d="M130 160 Q140 165 150 160"/></svg>` }
};

// 2. 顏色映射表 (Mapping)
// 將 CSS 變數名稱對應到程式邏輯中
export const categoryColors = {
    'groom_friend': 'var(--c-groom-friend)',
    'bride_friend': 'var(--c-bride-friend)',
    'groom_family': 'var(--c-groom-family)',
    'bride_family': 'var(--c-bride-family)',
    'colleague':    'var(--c-colleague)',
    'classmate':    'var(--c-classmate)',
    'vip':          'var(--c-vip)'
};