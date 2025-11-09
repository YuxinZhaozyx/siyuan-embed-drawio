import {
  Dialog,
  Plugin,
  getFrontend,
  fetchPost,
  IWebSocketData,
} from "siyuan";
import "@/index.scss";
import PluginInfoString from '@/../plugin.json';
import { unescapeHTML, escapeHTML, base64ToUnicode } from "./utils";
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

  private _openMenuImageHandler;
  private _globalKeyDownHandler;

  async onload() {
    this.initMetaInfo();

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
    if (this._openMenuImageHandler) this.eventBus.off("open-menu-image", this._openMenuImageHandler);
    if (this._globalKeyDownHandler) document.documentElement.removeEventListener("keydown", this._globalKeyDownHandler);
  }

  // openSetting() {
  // }

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

  public async getDrawioImageInfo(imageURL: string): Promise<DrawioImageInfo | null> {
    const imageURLRegex = /^assets\/.+\.svg$/;
    if (!imageURLRegex.test(imageURL)) return null;

    const svgContent = await this.getDrawioImage(imageURL);
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

  public async getDrawioImage(imageURL: string): Promise<string> {
    const response = await fetch(imageURL);
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

  private openMenuImageHandler({ detail }) {
    const selectedElement = detail.element;
    const imageElement = selectedElement.querySelector("img") as HTMLImageElement;
    const imageURL = imageElement.dataset.src;
    this.getDrawioImageInfo(imageURL).then((imageInfo: DrawioImageInfo) => {
      if (imageInfo) {
        window.siyuan.menus.menu.addItem({
          id: "edit-drawio",
          icon: 'iconEdit',
          label: `${this.i18n.editDrawio}`,
          index: 1,
          click: () => {
            this.openEditDialog(imageInfo);
          }
        })
      }
    })
  }

  private globalKeyDownHandler = (event: KeyboardEvent) => {
    // 如果是在代码编辑器里使用快捷键，则阻止冒泡 https://github.com/YuxinZhaozyx/siyuan-embed-tikz/issues/1
    if (document.activeElement.closest(".b3-dialog--open .tikz-edit-dialog")) {
      event.stopPropagation();
    }
  };

  public openEditDialog(imageInfo: DrawioImageInfo) {
    const editDialogHTML = `
<div class="drawio-edit-dialog">
    <div class="edit-dialog-header resize__move"></div>
    <div class="edit-dialog-container">
        <div class="edit-dialog-editor">
            <iframe src="/plugins/siyuan-embed-drawio/drawio/index.html?mode=trello&proto=json&embed=1&lang=${window.siyuan.config.lang.split('_')[0]}"></iframe>
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

    const onSave = (message: any) => {
      postMessage({
        action: 'export', 
        format:'xmlsvg'
      });
    }

    const onExport = (message: any) => {
      if (message.format == 'svg') {
        const base64String = message.data.split(';base64,').pop();
        imageInfo.data = base64ToUnicode(base64String);
        this.updateDrawioImage(imageInfo, () => {
          postMessage({
            action: 'status', 
            messageKey: 'allChangesSaved',
            modified: false
          });
          const timestamp = Date.now();
          document.querySelectorAll(`img[data-src='${imageInfo.imageURL}']`).forEach(imageElement => {
            (imageElement as HTMLImageElement).src = imageInfo.imageURL + "?t=" + timestamp; // 重载图片，加时间戳以避免浏览器缓存图片
          });
        });
      }
    }

    const onExit = (message: any) => {
      dialog.destroy();
    }

    const messageEventHandler = (event) => {
      if (event.data && event.data.length > 0)
      {
        try
        {
          var message = JSON.parse(event.data);
          if (message != null)
          {
            // console.log(message.event);
            if (message.event == "init") {
              onInit(message);
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
        catch (err)
        {
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
