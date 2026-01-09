// === 資產庫 (Assets Library) ===

export const brushColors = [
    { name: 'ink',    hex: '#5d4037', label: '墨咖' }, 
    { name: 'gold',   hex: '#d4af37', label: '香檳金' },
    { name: 'red',    hex: '#ef5350', label: '熱情紅' },
    { name: 'pink',   hex: '#f48fb1', label: '櫻花粉' },
    { name: 'blue',   hex: '#4fc3f7', label: '天空藍' },
    { name: 'green',  hex: '#81c784', label: '森林綠' },
];

// SVG 模板庫
// ⚠️ 重要：每個 SVG 標籤必須包含 xmlns="http://www.w3.org/2000/svg" 屬性，否則無法繪製
export const assets = {
    // === A. 基礎表情 (Faces) ===
    'face_smile': { 
        icon: '🙂', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="100" cy="130" r="8" fill="#5d4037"/>
            <circle cx="180" cy="130" r="8" fill="#5d4037"/>
            <path d="M90 180 Q140 220 190 180"/>
        </svg>` 
    },
    'face_wink': { 
        icon: '😉', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M90 130 L110 130"/>
            <circle cx="180" cy="130" r="8" fill="#5d4037"/>
            <path d="M100 180 Q140 210 180 180"/>
        </svg>` 
    },
    'face_laugh': { 
        icon: '😆', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M80 130 Q100 110 120 130"/>
            <path d="M160 130 Q180 110 200 130"/>
            <path d="M90 170 Q140 230 190 170 Z"/>
        </svg>` 
    },
    'face_shy': { 
        icon: '😳', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none" stroke="#5d4037" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="100" cy="130" r="6" fill="#5d4037"/>
            <circle cx="180" cy="130" r="6" fill="#5d4037"/>
            <line x1="80" y1="150" x2="100" y2="160" stroke="#f48fb1" opacity="0.6"/>
            <line x1="90" y1="150" x2="110" y2="160" stroke="#f48fb1" opacity="0.6"/>
            <line x1="180" y1="150" x2="200" y2="160" stroke="#f48fb1" opacity="0.6"/>
            <line x1="170" y1="150" x2="190" y2="160" stroke="#f48fb1" opacity="0.6"/>
            <path d="M120 180 H160"/>
        </svg>` 
    },

    // === C. 裝飾配件 (Props) ===
    'blush': { 
        icon: '💖', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280">
            <circle cx="70" cy="150" r="15" fill="#f48fb1" opacity="0.4"/>
            <circle cx="210" cy="150" r="15" fill="#f48fb1" opacity="0.4"/>
        </svg>` 
    },
    'glasses_round': { 
        icon: '👓', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280">
            <circle cx="100" cy="140" r="25" fill="none" stroke="#5d4037" stroke-width="3"/>
            <circle cx="180" cy="140" r="25" fill="none" stroke="#5d4037" stroke-width="3"/>
            <line x1="125" y1="140" x2="155" y2="140" stroke="#5d4037" stroke-width="3"/>
        </svg>` 
    },
    'glasses_sun': { 
        icon: '😎', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280">
            <path d="M70 130 H130 V150 Q100 170 70 150 Z" fill="#333"/>
            <path d="M150 130 H210 V150 Q180 170 150 150 Z" fill="#333"/>
            <line x1="130" y1="130" x2="150" y2="130" stroke="#333" stroke-width="3"/>
        </svg>` 
    },
    'crown': { 
        icon: '👑', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280">
            <path d="M90 90 L70 50 L110 70 L140 30 L170 70 L210 50 L190 90 Z" fill="#d4af37" stroke="#bfa15f" stroke-width="2"/>
        </svg>` 
    },
    'flower': { 
        icon: '🌸', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280">
            <path d="M200 80 Q220 60 240 80 Q250 100 230 110 Q210 130 190 110 Q170 100 180 80 Z" fill="#f48fb1" transform="rotate(0 210 95)"/>
            <path d="M200 80 Q180 60 200 40 Q220 30 240 50 Q250 70 230 80 Z" fill="#f8bbd0" transform="rotate(72 210 95)"/>
            <path d="M200 80 Q220 60 240 80 Q250 100 230 110 Q210 130 190 110 Q170 100 180 80 Z" fill="#f48fb1" transform="rotate(144 210 95)"/>
            <path d="M200 80 Q180 60 200 40 Q220 30 240 50 Q250 70 230 80 Z" fill="#f8bbd0" transform="rotate(216 210 95)"/>
            <path d="M200 80 Q220 60 240 80 Q250 100 230 110 Q210 130 190 110 Q170 100 180 80 Z" fill="#f48fb1" transform="rotate(288 210 95)"/>
            <circle cx="210" cy="95" r="8" fill="#fff7d6"/>
        </svg>` 
    },
    'cat_ears': { 
        icon: '🐱', 
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280">
            <path d="M80 90 L70 40 L110 80" fill="#ffcc80" stroke="#ffb74d" stroke-width="2"/>
            <path d="M200 90 L210 40 L170 80" fill="#ffcc80" stroke="#ffb74d" stroke-width="2"/>
        </svg>` 
    }
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
