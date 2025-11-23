// 复制自思源源码

const isMac = () => {
    return navigator.platform.toUpperCase().indexOf("MAC") > -1;
};

const isNotCtrl = (event: KeyboardEvent | MouseEvent) => {
    if (!event.metaKey && !event.ctrlKey) {
        return true;
    }
    return false;
};

const isOnlyMeta = (event: KeyboardEvent | MouseEvent) => {
    if (isMac()) {
        // mac
        if (event.metaKey && !event.ctrlKey) {
            return true;
        }
        return false;
    } else {
        if (!event.metaKey && event.ctrlKey) {
            return true;
        }
        return false;
    }
};

const getFunctionKey = () => {
    const fData: { [key: number]: string } = {};
    for (let i = 1; i <= 32; i++) {
        fData[i + 111] = "F" + i;
    }
    return fData;
};

const Constants = {
    ZWSP: "\u200b",
    KEYCODELIST: Object.assign(getFunctionKey(), {
        8: "⌫",
        9: "⇥",
        13: "↩",
        16: "⇧",
        17: "⌃",
        18: "⌥",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "←",
        38: "↑",
        39: "→",
        40: "↓",
        44: "PrintScreen",
        45: "Insert",
        46: "⌦",
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        65: "A",
        66: "B",
        67: "C",
        68: "D",
        69: "E",
        70: "F",
        71: "G",
        72: "H",
        73: "I",
        74: "J",
        75: "K",
        76: "L",
        77: "M",
        78: "N",
        79: "O",
        80: "P",
        81: "Q",
        82: "R",
        83: "S",
        84: "T",
        85: "U",
        86: "V",
        87: "W",
        88: "X",
        89: "Y",
        90: "Z",
        91: "⌘",
        92: "⌘",
        93: "ContextMenu",
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        144: "NumLock",
        145: "ScrollLock",
        182: "MyComputer",
        183: "MyCalculator",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'",
    })
}

const replaceDirect = (hotKey: string, keyCode: string) => {
    const hotKeys = hotKey.replace(keyCode, Constants.ZWSP).split("");
    hotKeys.forEach((item, index) => {
        if (item === Constants.ZWSP) {
            hotKeys[index] = keyCode;
        }
    });
    return hotKeys;
};

