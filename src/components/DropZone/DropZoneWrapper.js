"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useDragAndDrop_1 = require("@hooks/useDragAndDrop");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var htmlDivElementRef_1 = require("@src/types/utils/htmlDivElementRef");
var viewRef_1 = require("@src/types/utils/viewRef");
function DropZoneWrapper(_a) {
    var onDrop = _a.onDrop, children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    var dropZone = (0, react_1.useRef)(null);
    var isDraggingOver = (0, useDragAndDrop_1.default)({
        shouldAcceptDrop: function (event) { var _a; return !!((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types.some(function (type) { return type === 'Files'; })); },
        onDrop: onDrop,
        shouldStopPropagation: false,
        shouldHandleDragEvent: false,
        dropZone: (0, htmlDivElementRef_1.default)(dropZone),
    }).isDraggingOver;
    return (<react_native_1.View ref={(0, viewRef_1.default)(dropZone)} style={styles.flex1}>
            {children({ isDraggingOver: isDraggingOver })}
        </react_native_1.View>);
}
exports.default = DropZoneWrapper;
