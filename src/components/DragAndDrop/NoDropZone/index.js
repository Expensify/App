"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useDragAndDrop_1 = require("@hooks/useDragAndDrop");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var htmlDivElementRef_1 = require("@src/types/utils/htmlDivElementRef");
var viewRef_1 = require("@src/types/utils/viewRef");
function NoDropZone(_a) {
    var children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    var noDropZone = (0, react_1.useRef)(null);
    (0, useDragAndDrop_1.default)({
        // eslint-disable-next-line react-compiler/react-compiler
        dropZone: (0, htmlDivElementRef_1.default)(noDropZone),
        shouldAllowDrop: false,
    });
    return (<react_native_1.View 
    // eslint-disable-next-line react-compiler/react-compiler
    ref={(0, viewRef_1.default)(noDropZone)} style={[styles.fullScreen]}>
            {children}
        </react_native_1.View>);
}
NoDropZone.displayName = 'NoDropZone';
exports.default = NoDropZone;
