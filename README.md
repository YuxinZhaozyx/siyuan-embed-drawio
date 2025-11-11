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
- [x] Save draw.io image as SVG format
- [x] Edit draw.io image
- [x] Support export to PDF
- [x] Support for mobile devices
- [x] Support dark mode
- [x] Lightbox

> If you have additional feature requests or suggestions, feel free to [open an issue on GitHub](https://github.com/YuxinZhaozyx/siyuan-embed-drawio/issues) or [post in the SiYuan community](https://ld246.com/article/1762744532030) to request support for additional packages.

## Effects

Edit:

![image.png](https://b3logfile.com/file/2025/11/image-r5KMPJt.png)

Lightbox:

![image.png](https://b3logfile.com/file/2025/11/image-HcmEJ0P.png)

## Usage Guide

**Create a draw.io Image:**

Type `/drawio` in the editor to create a new draw.io image.

**Edit a draw.io Image:**

Click the menu button in the top-right corner of the image. If the block is recognized as a valid draw.io image, an `Edit draw.io` option will appear. Click it to open the editor.

**Open draw.io Lightbox:**

Click the menu button in the top-right corner of the image. If the block is recognized as a valid draw.io image, an `draw.io lightbox` option will appear. Click it to open the lightbox.

**Migrating from other sources:**

+ Method 1: Simply export your diagram as an SVG from any draw.io platform with the "Include a copy of my diagram" option enabled, then drag the resulting SVG file into SiYuan.
+ Method 2: Copy all content from any draw.io platform, type `/drawio` in the editor, and paste the copied content into the pop-up draw.io window.

**Disable draw.io label:**

Add CSS Snippet:

```css
.protyle-attr .label--embed-drawio {
  display: none !important;
}
```

## Changelog

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