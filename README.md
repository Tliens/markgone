# MarkGone — 图片在线去水印 / Free Online Watermark Remover

**https://markgone.kuige.me/**

在浏览器里直接去除图片水印：涂抹/框选标记水印区域，修复引擎（Telea FMM / 多重网格扩散）根据周边像素重建背景。支持批量处理、最高 50 个 Web Worker 并发、ZIP 打包下载。**图片全程不上传，100% 本地处理。**

Remove watermarks right in your browser: brush or rectangle to mark the watermark, the inpainting engine rebuilds the background from surrounding pixels. Batch processing with up to 50 parallel Web Workers, ZIP download, 100% local — images never leave your device.

## Features / 功能

- 🖌️ 蒙版编辑器：画笔 / 橡皮 / 矩形，撤销，快捷键（B/E/R、Ctrl+Z）
- 🧠 三档修复质量：快速（多重网格扩散）· 标准（Telea FMM）· 精细（Telea + 纹理匹配）
- 📦 批量：蒙版一键应用到整批（相对坐标），逐张可微调，最高 50 并发
- 🗜️ 输出：格式自动跟随原图（可强制 JPG/PNG/WebP），ZIP 打包（纯 JS store-only writer）
- 🌐 中英双语（`?lang=` 深链 + hreflang）、亮暗主题、零外部依赖单文件

## Tech / 技术

单文件 `index.html`（内联 CSS/JS，无构建、无外部依赖）。修复引擎运行在 Web Worker 中，且只处理蒙版包围盒（+padding），大图低内存。ZIP 为内置 store-only 写入器（图片本身已压缩）。

Single-file `index.html`, zero external dependencies. The inpainting engine runs in Web Workers and only touches the mask bounding box (+ padding), keeping memory low even for large images.

## Related / 相关

[kuige.me](https://kuige.me/) · 免费在线工具集 — JSON Lens、SSE Inspector、PicSqueeze、ShareForge 等。
