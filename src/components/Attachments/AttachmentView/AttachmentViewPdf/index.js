"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PDFView_1 = require("@components/PDFView");
function AttachmentViewPdf(_a) {
    var file = _a.file, encryptedSourceUrl = _a.encryptedSourceUrl, isFocused = _a.isFocused, onPress = _a.onPress, onToggleKeyboard = _a.onToggleKeyboard, onLoadComplete = _a.onLoadComplete, style = _a.style, isUsedAsChatAttachment = _a.isUsedAsChatAttachment, onLoadError = _a.onLoadError;
    return (<PDFView_1.default onPress={onPress} isFocused={isFocused} sourceURL={encryptedSourceUrl} fileName={file === null || file === void 0 ? void 0 : file.name} style={style} onToggleKeyboard={onToggleKeyboard} onLoadComplete={onLoadComplete} isUsedAsChatAttachment={isUsedAsChatAttachment} onLoadError={onLoadError}/>);
}
exports.default = (0, react_1.memo)(AttachmentViewPdf);
