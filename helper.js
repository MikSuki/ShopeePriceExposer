const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 48, 128];
const srcSvg = 'src/icon/logo.svg';
const destDir = 'extension/';

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

sizes.forEach(size => {
    sharp(srcSvg)
        .resize(size, size)
        .png()
        .toFile(`${destDir}icon-${size}.png`)
        .then(() => console.log(`✅ 已生成 icon-${size}.png`))
        .catch(err => console.error(err));
});