const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const sizes = [16, 48, 128];
const iconDir = path.resolve(__dirname, '../src/assets/icons');

// 确保目录存在
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// 为每个尺寸生成图标
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 绘制一个简单的图标（这里是一个蓝色圆形）
  ctx.fillStyle = '#3B82F6'; // Tailwind blue-500
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();

  // 如果尺寸足够大，添加文字
  if (size >= 48) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${size/3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', size/2, size/2);
  }

  // 保存为PNG文件
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconDir, `icon${size}.png`), buffer);
});

console.log('Icons generated successfully!'); 