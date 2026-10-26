# 每期固定BGM

原曲为随包实际文件 `assets/audio/千年之后_氛围版.ogg`（约19MB），不是链接或Git LFS指针。`manifest.json`记录SHA-256；始终先核对。若文件缺失/校验失败，明确指出并修复素材，不自动选别的BGM。版本库必须包含实际音频，不能用 `*.ogg` 通配忽略它。

默认从原曲 **1.562811791383222秒** 开始，不变速。原曲18.562811791秒附近起音对应成片17秒。保留当前声道下混方案：原始12声道转双声道48kHz，响度目标−16LUFS，真峰值目标−1.5dB；输出AAC可能与预处理测量略有不同，成片再测。

`sample-cues.json`的 `source_onsets` 是原曲绝对时间，需减 `excerpt_start`；`full-cues.json`的 `onsets` 已经是成片相对时间，**不要再减一次偏移**。同一源哈希、同一起点、不变速时可复用已有分析，无需每次假装重新分析。

主要参考节点（成片秒）：17.005、29.736、33.937、41.320、48.264、61.863、72.868。按30fps四舍五入到帧，动作启动点与字落位可以不同，但应明确设计。BPM估计约104，不是严格等间隔拍点；阅读和观察优先于硬追小拍。

准备命令（先通过当前阶段审核门槛）：

```bash
python3 <skill>/scripts/prepare_bgm.py <project> --stage preview --duration 30 --ffmpeg <ffmpeg路径>
python3 <skill>/scripts/prepare_bgm.py <project> --stage full --duration 78 --ffmpeg <ffmpeg路径>
```

脚本从项目内复制的原始OGG生成 `film/assets/audio/score-preview.wav` 或 `score-full.wav`，写处理记录。样片末0.5秒淡出；完整版末1.8秒淡出，**30秒处不能保留样片淡出**。不把已经淡出的30秒音轨拼接到全片。音乐固定，但全片结束时刻可依据已批准脚本选择。

授权状态：用户提供并指定每期复用，属于第三方曲目，未标记为原创；这不自动授权代理发布视频到社交平台。不要更换音乐，也不要在每次正常本地制作时反复要求同一素材确认。
