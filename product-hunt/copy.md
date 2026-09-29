# MarkGone — Product Hunt 上线物料包

> 官网：https://markgone.kuige.me/ · 开源：https://github.com/Tliens/markgone
> 本目录图片：gallery-1-hero.png / gallery-2-editor.png / gallery-3-batch.png（1270×760）、icon-240.png

---

## 1. 后台字段（照抄即可）

| 字段 | 内容 |
|---|---|
| Name | MarkGone |
| Tagline | Remove image watermarks in your browser — free & private |
| Website URL | https://markgone.kuige.me/ |
| Pricing | Free |
| Topics | Photo Editing · Design Tools · Productivity |

**Tagline 备选**（均 ≤60 字符）：
- `Batch watermark remover in your browser — free & private`（57，突出批量）
- `Mark the watermark. Watch it vanish. 100% in-browser.`（54，动感）
- `Watermark remover that never uploads your photos`（48，隐私向）

## 2. Description（一段式）

> MarkGone is a free watermark remover that runs entirely in your browser. Brush over any watermark — text, logos, date stamps, semi-transparent marks — or drag a rectangle, and an inpainting engine (Telea FMM + multiscale diffusion) rebuilds the background behind it. Process up to 50 images in parallel with Web Workers, apply one mask to a whole batch, and download results one by one or as a ZIP. Three quality tiers from fast cleanup to fine textured reconstruction. Nothing is ever uploaded: decoding, masking and inpainting all happen locally on your device, so it even works offline once loaded. No signup, no file limits, and no watermark on the output.

## 3. Maker's Comment（上线后立刻发第一条评论）

> Hi PH! 👋 I'm KuiGe, an iOS engineer and indie developer (I also make PicSqueeze, an in-browser image compressor).
>
> I built MarkGone because every "free online watermark remover" I tried had the same catch: you upload your private photos to someone's server, wait in a queue, and then hit a paywall or download limit — or the output is stamped with *their* watermark. That always felt backwards for something that is just math on pixels.
>
> Three things that make MarkGone different:
>
> 1. 🔒 **100% local** — decoding, masking and inpainting all run in Web Workers on your device. Nothing is uploaded, and the page works offline once loaded.
> 2. ⚡ **Real batch mode** — mark the watermark once, apply the mask to the whole batch with one click, then process up to 50 images in parallel and grab everything as a ZIP.
> 3. 🧠 **An actual inpainting engine** — three tiers (fast diffusion / Telea FMM / pyramid refinement for large areas), not a blur patch. Free, unlimited, no watermark on the output.
>
> It's a single HTML file with zero external dependencies. Click "Try with demo images" — two sample photos are generated locally, so you can see it work in ~10 seconds without giving up any files.
>
> Happy to answer questions about the inpainting pipeline. And if you try it on your own images, I'd love to hear which watermark types it handles well (and where it struggles) — that's exactly the feedback that drives the roadmap!

## 4. 首评跟帖（自己回复自己，补充技术细节，升讨论热度）

> Fun fact about the engine: the "Fine" tier doesn't run Telea on the full mask — pure Telea on big regions produces ugly streaks (the classic sun-turned-into-a-light-pillar artifact). Instead it solves Telea at the coarsest pyramid level for large-scale structure, then upsamples and relaxes each level with Laplace diffusion, and finally re-adds grain matched to the surrounding texture. Everything only touches the mask's bounding box (+ padding), so a 10MP photo with a small watermark inpaints in well under a second.

## 5. 上线清单（Launch Checklist）

- [ ] **时间**：周二–周四，**00:01–06:00 PT** 提交（跑满美区全天）；避开周一和周末
- [ ] 用 PR 生成 `producthunt.com/posts/:id` 预热页占位（Coming Soon），提前 3–7 天挂出
- [ ] Gallery 按顺序上传：hero → editor → batch（首图决定 feed 点击率）
- [ ] 上线即发 Maker's Comment（第 3 节），1–2 小时后跟技术帖（第 4 节）
- [ ] 找朋友**错峰** upvote + 留言（真实使用体验优先，同小时集中刷会被判违规）
- [ ] 24 小时内守评论区：每条评论 10 分钟内回复，问技术细节就贴引擎实现
- [ ] 准备一条 X 帖同步（模板见下），PH 上线后 2 小时再发，别抢量
- [ ] 结束后把 PH 徽章加回 index.html（`</body>` 前 PH 官方 badge snippet）

## 6. X 同步帖模板

> I removed a watermark from a photo without uploading it to any server.
>
> MarkGone runs the whole inpainting pipeline in your browser — Web Workers, Telea + pyramid refinement, batch of 50, ZIP export, zero upload.
>
> Single HTML file, free, open source: https://markgone.kuige.me/
>
> Today on @ProductHunt → [PH 链接]

## 7. 已知话术红线（PH 社区敏感点）

- 不说 "remove watermarks from copyrighted content"——定位为 **"clean up your own images: remove date stamps, logos from your own photos, prepared screenshots"**；Maker 评论里已按此口径
- 不买 upvote、不搞同一 IP 段集中投票（PH 风控直接沉帖）
- 图片里全是程序生成的 demo 图，无版权风险，可放心当证据
