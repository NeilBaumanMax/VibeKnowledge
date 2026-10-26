# 独立制作流程与工程契约

`<skill>` 指复制/解压后的技能目录，`<project>` 指任意新项目目录。所有命令不依赖当前工作目录。运行时不读取原视频工程，也不要求安装其他技能。

## 三阶段命令

初始化并恢复项目自己的工具链：

```bash
python3 <skill>/scripts/workflow.py init <project> --topic '主题'
python3 <skill>/scripts/engine.py setup <project>
python3 <skill>/scripts/engine.py doctor <project>
```

先写 `docs/script.md` 和 `docs/sources.md`，展示脚本等待用户批准。只有收到真实批准，才能记录原话；下面的占位原话不是授权：

```bash
python3 <skill>/scripts/workflow.py approve-script <project> --quote '真实脚本批准原话'
```

编写本期的 `film/src/config.json`、`captions.json`、`scenes.js`，完成后将config.ready设为true。然后：

```bash
python3 <skill>/scripts/engine.py build <project> --stage preview
python3 <skill>/scripts/engine.py check <project> --stage preview
python3 <skill>/scripts/engine.py snapshot <project> --stage preview
python3 <skill>/scripts/engine.py preview <project> --stage preview
python3 <skill>/scripts/engine.py render <project> --stage preview --output output/preview/v1.mp4
```

render自动生成配乐、HTML、SRT/CSV，运行框架检查，再渲染30秒，最后做视频规格/全片解码/抽帧/响度检查。它不会把技术检查自动算成人类理解通过。看实际帧、必要时看动态序列，写 `review/preview-v1.md`，记录：

```bash
python3 <skill>/scripts/workflow.py record-preview <project> --video output/preview/v1.mp4 --review review/preview-v1.md
```

workflow会自动定位本项目安装的FFprobe；需要自定义时才使用 `--ffprobe`，不必配置系统PATH。

展示样片，用户要求修改就修改样片，不生成全片。用户明确通过最终样片后：

```bash
python3 <skill>/scripts/workflow.py approve-preview <project> --quote '真实样片批准原话'
python3 <skill>/scripts/workflow.py check <project> --stage full
```

扩展已批准内容，保持前段画面和语义，完成后：

```bash
python3 <skill>/scripts/engine.py check <project> --stage full
python3 <skill>/scripts/engine.py snapshot <project> --stage full --at 17.5,29.5,41,55,70,77
python3 <skill>/scripts/engine.py render <project> --stage full --output output/full/v1.mp4
python3 <skill>/scripts/workflow.py record-full <project> --video output/full/v1.mp4 --review review/full-v1.md --duration 78
```

上面时间与duration按已批准片长调整。render拒绝覆盖已有成片，修订用v2等新路径。单独复检可用 `engine.py verify <project> --stage full --output output/full/v1.mp4`。只更改BGM处理时也可单独调用 `prepare_bgm.py`。

## 文件与配置

```
package.json, package-lock.json    本项目的固定依赖版本
workflow.json                    真实批准与版本摘要
runtime.json                     当前输出阶段/时长（构建时生成）
docs/script.md, sources.md        待审脚本及事实依据
assets/audio/                    固定源音乐与起音数据
film/src/config.json              标题/片长/场景安排
film/src/captions.json            独立字幕数据
film/src/styles.css              字体、排版、色彩、遮罩
film/src/motion.js                确定性粒子、短标签、通用图元
film/src/scenes.js                本期知识推理场景
film/src/timeline.js              主时间轴及逐字上滑
film/assets/fonts/               完整中文字体与许可证
film/assets/audio/               本阶段预处理音乐
film/assets/vendor/              构建时从锁定GSAP复制
film/index.html                  本地可渲染HTML
output/preview/, output/full/    MP4与SRT
review/                          检查、帧图、响度、审核记录
```

`config.json` 示例（时序只供说明，具体按批准脚本写）：

```json
{
  "title": "本期主题",
  "fullDuration": 78,
  "conceptTime": 17,
  "ready": true,
  "scenes": [
    {"id":"opening","start":0,"end":4,"mode":"population","count":480,"selected":12,
     "labels":[{"text":"本期定义的对象","x":140,"y":450,"size":38}]},
    {"id":"attention","start":4,"end":8,"mode":"focus","count":480,"selected":12,
     "labels":[{"text":"被纳入观察的对象","x":1060,"y":438}]}
  ]
}
```

`population`与`focus`是可选图元，不是所有主题的固定视觉。它们的连续粒子使用稳定ID；要跨场景保持动作连贯，就在本期scenes.js中连接位置和镜头，不能生硬换两套点。新类型在 `customScene(ctx,time,scene,config)` 中绘制并返回true；默认未知mode抛错，避免无声空白。

`captions.json` 是数组，每项如下：

```json
{"id":"concept","start":17,"end":20,"kind":"reveal","lines":["本期概念"],"lineDelays":[0],"english":"CONCEPT","emphasis":[],"readingHold":false}
```

kind支持hook/top/reveal/ending，按CSS扩展；id使用小写英文开头、字母数字下划线或连字符。lines每行单独遮罩错峰；lineDelays相对于该字幕开始；每行读取时间应计算最后一字落位后剩余时间。readingHold只能用于确实需要阅读的长停顿。

源码允许先规划完整78秒字幕；preview构建器只截取前30秒，full使用fullDuration。相同音乐起点，full重新从原OGG处理，绝不拼接已经淡出的preview音轨。生成的SRT会反映逐行出现时间，而不是把尚未出现的第二行提前显示。

## 本地引擎契约

骨架已经实现：根data-composition-id为main，1920×1080/30fps；每个clip带起止时间；字幕在内层做变换；根GSAP时间轴paused注册在 `window.__timelines.main`；Canvas从时间直接计算，支持seek；字体加载后再挂载；audio有唯一id并由框架同步。

修改时保留这些契约。不要使用Date.now、未设种子的随机或运行时网络。子绘制函数将透明度乘入父级，避免退出时残影。字体完整随包，不依赖系统苹方，也不使用只覆盖旧题目字形的子集。

工程锁定HyperFrames 0.8.186、GSAP 3.14.2；FFprobe由npm按平台安装，FFmpeg由项目内的imageio-ffmpeg 0.6.0提供。可按实际需要升级，但升级后须重新检查和抽帧，不能悄悄改掉已批准视频的渲染环境。

## 验证与交付

检查错误必须解决；warning另列，不靠省略报告或标记data-hold掩盖问题。看开场、17秒附近、每个推理反转与转场、30秒衔接、结尾。除静帧外，比较相隔半秒的位置和字幕遮罩状态。宽高、帧数和全片解码由engine.verify检查。

Review每项列通过/失败/待复核、证据、修复。第一次观看理解必须由真实反馈验证；脚本或技术测试不等于观众看懂。交付实际MP4、SRT、完整脚本/分镜、源码和Review。未授权发布时不向社交平台上传。
