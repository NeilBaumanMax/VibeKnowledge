# VibeKnowledge 独立版修订

2026-10-26。上一版主要封装了流程与旧作品参考，缺少独立制作工具链；该问题已修正。新的交付入口是 `dist/VibeKnowledge.zip`，只需解压技能文件夹，无需复制整个原工作区。

## 新增的完整运行资源

- 通用工程模板：package.json/lock、主题配置、字幕JSON、样式、确定性运动库、场景扩展口、主时间轴和HTML/SRT/CSV构建器。
- 完整Noto Sans SC中文字体及OFL许可证，不依赖本机字体或旧题目的字体子集。
- 固定BGM实际文件、SHA-256和音乐起音数据。
- 独立engine入口：setup、doctor、build、check、snapshot、preview、render、verify。
- 项目内依赖安装：固定HyperFrames/GSAP/FFprobe版本；项目自己的Python运行环境提供FFmpeg。移除了原作品tools、.venv和字体路径。
- 完整ZIP、逐文件清单、标准库打包/验包脚本和安装说明。

## 实测证据

只把skill复制到 `review/skill-portability/detached/`，再从它生成独立项目。`deny-original.sb`禁止测试进程读取原工作区的film、tools、.venv、output、skil目录；直接读取原工程被拒绝，证明限制生效。

隔离进程完成30秒样片与78秒完整版渲染，分别900/2340帧；两者均为1920×1080、30fps、H.264、AAC双声道，全片解码通过。详见：

- `review/skill-portability/isolated-technical.json`
- `review/skill-portability/isolated-full-technical.json`
- `review/skill-portability/environment.json`
- `review/skill-portability/check-preview.json`、`check-full.json`
- `review/skill-portability/standalone-preview.png`
- `review/skill-portability/gate-tests.txt`

渲染使用合成自检内容，不代表重新制作或批准新知识主题。测试环境macOS arm64；其他平台未实际测试。审批版本失效测试9项通过、0失败。

## 边界与可复现性

自包含指不依赖原仓库/旧作品/本机字体/旧虚拟环境，不表示无需Python、Node、操作系统和初次依赖下载。运行框架的浏览器可由其正常机制发现或下载；不是原视频的资源。

完整字体作为项目本地文件提供，不强行嵌入HTML；框架会提示字体超过内联限制，但实际渲染加载成功。应移动整个技能或项目目录，不能只复制一个HTML文件。其他结构和阅读时长提示仍在检查JSON中保留。

旧版验收文档13保留为历史记录，以本文和技能内references/validation.md作为当前独立性说明。
