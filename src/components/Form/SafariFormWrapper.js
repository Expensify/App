"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Browser_1 = require("@libs/Browser");
/**
 * If we used any <input> without <form> wrapper, Safari 11+ would show the auto-fill suggestion popup.
 */
function SafariFormWrapper(_a) {
    var children = _a.children;
    if ((0, Browser_1.isSafari)()) {
        return <form>{children}</form>;
    }
    return children;
}
exports.default = SafariFormWrapper;
