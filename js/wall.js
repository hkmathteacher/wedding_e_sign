const filterOptions = [
    { id: 'all', label: '全部顯示' }, // 系統預設，不用動
    { id: 'groom_friend', label: '🤵 新郎朋友' },
    { id: 'bride_friend', label: '👰 新娘朋友' },
    // ... 其他類別
];

// 以及這裡的顏色 RGB 對應 (用於光暈動畫)
const colorMap = {
    'groom_friend': '156, 175, 183',
    // ...
};
```

### 💡 如果你想修改...

**情境：你想把「以前同學」拆分為「中學同學」和「大學同學」**

1.  **修改 `index.html`**：
    將 `<option value="classmate">🎓 以前同學</option>` 替換為：
    ```html
    <option value="high_school">🏫 中學同學</option>
    <option value="university">🎓 大學同學</option>
