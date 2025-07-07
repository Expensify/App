"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WINDOW_WIDTH = 700;
var WINDOW_HEIGHT = 600;
var handleOpenBankConnectionFlow = function (url) {
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    var left = (screenWidth - WINDOW_WIDTH) / 2;
    var top = (screenHeight - WINDOW_HEIGHT) / 2;
    var popupFeatures = "width=".concat(WINDOW_WIDTH, ",height=").concat(WINDOW_HEIGHT, ",left=").concat(left, ",top=").concat(top, ",scrollbars=yes,resizable=yes");
    return window.open(url, 'popupWindow', popupFeatures);
};
exports.default = handleOpenBankConnectionFlow;
