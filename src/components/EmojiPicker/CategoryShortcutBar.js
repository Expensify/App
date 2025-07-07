"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CategoryShortcutButton_1 = require("./CategoryShortcutButton");
function CategoryShortcutBar(_a) {
    var onPress = _a.onPress, headerEmojis = _a.headerEmojis;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.ph4, styles.flexRow]}>
            {headerEmojis.map(function (headerEmoji) { return (<CategoryShortcutButton_1.default icon={headerEmoji.icon} onPress={function () { return onPress(headerEmoji.index); }} key={"categoryShortcut".concat(headerEmoji.index)} code={headerEmoji.code}/>); })}
        </react_native_1.View>);
}
CategoryShortcutBar.displayName = 'CategoryShortcutBar';
exports.default = CategoryShortcutBar;
