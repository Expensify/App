"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BaseAnchorForCommentsOnly_1 = require("./BaseAnchorForCommentsOnly");
function AnchorForCommentsOnly(_a) {
    var onPress = _a.onPress, _b = _a.href, href = _b === void 0 ? '' : _b, props = __rest(_a, ["onPress", "href"]);
    var onLinkPress = function () {
        if (onPress) {
            onPress();
        }
        else {
            react_native_1.Linking.openURL(href);
        }
    };
    return (<BaseAnchorForCommentsOnly_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} href={href} onPress={onLinkPress}/>);
}
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';
exports.default = AnchorForCommentsOnly;
