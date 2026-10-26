# VibeKnowledge 技能封装与仓库交付

2026-10-26。技能位于 `skill/VibeKnowledge/`，未擅自安装到全局技能目录。显示名称/目录为VibeKnowledge，标准调用标识为 `vibe-knowledge`。工作区根 `AGENTS.md` 指向技能，因此下次在本工作区给出新知识主题时会进入该流程。

## 已封装

- 三阶段：先交完整脚本；用户通过后制作30秒样片；样片通过后制作完整版。普通修改请求和没有回复均不等于通过。
- 版本记录：脚本与来源共同计算摘要；样片和Review各有摘要。修改已批准内容使下一阶段检查失效。批准原话只可记录真实用户回复。
- 固定BGM：实际音频 `skill/VibeKnowledge/assets/audio/千年之后_氛围版.ogg`，20,363,166字节；带音乐清单、SHA-256、已测起音数据和30秒/全片预处理脚本。
- 2026-10-26用户新提供的Music目录文件，与工程和技能副本逐字节校验一致。运行不依赖Music或Downloads目录。
- 黑金视觉、逐字下方上滑、连续运动、对象含义、知识因果、阅读时间、事实核查和Review规范。
- 旧作品源码作为案例参考，不把二战飞机或幸存者偏差内容硬套到其他主题。

## 验证结果

**9项审核门槛回归测试通过、0失败；11项CLI/媒体集成检查通过、0失败。** Skill标准结构校验通过；所有本地Markdown引用存在；固定BGM已纳入Git索引，实际文件不是LFS指针。

回归测试覆盖：未批准脚本拒绝样片、当前批准允许样片、脚本改动失效、来源改动失效、未批准样片拒绝全片、当前批准允许全片、样片改动失效、Review改动失效、错误BGM被拒绝。

集成测试用明确标记的合成批准记录验证命令流程，用现有30秒/78秒视频验证FFprobe规格，用实际固定OGG生成30秒/78秒音轨并核对时长、双声道与48kHz。没有替用户批准任何真实新主题，也没有生成新主题视频。测试夹具不上传仓库。

证据：`review/skill-validation/integration-test.json` 与 `package-validation.json`。复现单元测试：

```bash
python3 skill/VibeKnowledge/scripts/test_workflow.py --workdir review/skill-validation/tmp
```

限制：这验证了本地流程、素材、参数和版本失效逻辑，不代表所有未来主题都能一次达到内容/画面质量要求。首次观看理解效果仍需实际观众反馈；代理不得伪造批准原话来通过脚本门槛。

## 仓库范围

按用户指定使用 `git@github.com:NeilBaumanMax/VibeKnowledge.git`，整个工作区作为仓库。保留源工程、文档、原始素材、成片、历史样片、Review证据和独立skill文件夹；忽略虚拟环境、node_modules、框架缓存、临时夹具和安装压缩包。

新增 `requirements.txt` 与 `tools/bootstrap.sh` 恢复环境；修复FFmpeg启动器对原机器绝对软链接的依赖。现有FFprobe为macOS arm64，其他平台需提供本机版本。`npm run render` 默认指向完整版文件，避免把78秒内容覆盖到30秒样片路径。

交付同步检查使用本地HEAD与远程main提交号比较；固定BGM同时通过Git对象字节数和SHA-256验证。
