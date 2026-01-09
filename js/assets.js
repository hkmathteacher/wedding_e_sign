// === 資產庫 (Assets Library) - 教堂公主風 ===

// 1. 定義畫筆色盤
export const brushColors = [
    { name: 'ink',    hex: '#5d4037', label: '墨咖' }, 
    { name: 'gold',   hex: '#d4af37', label: '香檳金' },
    { name: 'pink',   hex: '#e57373', label: '胭脂粉' },
    { name: 'brown',  hex: '#8d6e63', label: '暖棕' },
    { name: 'green',  hex: '#81c784', label: '森林綠' },
];

// 2. SVG 模板庫 (支援彩色)
export const assets = {
    // A. 基礎表情
    'base_smile': { 
        icon: '🙂', 
        svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 100 V160 Q70 230 140 230 Q210 230 210 160 V100" stroke="#eee" stroke-width="2"/>
            <circle cx="80" cy="140" r="10" fill="#e57373" stroke="none" opacity="0.4"/>
            <circle cx="200" cy="140" r="10" fill="#e57373" stroke="none" opacity="0.4"/>
            <circle cx="100" cy="130" r="8" fill="#5d4037"/>
            <circle cx="180" cy="130" r="8" fill="#5d4037"/>
            <path d="M90 180 Q140 220 190 180"/>
        </svg>` 
    },
    'base_wink': { 
        icon: '😉', 
        svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 100 V160 Q70 230 140 230 Q210 230 210 160 V100" stroke="#eee" stroke-width="2"/>
            <path d="M90 130 L110 130"/>
            <circle cx="180" cy="130" r="8" fill="#5d4037"/>
            <path d="M100 180 Q140 210 180 180"/>
            <circle cx="200" cy="140" r="10" fill="#e57373" stroke="none" opacity="0.4"/>
        </svg>` 
    },

    // B. 髮型與人物
    'hair_short': { 
        icon: '👦', 
        svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 140 V160 Q60 230 140 230 Q220 230 220 160 V140" fill="#fff"/>
            <path d="M60 140 Q60 40 140 40 Q220 40 220 140 L220 130 Q180 70 140 80 Q100 70 60 130 Z" fill="#5d4037" stroke="none"/>
            <path d="M60 140 Q60 40 140 40 Q220 40 220 140" stroke="#5d4037"/>
            <path d="M60 140 Q100 80 140 90 Q180 80 220 140" stroke="#5d4037"/>
            <circle cx="100" cy="140" r="6" fill="#5d4037"/>
            <circle cx="180" cy="140" r="6" fill="#5d4037"/>
            <path d="M110 190 Q140 200 170 190"/>
        </svg>` 
    },
    'hair_long': { 
        icon: '👩', 
        svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M80 60 Q140 20 200 60 L220 260 H200 L200 100 Q140 140 70 100 L70 260 H60 L80 60 Z" fill="#8d6e63" stroke="none" opacity="0.8"/>
            <path d="M80 60 Q140 20 200 60" stroke="#8d6e63"/>
            <path d="M80 60 L60 260" stroke="#8d6e63"/>
            <path d="M200 60 L220 260" stroke="#8d6e63"/>
            <path d="M70 120 V170 Q70 230 140 230 Q210 230 210 170 V120" fill="#fff"/>
            <path d="M70 120 Q140 160 210 120" stroke="#8d6e63"/>
            <circle cx="100" cy="140" r="6" fill="#5d4037"/>
            <circle cx="180" cy="140" r="6" fill="#5d4037"/>
            <path d="M110 190 Q140 210 170 190"/>
        </svg>` 
    },

    // C. 配件
    'prop_crown': { 
        icon: '👑', 
        svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M80 80 L60 40 L100 60 L140 20 L180 60 L220 40 L200 80 Z" fill="#d4af37" stroke="#bfa15f"/>
            <circle cx="60" cy="40" r="3" fill="#e57373" stroke="none"/>
            <circle cx="140" cy="20" r="3" fill="#e57373" stroke="none"/>
            <circle cx="220" cy="40" r="3" fill="#e57373" stroke="none"/>
            <path d="M70 100 V160 Q70 230 140 230 Q210 230 210 160 V100"/>
            <circle cx="100" cy="140" r="6" fill="#5d4037"/>
            <circle cx="180" cy="140" r="6" fill="#5d4037"/>
            <path d="M110 190 Q140 180 170 190"/>
        </svg>` 
    },
    'prop_glasses': { 
        icon: '👓', 
        svg: `<svg viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 120 V170 Q70 230 140 230 Q210 230 210 170 V120"/>
            <path d="M70 120 Q70 60 140 60 Q210 60 210 120" stroke-dasharray="10 5" stroke="#8d6e63"/>
            <circle cx="100" cy="150" r="30" stroke="#e57373" stroke-width="4"/>
            <circle cx="180" cy="150" r="30" stroke="#e57373" stroke-width="4"/>
            <line x1="130" y1="150" x2="150" y2="150" stroke="#e57373" stroke-width="4"/>
            <path d="M70 150 L50 140" stroke="#e57373"/>
            <path d="M210 150 L230 140" stroke="#e57373"/>
            <path d="M120 210 Q140 220 160 210"/>
        </svg>` 
    }
};

// 3. 類別顏色映射 (粉嫩公主系)
export const categoryColors = {
    'groom_friend': 'var(--c-groom-friend)',
    'bride_friend': 'var(--c-bride-friend)',
    'groom_family': 'var(--c-groom-family)',
    'bride_family': 'var(--c-bride-family)',
    'colleague':    'var(--c-colleague)',
    'classmate':    'var(--c-classmate)',
    'vip':          'var(--c-vip)'
};