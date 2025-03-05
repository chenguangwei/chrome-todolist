const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const sizes = [16, 48, 128];
const iconDir = path.resolve(__dirname, '../src/assets/icons');
const assetsDir = path.resolve(__dirname, '../src/assets');

// 确保目录存在
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
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

// 生成捐赠二维码占位图
const donateSize = 200;
const donateCanvas = createCanvas(donateSize, donateSize);
const ctx = donateCanvas.getContext('2d');

// 绘制白色背景
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, donateSize, donateSize);

// 绘制边框
ctx.strokeStyle = '#E5E7EB';
ctx.lineWidth = 2;
ctx.strokeRect(1, 1, donateSize - 2, donateSize - 2);

// 添加文字
ctx.fillStyle = '#6B7280';
ctx.font = '16px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('请替换成您的', donateSize/2, donateSize/2 - 20);
ctx.fillText('支付二维码', donateSize/2, donateSize/2 + 20);

// 保存捐赠二维码占位图
const donateBuffer = donateCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(assetsDir, 'donate.png'), donateBuffer);

console.log('Icons and donate placeholder generated successfully!'); 