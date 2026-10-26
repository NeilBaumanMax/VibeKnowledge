# Vibe 知识大赏 · 幸存者偏差

当前交付 **78秒完整版**。沿用v4样片的HyperFrames工程、黑金视觉、流动粒子、逐字从下方遮罩上滑、原飞机图形和用户提供的配乐。没有新增旁白。

## 观看与交付

- [78秒完整版](output/完整版/幸存者偏差_完整版.mp4)
- [完整版字幕SRT](output/完整版/幸存者偏差_完整版_字幕.srt)
- [78秒剪辑配乐](output/完整版/配乐_78秒.m4a)
- [原30秒v4样片](output/幸存者偏差_30秒样片_v4.mp4)
- [本机Studio](http://localhost:3002/#project/film)

完整叙事：成功者被看见 → 失败者被忽略 → 17秒揭晓概念 → 返航飞机与缺失飞机对照 → Wald风险推理及边界 → 同一种方法下的成功和失败 → 比较完整样本与条件 → “幸存者的回声”。

前27.4秒沿用v4。27.4秒之后把样片收尾扩展为新的解释；41.33秒回到现实，68.8秒回到开头的粒子空间。旧30秒样片均保留，`output/幸存者偏差_30秒样片.mp4`仍是30秒副本。

## 文档

- [完整版制作方案、分镜与字幕](docs/10_完整版制作方案.md)：按九项要求排列。
- [实际字幕时间轴](docs/11_完整版字幕时间轴.csv)
- [完整版Review](docs/12_完整版Review报告.md)
- [事实与素材来源](references/事实与素材来源.md)
- `docs/01`至`docs/09`：早期样片方案和迭代记录；`docs/archive/v4/`保存扩展前交付记录。
- `review/full/`：音频分析、关键帧、自动检查及解码证据；`review/full/source-before/`保存扩展前源码。

## 修改和重渲染

```bash
node tools/build.mjs
.venv/bin/python tools/subset_fonts.py
./tools/hf.sh check
./tools/hf.sh preview --background
./tools/hf.sh render --quality delivery --fps 30 --workers 1 --output ../output/完整版/幸存者偏差_完整版.mp4
.venv/bin/python tools/validate_output.py output/完整版/幸存者偏差_完整版.mp4 review/full 78
node tools/review_full.mjs
```

`film/src/config.json`配置时长、音轨、输出与场景节点；`captions.json`配置文案和时序；`particles.js`、`semantics.js`负责人群及对象说明；`aircraft.js`和`continuation.js`负责飞机及推理延续；`reality.js`负责现实对照和片尾；`timeline.js`负责逐字动画。`film/index.html`为构建产物。

本地字体、脚本和声音已保存。配乐重建使用 `tools/prepare_full_audio.sh`；30秒配乐脚本仍保留。当前工具依赖Node22+及macOS arm64的FFmpeg/FFprobe，不是跨平台发行包。

音乐为用户提供的第三方曲目；素材来源和授权状态见来源文档。所有示例样本数与弹孔分布均为原理示意。首次观看理解效果仍需观众反馈，技术检查不能替代理解性验证。

## 可复用 Skill：VibeKnowledge

技能入口：[skil/VibeKnowledge/SKILL.md](skil/VibeKnowledge/SKILL.md)。每次提供主题后，先生成完整脚本供审核；脚本通过才制作30秒样片，样片通过才制作完整版。工作区的 `AGENTS.md` 指向该流程；可直接说“用 VibeKnowledge，主题是……”。标准技能标识是 `$vibe-knowledge`，显示名和文件夹按要求保留 `VibeKnowledge`。

固定BGM的实际OGG文件、SHA-256和节奏数据已包含在技能文件夹中，来源已与2026-10-26提供的Music目录文件核对一致。新项目放在 `videos/<主题>/`，不会覆盖当前作品。技能并未额外安装到用户全局目录；在其他工作区使用时，提供SKILL.md路径，或按当地技能安装方式安装整个文件夹。

仓库：[NeilBaumanMax/VibeKnowledge](https://github.com/NeilBaumanMax/VibeKnowledge)。包含项目源文件、文档、原始音乐、历次成片和Review证据；依赖目录、运行缓存、临时集成测试夹具不纳入版本控制。

克隆后在macOS arm64环境执行 `./tools/bootstrap.sh` 恢复Python和Node依赖。FFmpeg启动器根据当前工作区定位虚拟环境，不再依赖原机器绝对路径；随仓库的FFprobe是macOS arm64版本，其他系统请用本平台可执行文件替换 `tools/bin/ffprobe`。技能本身的流程脚本只需Python标准库，媒体步骤使用显式传入或PATH中的FFmpeg/FFprobe。

验证说明：[技能封装验收](docs/13_VibeKnowledge技能验收.md)。
