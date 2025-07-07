"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var ShortcutManager = react_native_1.NativeModules.ShortcutManager;
exports.default = ShortcutManager ||
    {
        removeAllDynamicShortcuts: function () { },
    };
