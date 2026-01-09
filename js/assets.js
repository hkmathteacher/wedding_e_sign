// === 資產庫 (Assets Library) ===

export const brushColors = [
    { name: 'ink',    hex: '#5d4037', label: '墨咖' }, 
    { name: 'gold',   hex: '#d4af37', label: '香檳金' },
    { name: 'red',    hex: '#ef5350', label: '熱情紅' },
    { name: 'pink',   hex: '#f48fb1', label: '櫻花粉' },
    { name: 'blue',   hex: '#4fc3f7', label: '天空藍' },
    { name: 'green',  hex: '#81c784', label: '森林綠' },
];

// 獨立配件 (Props) - 點擊後會「疊加」在畫布上
export const assets = {
    // 臉部特徵
    'blush': { icon: '😳', svg: `<svg viewBox="0 0 280 280"><circle cx="70" cy="150" r="15" fill="#f48fb1" opacity="0.4"/><circle cx="210" cy="150" r="15" fill="#f48fb1" opacity="0.4"/></svg>` },
    'beard': { icon: '🧔', svg: `<svg viewBox="0 0 280 280"><path d="M100 170 Q140 190 180 170 Q180 210 140 230 Q100 210 100 170" fill="#5d4037"/></svg>` },
    'mustache': { icon: '👨', svg: `<svg viewBox="0 0 280 280"><path d="M140 170 Q160 150 190 160 Q180 170 140 175 Q100 170 90 160 Q120 150 140 170" fill="#5d4037"/></svg>` },
    
    // 眼鏡
    'glasses_round': { icon: '👓', svg: `<svg viewBox="0 0 280 280"><circle cx="100" cy="140" r="25" fill="none" stroke="#5d4037" stroke-width="3"/><circle cx="180" cy="140" r="25" fill="none" stroke="#5d4037" stroke-width="3"/><line x1="125" y1="140" x2="155" y2="140" stroke="#5d4037" stroke-width="3"/></svg>` },
    'glasses_sun': { icon: '😎', svg: `<svg viewBox="0 0 280 280"><path d="M70 130 H130 V150 Q100 170 70 150 Z" fill="#333"/><path d="M150 130 H210 V150 Q180 170 150 150 Z" fill="#333"/><line x1="130" y1="130" x2="150" y2="130" stroke="#333" stroke-width="3"/></svg>` },
    
    // 頭飾
    'crown': { icon: '👑', svg: `<svg viewBox="0 0 280 280"><path d="M90 90 L70 50 L110 70 L140 30 L170 70 L210 50 L190 90 Z" fill="#d4af37" stroke="#bfa15f" stroke-width="2"/></svg>` },
    'veil': { icon: '👰', svg: `<svg viewBox="0 0 280 280"><path d="M80 80 Q140 40 200 80 L220 200 Q140 220 60 200 Z" fill="#fff" opacity="0.6" stroke="#eee" stroke-width="2"/></svg>` },
    'bow': { icon: '🎀', svg: `<svg viewBox="0 0 280 280"><path d="M140 60 Q120 40 100 60 L140 80 L180 60 Q160 40 140 60" fill="#f48fb1"/><circle cx="140" cy="70" r="5" fill="#f06292"/></svg>` },
    'flower': { icon: '🌸', svg: `<svg viewBox="0 0 280 280"><circle cx="200" cy="80" r="15" fill="#f48fb1"/><circle cx="200" cy="80" r="5" fill="#fff"/></svg>` },
    
    // 趣味
    'cat_ears': { icon: '🐱', svg: `<svg viewBox="0 0 280 280"><path d="M80 90 L70 40 L110 80" fill="#ffcc80" stroke="#ffb74d" stroke-width="2"/><path d="M200 90 L210 40 L170 80" fill="#ffcc80" stroke="#ffb74d" stroke-width="2"/></svg>` },
    'heart': { icon: '💖', svg: `<svg viewBox="0 0 280 280"><path d="M220 200 Q240 180 220 160 Q200 180 180 200 L220 240 Z" fill="#e57373" transform="rotate(-15 220 200)"/></svg>` }
};

export const categoryColors = {
    'groom_friend': 'var(--c-groom-friend)',
    'bride_friend': 'var(--c-bride-friend)',
    'groom_family': 'var(--c-groom-family)',
    'bride_family': 'var(--c-bride-family)',
    'colleague':    'var(--c-colleague)',
    'classmate':    'var(--c-classmate)',
    'vip':          'var(--c-vip)'
};
