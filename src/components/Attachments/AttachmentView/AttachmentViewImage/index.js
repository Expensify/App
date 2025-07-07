"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ImageView_1 = require("@components/ImageView");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function AttachmentViewImage(_a) {
    var _b;
    var url = _a.url, file = _a.file, isAuthTokenRequired = _a.isAuthTokenRequired, loadComplete = _a.loadComplete, onPress = _a.onPress, onError = _a.onError, isImage = _a.isImage;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var children = (<ImageView_1.default onError={onError} url={url} fileName={(_b = file === null || file === void 0 ? void 0 : file.name) !== null && _b !== void 0 ? _b : ''} isAuthTokenRequired={isImage && isAuthTokenRequired}/>);
    return onPress ? (<PressableWithoutFeedback_1.default onPress={onPress} disabled={loadComplete} style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]} accessibilityRole={CONST_1.default.ROLE.BUTTON} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    accessibilityLabel={(file === null || file === void 0 ? void 0 : file.name) || translate('attachmentView.unknownFilename')}>
            {children}
        </PressableWithoutFeedback_1.default>) : (children);
}
AttachmentViewImage.displayName = 'AttachmentViewImage';
exports.default = (0, react_1.memo)(AttachmentViewImage);
