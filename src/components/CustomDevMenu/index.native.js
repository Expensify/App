"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var TestTool_1 = require("@userActions/TestTool");
var CustomDevMenu = Object.assign(function () {
    (0, react_1.useEffect)(function () {
        react_native_1.DevSettings.addMenuItem('Open Test Preferences', TestTool_1.default);
    }, []);
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}, {
    displayName: 'CustomDevMenu',
});
exports.default = CustomDevMenu;
