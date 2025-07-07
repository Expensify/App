"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragAndDropContext = void 0;
/* eslint-disable react-compiler/react-compiler */
var portal_1 = require("@gorhom/portal");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useDragAndDrop_1 = require("@hooks/useDragAndDrop");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var htmlDivElementRef_1 = require("@src/types/utils/htmlDivElementRef");
var viewRef_1 = require("@src/types/utils/viewRef");
var DragAndDropContext = react_1.default.createContext({});
exports.DragAndDropContext = DragAndDropContext;
function shouldAcceptDrop(event) {
    var _a;
    return !!((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types.some(function (type) { return type === 'Files'; }));
}
function DragAndDropProvider(_a) {
    var children = _a.children, _b = _a.isDisabled, isDisabled = _b === void 0 ? false : _b, _c = _a.setIsDraggingOver, setIsDraggingOver = _c === void 0 ? function () { } : _c;
    var styles = (0, useThemeStyles_1.default)();
    var dropZone = (0, react_1.useRef)(null);
    var dropZoneID = (0, react_1.useRef)(expensify_common_1.Str.guid('drag-n-drop'));
    var onDropHandler = (0, react_1.useRef)(function () { });
    var setOnDropHandler = (0, react_1.useCallback)(function (callback) {
        onDropHandler.current = callback;
    }, []);
    var isDraggingOver = (0, useDragAndDrop_1.default)({
        dropZone: (0, htmlDivElementRef_1.default)(dropZone),
        onDrop: onDropHandler.current,
        shouldAcceptDrop: shouldAcceptDrop,
        isDisabled: isDisabled,
    }).isDraggingOver;
    (0, react_1.useEffect)(function () {
        setIsDraggingOver(isDraggingOver);
    }, [isDraggingOver, setIsDraggingOver]);
    var contextValue = (0, react_1.useMemo)(function () { return ({ isDraggingOver: isDraggingOver, setOnDropHandler: setOnDropHandler, dropZoneID: dropZoneID.current }); }, [isDraggingOver, setOnDropHandler]);
    return (<DragAndDropContext.Provider value={contextValue}>
            <react_native_1.View ref={(0, viewRef_1.default)(dropZone)} style={[styles.flex1, styles.w100, styles.h100]}>
                {isDraggingOver && (<react_native_1.View style={[styles.fullScreen, styles.invisibleOverlay]}>
                        <portal_1.PortalHost name={dropZoneID.current}/>
                    </react_native_1.View>)}
                {children}
            </react_native_1.View>
        </DragAndDropContext.Provider>);
}
DragAndDropProvider.displayName = 'DragAndDropProvider';
exports.default = DragAndDropProvider;
