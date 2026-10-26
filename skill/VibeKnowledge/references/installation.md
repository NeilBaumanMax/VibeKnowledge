# 独立安装与使用

只需复制整个 `VibeKnowledge/` 文件夹，或解压 `VibeKnowledge.zip`。音乐、字体、模板、依赖锁文件和脚本都在里面；不需要克隆原视频仓库，也不需要旧作品的任何目录。

## 让助手发现技能

- Codex：把整个文件夹放到当前机器的技能目录，安装目录可命名为 `vibe-knowledge`，例如 `$CODEX_HOME/skills/vibe-knowledge/`；未设CODEX_HOME时是用户主目录的 `.codex/skills/vibe-knowledge/`。按客户端要求刷新/重开会话，然后使用 `$vibe-knowledge`。
- 不安装到全局：直接把该 `SKILL.md` 的实际路径提供给助手，并说“按这个skill制作，主题是……”。这同样不需要原工作区。
- 其他支持SKILL.md的助手：复制到该助手支持的技能目录；如没有自动发现机制，显式读取入口即可。

不要仅复制SKILL.md。应保留 `agents/`、`assets/`、`references/`、`scripts/`。目录可以移动和重命名，脚本通过自身位置找到资源，没有固定用户路径或软链接。

## 系统与运行时

需要Python 3.10+和Node.js 22+（含npm）。使用 `engine.py setup` 根据package-lock安装HyperFrames、GSAP和本平台FFprobe；同时在项目自己的 `.runtime/` 中建立环境，安装固定版本imageio-ffmpeg并取用其平台FFmpeg。无需手工安装其他Python包、其他Codex技能、系统中文字体或原项目的虚拟环境。

首次setup和浏览器首次准备需要联网；技能不是把所有操作系统的编译器和浏览器一起塞入的离线操作系统镜像。依赖安装后，画面渲染只使用项目本地资源。锁定文件给出具体版本，升级应作为可复查修改，不在已批准视频中静默换版本。

依赖包提供macOS、Linux及Windows的多种平台二进制；仅实测的平台见[随包验证报告](validation.md)，不据此宣称所有系统已实测。遇到不支持的平台，setup会明确失败，不能回退调用原电脑的工具。

## 最短操作链

`<skill>` 是复制/解压后的技能目录，`<project>` 是当前用户选择的输出目录，可与技能目录完全无关。所有命令可从任意当前目录运行：

```bash
python3 <skill>/scripts/workflow.py init <project> --topic '主题'
python3 <skill>/scripts/engine.py setup <project>
```

随后先写脚本并等待用户批准，按 [制作流程](production.md) 继续。不要因为环境已经安装就跳过脚本审核。移动已经生成的项目后，重新运行doctor；换操作系统时删除该项目的node_modules并重新setup。

## 校验技能包

发布包包含 `bundle-manifest.json`，列出所有资源的SHA-256。校验时只需Python标准库：

```bash
python3 <skill>/scripts/package_skill.py verify <skill>
```

若自行修改技能内容，需要重新生成清单和压缩包；不要把修改后的内容宣称为原校验版本。安装并不授权向社交平台发布视频。
