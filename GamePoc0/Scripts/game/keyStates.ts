var KEY_STATE_DOWN_FLAG = 1;
var KEY_STATE_RELEASED = 0;
var KEY_STATE_PRESSING = 1;
var KEY_STATE_PRESSED = 3;
var keyStates = {
    setKeyDown: function (keyCharCode: number) {
        this[keyCharCode] = (this[keyCharCode] & KEY_STATE_DOWN_FLAG) ? KEY_STATE_PRESSED : KEY_STATE_PRESSING;
    },
    setKeyUp: function (keyCharCode: number) {
        this[keyCharCode] = KEY_STATE_RELEASED;
    },
    isCharDown: function (ch: string) {
        return this.isKeyDown(ch.charCodeAt(0));
    },
    isKeyDown: function (keyCharCode: number) {
        return this[keyCharCode] & KEY_STATE_DOWN_FLAG;
    },
    isKeyUp: function (keyCharCode: number) {
        return (this[keyCharCode] & KEY_STATE_DOWN_FLAG) == 0;
    },
    isKeyGoingDown: function (keyCharCode: number) {
        return this[keyCharCode] == KEY_STATE_PRESSING;
    }
};

document.onkeydown = function (e) {
    //var realEvent = e ? e : (KeyboardEvent)(window.event);
    keyStates.setKeyDown(e.keyCode);
    //console.log("Key " + realEvent.keyCode + " going down. W=" + "W".charCodeAt(0) + ", A=", "A".charCodeAt(0));
};
document.onkeyup = function (e) {
    //var realEvent = e ? e : window.event;
    keyStates.setKeyUp(e.keyCode);
};