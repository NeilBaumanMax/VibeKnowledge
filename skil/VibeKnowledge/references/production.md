# 审批、实现与交付

## 命令与版本状态

以下 `<skill>` 是本SKILL.md所在目录，`<project>` 是本期视频项目；命令路径必须按当前机器解析，不能复用旧作品中的 `/Users/neil/...` 路径。脚本只使用Python标准库；媒体处理需FFmpeg/FFprobe，渲染需Node.js 22+与HyperFrames。

```bash
python3 <skill>/scripts/workflow.py init <project> --topic '本期主题'
```

写完 `docs/script.md` 和 `docs/sources.md`，展示给用户并等回复。**下面批准命令中的原话只能来自用户实际回复，示例不是授权：**

```bash
python3 <skill>/scripts/workflow.py approve-script <project> --quote '实际脚本批准原话'
python3 <skill>/scripts/workflow.py check <project> --stage preview
python3 <skill>/scripts/prepare_bgm.py <project> --stage preview --duration 30 --ffmpeg <ffmpeg>
```

开始写本期场景代码。输出30秒后，做Review并记录实际文件；工具调用FFprobe验证1920×1080、30fps、900帧、音频和时长，不会仅根据扩展名认定视频有效：

```bash
python3 <skill>/scripts/workflow.py record-preview <project> --video output/preview/v1.mp4 --review review/preview-v1.md --ffprobe <ffprobe>
```

展示样片，等待用户批准。若用户提修改要求，修改并重新渲染、Review、record-preview；不能视作通过。只在批准最终样片后：

```bash
python3 <skill>/scripts/workflow.py approve-preview <project> --quote '实际样片批准原话'
python3 <skill>/scripts/workflow.py check <project> --stage full
python3 <skill>/scripts/prepare_bgm.py <project> --stage full --duration 78 --ffmpeg <ffmpeg>
```

完成全片及Review：

```bash
python3 <skill>/scripts/workflow.py record-full <project> --video output/full/v1.mp4 --review review/full-v1.md --duration 78 --ffprobe <ffprobe>
```

脚本和来源文件的哈希共同定义脚本版本；样片视频和Review哈希共同定义样片版本。批准后有改动会使下一阶段检查失败。保留版本化输出，不在同一路径悄悄替换已批准样片。批准原话是可审计记录，脚本不能验证话语是否真实，操作者仍须遵守用户审核要求。

## 本期项目组织

```
docs/script.md, sources.md
workflow.json
assets/audio/千年之后_氛围版.ogg, music-cues.json
film/src/config.json, captions.json, styles.css, scenes/*.js, timeline.js
film/assets/audio/score-preview.wav, score-full.wav
film/assets/fonts/, vendor/
film/index.html
tools/build.mjs
output/preview/, full/
review/
```

把文案与场景时间、颜色含义、字幕分词和场景代码分开。明确主时间轴和画面变化的来源；改词不要要求改一堆坐标。原理场景针对新主题重写，不能保留幸存者偏差的飞机或标签。

`assets/reference-project/` 保存前作的源码和构建脚本，供提取已验证的算法（点的持续运动、逐字遮罩、连续窗口、对象透明度）。它不是开箱即渲染的成片工程：未重复打包本机字体、GSAP依赖、生成HTML和音轨。其旧 `config.json` 与 `build.mjs` 含特定题目和旧路径；采用时必须改标题、标签、输出路径、场景和字体资源。不要直接运行原例子并冒充新主题视频。

字体选择当前可用且适合项目的中文字体，以本地woff2随**本期项目**固定；检查新主题所有字形，不能复制只覆盖旧字幕的字体子集。不要假定另一台机器有苹方或Arial。可使用许可明确的开源中文字体。GSAP安装固定版本并保留其许可证信息；参考作品版本3.14.2。

## HyperFrames核心契约

当前参考渲染器为0.8.186；在本期 `package.json` 固定实际采用版本，按可用HyperFrames技能检查更新后再用，不静默改变已批准片的渲染版本。

- 根元素包含 `data-composition-id="main"`、`data-start="0"`、`data-duration`、`data-width="1920"`、`data-height="1080"`、`data-fps="30"`。
- 每个计时视觉段用 `.clip`，注明 `data-start`、`data-duration`；在内层节点做动画，不能对clip的visibility/display做补丁。
- 注册 `window.__timelines.main = gsap.timeline({paused:true})`。用主时间驱动Canvas，每次seek能重画同一帧；不依赖播放积累，不使用实时随机、Date.now或网络资源。
- 音频元素有唯一id、项目内src、`data-start="0"`及duration，交给框架控制。不要靠浏览器autoplay同步。
- 中文每字独立遮罩；字幕完整时间与图形观察时间分别检查。GSAP从下方位移，避免CSS transform与GSAP同时控制同一位置。
- `prepare_bgm.py`产生的是本期时长的音轨，full不能继续引用preview WAV。预览首30秒与full首30秒应保持视觉一致，允许按已批准计划移除样片临时结束动作。
- 环境依赖、缓存和临时输出写在工作区内；不要打包另一机器的绝对路径软链接。

示例命令在本期 `film/` 中执行（版本以本期固定版本为准）：

```bash
npx --yes hyperframes@0.8.186 check --json
npx --yes hyperframes@0.8.186 snapshot --at 1.6,2.8,7.6,16.6,17.5,22,26.8,29.5 --output ../review/frames
npx --yes hyperframes@0.8.186 preview --background
npx --yes hyperframes@0.8.186 render --quality delivery --fps 30 --workers 1 --output ../output/preview/v1.mp4
```

仅在当前阶段已通过相应用户审核时渲染；样片阶段内修错重渲染不另设审批。内存较小的机器先用单worker。渲染完成必须确认实际输出路径、时长和退出码；有问题看日志修复，不仅提供代码。

## 验证与交付

自动检查无error后，人工读取关键帧并检查运动序列；保留warning原文及处理依据。FFprobe检查规格，FFmpeg完整解码；检查音画卡点、30秒衔接、末尾淡出和音乐是否为固定源。原例子的 `tools/validate_output.py` 可适配复用，Python依赖numpy/Pillow。

Review表格每项写“通过/失败/待复核、依据、修复情况”。不把编译、画面、知识理解混成一个数字；曾经失败的理解性反馈不能抹掉。修复后重检受影响镜头。阶段交付包含MP4、字幕SRT、源码路径、按顺序的脚本/分镜和Review。

完整片最后一句回应开头疑问；留有足够阅读时间，不为卡点切断推理。提出事实边界时用清楚短句，避免只留下反直觉结论。没有发布授权时交付本地文件，不发布到视频平台。
