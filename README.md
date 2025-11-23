<p align="center">
<img alt="drawio" src="./icon.png" width="160px">
<br>

<p align="center">
    <strong>SiYuan Plugin「Embed Series」</strong>
    <br>
    Draw high-quality vector graphics directly in SiYuan using draw.io.
    <br>
    No external dependencies · Full editability · Free to share
</p>

<p align="center">
    <a href="https://github.com/YuxinZhaozyx/siyuan-embed-drawio/blob/main/README_zh_CN.md">中文</a> | <a href="https://github.com/YuxinZhaozyx/siyuan-embed-drawio/blob/main/README.md">English</a>
</p>

---

## Embed Series

This plugin serves as the third plugin in the **Embed Series**, aiming to provide a more complete and flexible draw.io experience within SiYuan.

**The principle of Embed Series plugins**: They are designed solely as auxiliary editing tools for SiYuan, embedding all information directly into formats supported by SiYuan and Markdown. This ensures that all content created by the plugin remains fully visible and functional even after being separated from the plugin — or even from SiYuan itself — such as when exporting to Markdown or sharing on third-party platforms.

## Features

- [x] Offline usage (no internet required)
- [x] Save draw.io image as SVG/PNG format
- [x] Edit draw.io image
- [x] Support export to PDF
- [x] Support for mobile devices
- [x] Support dark mode
- [x] Lightbox
- [x] Fullscreen edit
- [x] Light/Dark mode
- [x] Edit in Tab/Dialog

> If you have additional feature requests or suggestions, feel free to [open an issue on GitHub](https://github.com/YuxinZhaozyx/siyuan-embed-drawio/issues) or [post in the SiYuan community](https://ld246.com/article/1762744532030) to request support for additional packages.

## Effects on PC

Edit:

![image.png](https://b3logfile.com/file/2025/11/image-r5KMPJt.png)

Lightbox:

![image.png](https://b3logfile.com/file/2025/11/image-HcmEJ0P.png)


## Effects on Mobile Phone

![image.png](https://b3logfile.com/file/2025/11/image-eTV8ar9.png)

## Usage Guide

**Set draw.io image storage format:**

In the plugin settings, modify the draw.io image storage format (only affects newly created images). You can choose SVG/PNG.

**Create a draw.io Image:**

Type `/drawio` in the editor to create a new draw.io image.

**Edit a draw.io Image:**

Click the menu button in the top-right corner of the image. If the block is recognized as a valid draw.io image, an `Edit draw.io` option will appear. Click it to open the editor.

**Open draw.io Lightbox:**

Click the menu button in the top-right corner of the image. If the block is recognized as a valid draw.io image, an `draw.io lightbox` option will appear. Click it to open the lightbox.

**Migrating from other sources:**

+ Method 1: Simply export your diagram as an SVG/PNG from any draw.io platform with the "Include a copy of my diagram" option enabled, then drag the resulting SVG/PNG file into SiYuan.
+ Method 2: Copy all content from any draw.io platform, type `/drawio` in the editor, and paste the copied content into the pop-up draw.io window.

**draw.io image block label:**

The label of a draw.io image block can be configured in the plugin settings.

## Changelog

+ v0.5.5
    + Fix: shortcut for Tab
+ v0.5.4
    + Feature: fullscreen support for shortcut in Tab
+ v0.5.3
    + Fix: unable to save when saving large content
+ v0.5.2
    + Optimize: Excalidraw contents of SVG/PNG placeholder image are empty
+ v0.5.1
    + Feature: placeholder SVG image
+ v0.5.0
    + Feature: configuration of theme
    + Feature: support editing in Tab
+ v0.4.0
    + Feature: select SVG or PNG storage for draw.io image
    + Feature: fullscreen edit
    + Optimize: remove save button
+ v0.3.3
    + Optimize: reload editors after configrating plugin
+ v0.3.2
    + change SiYuan version requirement: >= 3.0.0
+ v0.3.1
    + Optimize: add fullscreen button for edit dialog [#4](https://github.com/YuxinZhaozyx/siyuan-embed-drawio/issues/4)
+ v0.3.0
    + Feature: edit dialog support fullscreen mode [#2](https://github.com/YuxinZhaozyx/siyuan-embed-drawio/issues/2)
+ v0.2.2
    + Optimize: add tag configuration, now you can set the display mode of tags in the configuration
+ v0.2.1
    + Feature: lightbox
+ v0.2.0
    + Feature: show draw.io image label and page counts
+ v0.1.6
    + Fix: load cache image mistakely
+ v0.1.5
    + Fix: avoid CSS5 ligh-dark style rendering fail in some browsers
+ v0.1.4
    + update docs
+ v0.1.3
    + Optimize: theme on mobile devices
    + Fix: avoid CSS5 ligh-dark style rendering fail in some browsers
+ v0.1.2
    + Fix: Ctrl+Z on draw.io editor cause undo in SiYuan editor
+ v0.1.1
    + Optimize: i18n
+ v0.1.0
    + Feature: save draw.io image as SVG format
    + Feature: edit draw.io image