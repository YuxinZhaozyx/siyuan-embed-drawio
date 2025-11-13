import {
  Dialog,
  Plugin,
  getFrontend,
  fetchPost,
  IWebSocketData,
} from "siyuan";
import "@/index.scss";
import PluginInfoString from '@/../plugin.json';
import { base64ToUnicode, HTMLToElement } from "./utils";
import defaultImageContent from "@/../default.svg?raw";

let PluginInfo = {
  version: '',
}
try {
  PluginInfo = PluginInfoString
} catch (err) {
  console.log('Plugin info parse error: ', err)
}
const {
  version,
} = PluginInfo

const STORAGE_NAME = "config.json";

export default class DrawioPlugin extends Plugin {
  // Run as mobile
  public isMobile: boolean
  // Run in browser
  public isBrowser: boolean
  // Run as local
  public isLocal: boolean
  // Run in Electron
  public isElectron: boolean
  // Run in window
  public isInWindow: boolean
  public platform: SyFrontendTypes
  public readonly version = version

  private _mutationObserver;
  private _openMenuImageHandler;
  private _globalKeyDownHandler;

  private settingItems: SettingItem[];

  async onload() {
    this.initMetaInfo();
    this.initSetting();

    this._mutationObserver = this.setAddImageBlockMuatationObserver(document.body, (blockElement: HTMLElement) => {
      if (this.data[STORAGE_NAME].labelDisplay === "noLabel") return;

      const imageElement = blockElement.querySelector("img") as HTMLImageElement;
      if (imageElement) {
        const imageURL = imageElement.getAttribute("data-src");
        this.getDrawioImageInfo(imageURL, false).then((imageInfo) => {
          this.updateAttrLabel(imageInfo, blockElement);
        });
      }
    });

    this.protyleSlash = [{
      filter: ["drawio", "draw.io"],
      id: "drawio",
      html: `<div class="b3-list-item__first"><svg class="b3-list-item__graphic"><use xlink:href="#iconImage"></use></svg><span class="b3-list-item__text">draw.io</span></div>`,
      callback: (protyle, nodeElement) => {
        this.newDrawioImage(nodeElement.dataset.nodeId, (imageInfo) => {
          this.openEditDialog(imageInfo);
        });
      },
    }];

    this._openMenuImageHandler = this.openMenuImageHandler.bind(this);
    this.eventBus.on("open-menu-image", this._openMenuImageHandler);

    this._globalKeyDownHandler = this.globalKeyDownHandler.bind(this);
    document.documentElement.addEventListener("keydown", this._globalKeyDownHandler);
  }

  onunload() {
    if (this._mutationObserver) this._mutationObserver.disconnect();
    if (this._openMenuImageHandler) this.eventBus.off("open-menu-image", this._openMenuImageHandler);
    if (this._globalKeyDownHandler) document.documentElement.removeEventListener("keydown", this._globalKeyDownHandler);
  }