export const matchHotKey = (hotKey: string, event: KeyboardEvent) => {
    if (!hotKey) {
        return false;
    }

    // https://github.com/siyuan-note/siyuan/issues/9770
    if (hotKey.startsWith("⌃") && !isMac()) {
        if (hotKey === "⌃D") {
            // https://github.com/siyuan-note/siyuan/issues/9841
            return false;
        }
        hotKey = hotKey.replace("⌘", "").replace("⌃", "⌘")
            .replace("⌘⇧", "⇧⌘")
            .replace("⌘⌥⇧", "⌥⇧⌘")
            .replace("⌘⌥", "⌥⌘");
    }

    // []
    if (hotKey.indexOf("⇧") === -1 && hotKey.indexOf("⌘") === -1 && hotKey.indexOf("⌥") === -1 && hotKey.indexOf("⌃") === -1) {
        if (isNotCtrl(event) && !event.altKey && !event.shiftKey && hotKey === Constants.KEYCODELIST[event.keyCode]) {
            return true;
        }
        return false;
    }

    let hotKeys = hotKey.split("");
    if (hotKey.indexOf("F") > -1) {
        hotKeys.forEach((item, index) => {
            if (item === "F") {
                // F1-F12
                hotKeys[index] = "F" + hotKeys.splice(index + 1, 1);
                if (hotKeys[index + 1]) {
                    hotKeys[index + 1] += hotKeys.splice(index + 1, 1);
                }
            }
        });
    } else if (hotKey.indexOf("PageUp") > -1) {
        hotKeys = replaceDirect(hotKey, "PageUp");
    } else if (hotKey.indexOf("PageDown") > -1) {
        hotKeys = replaceDirect(hotKey, "PageDown");
    } else if (hotKey.indexOf("Home") > -1) {
        hotKeys = replaceDirect(hotKey, "Home");
    } else if (hotKey.indexOf("End") > -1) {
        hotKeys = replaceDirect(hotKey, "End");
    }

    // 是否匹配 ⇧[]
    if (hotKey.startsWith("⇧") && hotKeys.length === 2) {
        if (isNotCtrl(event) && !event.altKey && event.shiftKey && hotKeys[1] === Constants.KEYCODELIST[event.keyCode]) {
            return true;
        }
        return false;
    }

    if (hotKey.startsWith("⌥")) {
        let keyCode = hotKeys.length === 3 ? hotKeys[2] : hotKeys[1];
        if (hotKeys.length === 4) {
            keyCode = hotKeys[3];
        }
        const isMatchKey = keyCode === Constants.KEYCODELIST[event.keyCode];
        // 是否匹配 ⌥[] / ⌥⌘[]
        if (isMatchKey && event.altKey && !event.shiftKey && hotKeys.length < 4 &&
            (hotKeys.length === 3 ? (isOnlyMeta(event) && hotKey.startsWith("⌥⌘")) : isNotCtrl(event))) {
            return true;
        }
        // ⌥⇧⌘[]
        if (isMatchKey && hotKey.startsWith("⌥⇧⌘") && hotKeys.length === 4 &&
            event.altKey && event.shiftKey && isOnlyMeta(event)) {
            return true;
        }
        // ⌥⇧[]
        if (isMatchKey && hotKey.startsWith("⌥⇧") && hotKeys.length === 3 &&
            event.altKey && event.shiftKey && isNotCtrl(event)) {
            return true;
        }
        return false;
    }

    // 是否匹配 ⌃[] / ⌃⌘[] / ⌃⌥[] / ⌃⇧[]/ ⌃⌥⇧[]
    if (hotKey.startsWith("⌃")) {
        if (!isMac()) {
            return false;
        }
        let keyCode = hotKeys.length === 3 ? hotKeys[2] : hotKeys[1];
        if (hotKeys.length === 4) {
            keyCode = hotKeys[3];
        } else if (hotKeys.length === 5) {
            keyCode = hotKeys[4];
        }

        const isMatchKey = keyCode === Constants.KEYCODELIST[event.keyCode];
        // 是否匹配 ⌃[] / ⌃⌘[]
        if (isMatchKey && event.ctrlKey && !event.altKey && !event.shiftKey && hotKeys.length < 4 &&
            (hotKeys.length === 3 ? (event.metaKey && hotKey.startsWith("⌃⌘")) : !event.metaKey)) {
            return true;
        }
        // ⌃⇧[]
        if (isMatchKey && hotKey.startsWith("⌃⇧") && hotKeys.length === 3 &&
            event.ctrlKey && !event.altKey && event.shiftKey && !event.metaKey) {
            return true;
        }
        // ⌃⌥[]
        if (isMatchKey && hotKey.startsWith("⌃⌥") && hotKeys.length === 3 &&
            event.ctrlKey && event.altKey && !event.shiftKey && !event.metaKey) {
            return true;
        }
        // ⌃⌥⇧[] / ⌃⌥⌘[] / ⌃⇧⌘[]
        if (isMatchKey && hotKeys.length === 4 && event.ctrlKey &&
            (
                (hotKey.startsWith("⌃⌥⇧") && event.shiftKey && !event.metaKey && event.altKey) ||
                (hotKey.startsWith("⌃⌥⌘") && !event.shiftKey && event.metaKey && event.altKey) ||
                (hotKey.startsWith("⌃⇧⌘") && event.shiftKey && event.metaKey && !event.altKey)
            )
        ) {
            return true;
        }

        // ⌃⌥⇧⌘[]
        if (isMatchKey && hotKeys.length === 5 && event.ctrlKey && event.shiftKey && event.metaKey && event.altKey) {
            return true;
        }
        return false;
    }

    // 是否匹配 ⇧⌘[] / ⌘[]
    const hasShift = hotKeys.length > 2 && (hotKeys[0] === "⇧");
    if (isOnlyMeta(event) && !event.altKey && ((!hasShift && !event.shiftKey) || (hasShift && event.shiftKey))) {
        return (hasShift ? hotKeys[2] : hotKeys[1]) === Constants.KEYCODELIST[event.keyCode];
    }
    return false;
};
