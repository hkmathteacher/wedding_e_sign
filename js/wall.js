// ... (前面保持不變)

    draw() {
        if (!this.loaded) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        const rgb = colorMap[this.data.category] || colorMap['default'];
        
        // 1. 陰影
        ctx.shadowColor = `rgba(${rgb}, 0.5)`;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 2;

        // 2. 氣泡本體 (底色)
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // 半透明底
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${rgb}, 0.9)`;
        ctx.stroke();

        /*
        // 3. 畫頭像 (在底色之上)
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, this.size - 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        ctx.globalAlpha = 1.0;
        ctx.drawImage(this.image, -this.size, -this.size, this.size * 2, this.size * 2);
        
        // === 新增 3.5: 玻璃高光層 (蓋在圖案上) ===
        // 這會讓圖案看起來像是在玻璃球裡面
        ctx.beginPath();
        // 畫一個橢圓形高光在左上角
        ctx.ellipse(-this.size * 0.4, -this.size * 0.4, this.size * 0.2, this.size * 0.1, Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)"; // 淡淡的白光
        ctx.fill();
        */
        
        // 下方反光
        ctx.beginPath();
        ctx.arc(0, 0, this.size - 4, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 4. 名字標籤
        ctx.restore(); // 恢復剪裁區域，以免名字被切掉
        
        ctx.font = "bold 11px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        
        const name = this.data.name;
        const textWidth = ctx.measureText(name).width;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.roundRect(this.x - textWidth/2 - 4, this.y + this.size + 5, textWidth + 8, 14, 7);
        ctx.fill();
        
        ctx.fillStyle = "#5d4037";
        ctx.fillText(name, this.x, this.y + this.size + 16);
    }

// ... (後續保持不變)