  openSetting() {
    const dialogHTML = `
<div class="b3-dialog__content"></div>
<div class="b3-dialog__action">
  <button class="b3-button b3-button--cancel" data-type="cancel">${window.siyuan.languages.cancel}</button>
  <div class="fn__space"></div>
  <button class="b3-button b3-button--text" data-type="confirm">${window.siyuan.languages.save}</button>
</div>
    `;

    const dialog = new Dialog({
      title: this.displayName,
      content: dialogHTML,
      width: this.isMobile ? "92vw" : "768px",
      height: "80vh",
      hideCloseIcon: this.isMobile,
    });

    // 配置的处理拷贝自思源源码
    const contentElement = dialog.element.querySelector(".b3-dialog__content");
    this.settingItems.forEach((item) => {
      let html = "";
      let actionElement = item.actionElement;
      if (!item.actionElement && item.createActionElement) {
        actionElement = item.createActionElement();
      }
      const tagName = actionElement?.classList.contains("b3-switch") ? "label" : "div";
      if (typeof item.direction === "undefined") {
        item.direction = (!actionElement || "TEXTAREA" === actionElement.tagName) ? "row" : "column";
      }
      if (item.direction === "row") {
        html = `<${tagName} class="b3-label">
    <div class="fn__block">
        ${item.title}
        ${item.description ? `<div class="b3-label__text">${item.description}</div>` : ""}
        <div class="fn__hr"></div>
    </div>
</${tagName}>`;
      } else {
        html = `<${tagName} class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${item.title}
        ${item.description ? `<div class="b3-label__text">${item.description}</div>` : ""}
    </div>
    <span class="fn__space${actionElement ? "" : " fn__none"}"></span>
</${tagName}>`;
      }
      contentElement.insertAdjacentHTML("beforeend", html);
      if (actionElement) {
        if (["INPUT", "TEXTAREA"].includes(actionElement.tagName)) {
          dialog.bindInput(actionElement as HTMLInputElement, () => {
            (dialog.element.querySelector(".b3-dialog__action [data-type='confirm']") as HTMLElement).dispatchEvent(new CustomEvent("click"));
          });
        }
        if (item.direction === "row") {
          contentElement.lastElementChild.lastElementChild.insertAdjacentElement("beforeend", actionElement);
          actionElement.classList.add("fn__block");
        } else {
          actionElement.classList.remove("fn__block");
          actionElement.classList.add("fn__flex-center", "fn__size200");
          contentElement.lastElementChild.insertAdjacentElement("beforeend", actionElement);
        }
      }
    });

    (dialog.element.querySelector(".b3-dialog__action [data-type='cancel']") as HTMLElement).addEventListener("click", () => {
      dialog.destroy();
    });
    (dialog.element.querySelector(".b3-dialog__action [data-type='confirm']") as HTMLElement).addEventListener("click", () => {
      this.data[STORAGE_NAME].labelDisplay = (dialog.element.querySelector("[data-type='labelDisplay']") as HTMLSelectElement).value;
      this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
      dialog.destroy();
    });
  }

  private async initSetting() {
    await this.loadData(STORAGE_NAME);
    if (!this.data[STORAGE_NAME]) {
      this.data[STORAGE_NAME] = {
        labelDisplay: "showLabelOnHover",
      };
    }

    this.settingItems = [
      {
        title: "标签显示",
        direction: "column",
        description: "图像块右上角的标签显示（修改后需刷新文档生效）",
        createActionElement: () => {
          const options = ["noLabel", "showLabelAlways", "showLabelOnHover"];
          const optionsHTML = options.map(option => {
            const isSelected = String(option) === String(this.data[STORAGE_NAME].labelDisplay);
            return `<option value="${option}"${isSelected ? " selected" : ""}>${this.i18n[option]}</option>`;
          }).join("");
          return HTMLToElement(`<select class="b3-select fn__flex-center" data-type="labelDisplay">${optionsHTML}</select>`);
        },
      },
    ];
  }

  private initMetaInfo() {
    const frontEnd = getFrontend();
    this.platform = frontEnd as SyFrontendTypes
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
    this.isBrowser = frontEnd.includes('browser');
    this.isLocal = location.href.includes('127.0.0.1') || location.href.includes('localhost');
    this.isInWindow = location.href.includes('window.html');

    try {
      require("@electron/remote")
        .require("@electron/remote/main");
      this.isElectron = true;
    } catch (err) {
      this.isElectron = false;
    }
  }

