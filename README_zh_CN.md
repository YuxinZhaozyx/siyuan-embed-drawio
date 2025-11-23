<p align="center">
<img alt="drawio" src="./icon.png" width="160px">
<br>

<p align="center">
    <strong>思源插件「嵌入式系列」</strong>
    <br>
    使用draw.io在思源笔记中直接绘制高质量矢量图。
    <br>
    无需外部依赖 · 自由编辑 · 自由分享
</p>

<p align="center">
    <a href="https://github.com/YuxinZhaozyx/siyuan-embed-drawio/blob/main/README_zh_CN.md">中文</a> | <a href="https://github.com/YuxinZhaozyx/siyuan-embed-drawio/blob/main/README.md">English</a>
</p>

---

## 嵌入式系列

本插件为第三个「嵌入式系列」插件，旨在为思源笔记提供更加完善且自由的draw.io使用体验。

**嵌入式系列插件的宗旨**：仅作为思源笔记的辅助编辑插件，将所有信息嵌入思源笔记和markdown所支持的数据格式中，使得插件所创造的所有内容在脱离插件甚至脱离思源笔记（导出为markdown/分享到第三方平台）后仍然可以正常显示。

## PC端使用效果

编辑：

![image.png](https://b3logfile.com/file/2025/11/image-r5KMPJt.png)

灯箱：

![image.png](https://b3logfile.com/file/2025/11/image-HcmEJ0P.png)

## 移动端使用效果

![image.png](https://b3logfile.com/file/2025/11/image-eTV8ar9.png)

## 功能

- [x] 无网络离线使用
- [x] draw.io图像以SVG/PNG格式存储
- [x] draw.io图像可编辑
- [x] 支持导出PDF
- [x] 支持移动端编辑
- [x] 图像支持暗黑模式
- [x] 灯箱
- [x] 全屏编辑
- [x] 明暗模式
- [x] Tab/Dialog窗口编辑

> 如有更多需求/建议欢迎[在GitHub仓库中提issue](https://github.com/YuxinZhaozyx/siyuan-embed-drawio/issues)或[在思源笔记社区中发帖](https://ld246.com/article/1762744532030)

## 使用指南

**设置draw.io图像存储格式：** 在插件设置中修改draw.io图像存储格式（只影响新创建的图像），可以选择 SVG/PNG。

**创建draw.io图像：** 在编辑器中输入 `/drawio` 命令即可创建新draw.io图像。

**编辑draw.io图像：** 右键/点击图像右上角的菜单按钮，当图像被识别为合法的draw.io图像时，菜单中会显示 `编辑draw.io` 的选项，点击即可打开编辑窗口。

**查看draw.io灯箱：** 右键/点击图像右上角的菜单按钮，当图像被识别为合法的draw.io图像时，菜单中会显示 `draw.io 灯箱` 的选项，点击即可打开灯箱窗口。

**draw.io图像块标签：** 可在插件设置中修改draw.io图像块的标签显示模式。

**从其他来源迁移：** 

+ 方案1：只需要在任意draw.io平台导出SVG/PNG图像时勾选 `包含绘图副本` 选项，再把SVG/PNG图像拖入思源笔记中即可，不用担心以后没法再迁移，这个SVG/PNG图像也是可以导入到任意draw.io再次编辑的。
+ 方案2：在任意draw.io平台内复制全部内容，在思源笔记中输入 `/drawio` 命令创建新draw.io图像，然后将复制的内容粘贴进弹出的draw.io窗口中即可。

## 更新日志

+ v0.5.5
    + 修复缺陷：快捷键
+ v0.5.4
    + 新增功能：Tab支持快捷键全屏
+ v0.5.3
    + 修复缺陷：内容过多时无法保存
+ v0.5.2
    + 优化：SVG/PNG占位图像编辑时都为空
+ v0.5.1
    + 新增功能：以SVG为存储格式时创建的图像编辑界面为空
+ v0.5.0
    + 新增功能：明暗主题设置
    + 新增功能：支持Tab编辑
+ v0.4.0
    + 新增功能：在配置中选择以SVG还是PNG存储图像
    + 新增功能：全屏编辑
    + 优化：移除保存按钮
+ v0.3.3
    + 优化：修改配置后重载编辑器
+ v0.3.2
    + 修改思源版本要求：>= 3.0.0
+ v0.3.1
    + 优化：编辑窗口增加额外全屏按钮 [#4](https://github.com/YuxinZhaozyx/siyuan-embed-drawio/issues/4)
+ v0.3.0
    + 新增功能：编辑窗口支持全屏 [#2](https://github.com/YuxinZhaozyx/siyuan-embed-drawio/issues/2)
+ v0.2.2
    + 优化：增加标签的配置，现在可以在配置里设置标签的显示模式
+ v0.2.1
    + 新增功能：灯箱
+ v0.2.0
    + 新增功能：draw.io图像右上侧显示标签和页数
+ v0.1.6
    + 修复缺陷：错误地加载到浏览器缓存图像
+ v0.1.5
    + 修复缺陷：避免使用CSS5的light-dark样式导致部分浏览器显示异常
+ v0.1.4
    + 更新文档
+ v0.1.3
    + 优化：调整移动端主题
    + 修复缺陷：避免使用CSS5的light-dark样式导致部分浏览器显示异常
+ v0.1.2
    + 修复缺陷：在编辑界面Ctrl+Z会触发编辑器的撤销操作
+ v0.1.1
    + 优化：i18n
+ v0.1.0
    + 新增功能：draw.io图像以SVG格式存储
    + 新增功能：draw.io图像可编辑

