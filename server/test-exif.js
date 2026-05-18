const fs = require('fs');
const path = require('path');
const ExifParser = require('exif-parser');

// 1. 定位你放进 server 文件夹的尼康原图
const imagePath = path.join(__dirname, 'DSC_6760.JPG');

try {
  // 2. 将照片读入内存 Buffer
  const buffer = fs.readFileSync(imagePath);

  // 3. 用 exif-parser 创建解析器并运行
  const parser = ExifParser.create(buffer);
  const result = parser.parse();

  // 4. 精准抓取尼康原图里的硬件参数
  console.log('\n====== 📸 chiaroscuro | 物理参数成功提取 ======');
  console.log('相机品牌:', result.tags.Make || '未知品牌');
  console.log('相机型号:', result.tags.Model || '未知型号');

  // 快门速度分母转换处理
  const exposureTime = result.tags.ExposureTime;
  const shutterSpeed = exposureTime
    ? (exposureTime < 1 ? `1/${Math.round(1 / exposureTime)}s` : `${exposureTime}s`)
    : '未知';
  console.log('快门速度:', shutterSpeed);

  console.log('光圈大小: f/', result.tags.FNumber || '未知');
  console.log('实际焦距:', (result.tags.FocalLength || '未知') + 'mm');
  console.log('感光度 (ISO):', result.tags.ISO || '未知');

  // 拍摄时间戳转换
  if (result.tags.DateTimeOriginal) {
    const date = new Date(result.tags.DateTimeOriginal * 1000);
    console.log('拍摄时间:', date.toLocaleString());
  } else {
    console.log('拍摄时间: 未能从 EXIF 中读取');
  }

  // 经纬度抓取
  console.log('GPS 纬度:', result.tags.GPSLatitude || '照片未携带 GPS 坐标');
  console.log('GPS 经度:', result.tags.GPSLongitude || '照片未携带 GPS 坐标');
  console.log('===============================================\n');

} catch (error) {
  console.error('❌ 解析失败，请检查文件名或文件路径是否正确：', error.message);
}