  public setAddImageBlockMuatationObserver(element: HTMLElement, callback: (blockElement: HTMLElement) => void): MutationObserver {
    const mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const addedElement = node as HTMLElement;
              if (addedElement.matches("div[data-type='NodeParagraph']")) {
                if (addedElement.querySelector(".img[data-type='img'] img")) {
                  callback(addedElement as HTMLElement);
                }
              } else {
                addedElement.querySelectorAll("div[data-type='NodeParagraph']").forEach((blockElement: HTMLElement) => {
                  if (blockElement.querySelector(".img[data-type='img'] img")) {
                    callback(blockElement);
                  }
                })
              }
            }
          });
        }
      }
    });

    mutationObserver.observe(element, {
      childList: true,
      subtree: true
    });

    return mutationObserver;
  }

  public async getDrawioImageInfo(imageURL: string, reload: boolean): Promise<DrawioImageInfo | null> {
    const imageURLRegex = /^assets\/.+\.svg$/;
    if (!imageURLRegex.test(imageURL)) return null;

    const svgContent = await this.getDrawioImage(imageURL, reload);
    if (!svgContent) return null;

    if (!svgContent.includes("mxfile")) return null;

    const imageInfo: DrawioImageInfo = {
      imageURL: imageURL,
      data: svgContent,
    }
    return imageInfo;
  }

  public getPlaceholderImageContent(): string {
    let imageContent = defaultImageContent;
    imageContent = imageContent + `\n<!-- updated="${new Date().toISOString()}" -->`;
    return imageContent;
  }

  public newDrawioImage(blockID: string, callback?: (imageInfo: DrawioImageInfo) => void) {
    const imageName = 'drawio-image.svg';
    const placeholderImageContent = this.getPlaceholderImageContent();
    const blob = new Blob([placeholderImageContent], { type: 'image/svg+xml' });
    const file = new File([blob], imageName, { type: 'image/svg+xml' });
    const formData = new FormData();
    formData.append('file[]', file);
    fetchPost('/api/asset/upload', formData, (response) => {
      const imageURL = response.data.succMap[imageName];
      fetchPost('/api/block/updateBlock', {
        id: blockID,
        data: `![](${imageURL})`,
        dataType: "markdown",
      });
      const imageInfo: DrawioImageInfo = {
        imageURL: imageURL,
        data: placeholderImageContent,
      };
      if (callback) {
        callback(imageInfo);
      }
    });
  }

  public async getDrawioImage(imageURL: string, reload: boolean): Promise<string> {
    const response = await fetch(imageURL, { cache: reload ? 'reload' : 'default' });
    if (!response.ok) return "";
    const svgContent = await response.text();
    return svgContent;
  }

  public updateDrawioImage(imageInfo: DrawioImageInfo, callback?: (response: IWebSocketData) => void) {
    if (!imageInfo.data) {
      imageInfo.data = this.getPlaceholderImageContent();
    }
    const blob = new Blob([imageInfo.data], { type: 'image/svg+xml' });
    const file = new File([blob], imageInfo.imageURL.split('/').pop(), { type: 'image/svg+xml' });
    const formData = new FormData();
    formData.append("path", 'data/' + imageInfo.imageURL);
    formData.append("file", file);
    formData.append("isDir", "false");
    fetchPost("/api/file/putFile", formData, callback);
  }

  public updateAttrLabel(imageInfo: DrawioImageInfo, blockElement: HTMLElement) {
    if (!imageInfo) return;

    if (this.data[STORAGE_NAME].labelDisplay === "noLabel") return;

    const attrElement = blockElement.querySelector(".protyle-attr") as HTMLDivElement;
    if (attrElement) {
      const pageCount = (imageInfo.data.match(/name=&quot;/g) || []).length;
      const labelHTML = `<span>draw.io${pageCount > 1 ? `:${pageCount}` : ''}</span>`;
      let labelElement = attrElement.querySelector(".label--embed-drawio") as HTMLDivElement;
      if (labelElement) {
        labelElement.innerHTML = labelHTML;
      } else {
        labelElement = document.createElement("div");
        labelElement.classList.add("label--embed-drawio");
        if (this.data[STORAGE_NAME].labelDisplay === "showLabelAlways") {
          labelElement.classList.add("label--embed-drawio--always");
        }
        labelElement.innerHTML = labelHTML;
        attrElement.prepend(labelElement);
      }
    }
  }

  private openMenuImageHandler({ detail }) {
    const selectedElement = detail.element;
    const imageElement = selectedElement.querySelector("img") as HTMLImageElement;
    const imageURL = imageElement.dataset.src;
    this.getDrawioImageInfo(imageURL, true).then((imageInfo: DrawioImageInfo) => {
      if (imageInfo) {
        window.siyuan.menus.menu.addItem({
          id: "edit-drawio",
          icon: 'iconEdit',
          label: `${this.i18n.editDrawio}`,
          index: 1,
          click: () => {
            this.openEditDialog(imageInfo);
          }
        });
        window.siyuan.menus.menu.addItem({
          id: "drawio-lightbox",
          icon: 'iconImage',
          label: `${this.i18n.drawioLightbox}`,
          index: 1,
          click: () => {
            this.openLightboxDialog(imageInfo);
          }
        });
      }
    })
  }

  private globalKeyDownHandler = (event: KeyboardEvent) => {
    // 如果是在代码编辑器里使用快捷键，则阻止冒泡 https://github.com/YuxinZhaozyx/siyuan-embed-tikz/issues/1
    if (document.activeElement.closest(".b3-dialog--open .drawio-edit-dialog")) {
      event.stopPropagation();
    }
  };

  public openEditDialog(imageInfo: DrawioImageInfo) {
    const editDialogHTML = `
<div class="drawio-edit-dialog">
    <div class="edit-dialog-header resize__move"></div>
    <div class="edit-dialog-container">
        <div class="edit-dialog-editor">
            <iframe src="/plugins/siyuan-embed-drawio/draw/index.html?proto=json&embed=1${this.isMobile ? "&ui=min" : ""}&lang=${window.siyuan.config.lang.split('_')[0]}"></iframe>
        </div>
        <div class="fn__hr--b"></div>
    </div>
</div>
    `;

    const dialogDestroyCallbacks = [];

    const dialog = new Dialog({
      content: editDialogHTML,
      width: this.isMobile ? "92vw" : "90vw",
      height: "80vh",
      hideCloseIcon: this.isMobile,
      destroyCallback: () => {
        dialogDestroyCallbacks.forEach(callback => callback());
      },
    });

    const iframe = dialog.element.querySelector("iframe");
    iframe.focus();

    const postMessage = (message: any) => {
      if (!iframe.contentWindow) return;
      iframe.contentWindow.postMessage(JSON.stringify(message), '*');
    };

    const onInit = (message: any) => {
      postMessage({
        action: "load",
        autosave: 1,
        modified: 'unsavedChanges',
        title: this.isMobile ? '' : imageInfo.imageURL,
        xml: imageInfo.data,
      });
    }

    let isFullscreen = false;
    let dialogContainerStyle = {
      width: "100vw",
      height: "100vh",
      maxWidth: "unset",
      maxHeight: "unset",
      top: "auto",
      left: "auto",
    };
    const onLoad = (message: any) => {
      const fullscreenButton = iframe.contentDocument.querySelector(".geToolbarContainer .geToolbarEnd .geButton");
      if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
          const dialogContainerElement = dialog.element.querySelector('.b3-dialog__container') as HTMLElement;
          if (dialogContainerElement) {
            isFullscreen = !isFullscreen;
            if (isFullscreen) {
              dialogContainerStyle.width = dialogContainerElement.style.width;
              dialogContainerStyle.height = dialogContainerElement.style.height;
              dialogContainerStyle.maxWidth = dialogContainerElement.style.maxWidth;
              dialogContainerStyle.maxHeight = dialogContainerElement.style.maxHeight;
              dialogContainerStyle.top = dialogContainerElement.style.top;
              dialogContainerStyle.left = dialogContainerElement.style.left;
              dialogContainerElement.style.width = "100vw";
              dialogContainerElement.style.height = "100vh";
              dialogContainerElement.style.maxWidth = "unset";
              dialogContainerElement.style.maxHeight = "unset";
              dialogContainerElement.style.top = "0";
              dialogContainerElement.style.left = "0";
            } else {
              dialogContainerElement.style.width = dialogContainerStyle.width;
              dialogContainerElement.style.height = dialogContainerStyle.height;
              dialogContainerElement.style.maxWidth = dialogContainerStyle.maxWidth;
              dialogContainerElement.style.maxHeight = dialogContainerStyle.maxHeight;
              dialogContainerElement.style.top = dialogContainerStyle.top;
              dialogContainerElement.style.left = dialogContainerStyle.left;
            }
          }
        });
      }
    }

    const onSave = (message: any) => {
      postMessage({
        action: 'export',
        format: 'xmlsvg'
      });
    }

    const onExport = (message: any) => {
      if (message.format == 'svg') {
        const base64String = message.data.split(';base64,').pop();
        imageInfo.data = base64ToUnicode(base64String);

        // 解决CSS5的light-dark样式在部分浏览器上无效的问题
        const regex = /light-dark\s*\(\s*((?:[^(),]|\w+\([^)]*\))+)\s*,\s*(?:[^(),]|\w+\([^)]*\))+\s*\)/gi;
        imageInfo.data = imageInfo.data.replace(regex, '$1');

        this.updateDrawioImage(imageInfo, () => {
          postMessage({
            action: 'status',
            messageKey: 'allChangesSaved',
            modified: false
          });
          fetch(imageInfo.imageURL, { cache: 'reload' }).then(() => {
            document.querySelectorAll(`img[data-src='${imageInfo.imageURL}']`).forEach(imageElement => {
              (imageElement as HTMLImageElement).src = imageInfo.imageURL;
              const blockElement = imageElement.closest("div[data-type='NodeParagraph']") as HTMLElement;
              if (blockElement) {
                this.updateAttrLabel(imageInfo, blockElement);
              }
            });
          });
        });
      }
    }

    const onExit = (message: any) => {
      dialog.destroy();
    }

    const messageEventHandler = (event) => {
      if (event.data && event.data.length > 0) {
        try {
          var message = JSON.parse(event.data);
          if (message != null) {
            // console.log(message.event);
            if (message.event == "init") {
              onInit(message);
            }
            else if (message.event == "load") {
              onLoad(message);
            }
            else if (message.event == "save" || message.event == "autosave") {
              onSave(message);
            }
            else if (message.event == "export") {
              onExport(message);
            }
            else if (message.event == "exit") {
              onExit(message);
            }
          }
        }
        catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener("message", messageEventHandler);
    dialogDestroyCallbacks.push(() => {
      window.removeEventListener("message", messageEventHandler);
    });
  }

  public openLightboxDialog(imageInfo: DrawioImageInfo) {
    const lightboxDialogHTML = `
<div class="drawio-lightbox-dialog">
    <div class="edit-dialog-header resize__move"></div>
    <div class="edit-dialog-container">
        <div class="edit-dialog-editor">
            <iframe src="/plugins/siyuan-embed-drawio/draw/index.html?proto=json&embed=1${this.isMobile ? "&ui=min" : ""}&lang=${window.siyuan.config.lang.split('_')[0]}&lightbox=1"></iframe>
        </div>
        <div class="fn__hr--b"></div>
    </div>
</div>
    `;

    const dialogDestroyCallbacks = [];

    const dialog = new Dialog({
      content: lightboxDialogHTML,
      width: this.isMobile ? "92vw" : "90vw",
      height: "80vh",
      hideCloseIcon: this.isMobile,
      destroyCallback: () => {
        dialogDestroyCallbacks.forEach(callback => callback());
      },
    });

    const iframe = dialog.element.querySelector("iframe");
    iframe.focus();

    const postMessage = (message: any) => {
      if (!iframe.contentWindow) return;
      iframe.contentWindow.postMessage(JSON.stringify(message), '*');
    };

    const onInit = (message: any) => {
      postMessage({
        action: "load",
        autosave: 0,
        modified: 'unsavedChanges',
        title: this.isMobile ? '' : imageInfo.imageURL,
        xml: imageInfo.data,
      });
    }

    const messageEventHandler = (event) => {
      if (event.data && event.data.length > 0) {
        try {
          var message = JSON.parse(event.data);
          if (message != null) {
            // console.log(message.event);
            if (message.event == "init") {
              onInit(message);
            }
          }
        }
        catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener("message", messageEventHandler);
    dialogDestroyCallbacks.push(() => {
      window.removeEventListener("message", messageEventHandler);
    });
  }
}
