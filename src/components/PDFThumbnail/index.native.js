"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_pdf_1 = require("react-native-pdf");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var PDFThumbnailError_1 = require("./PDFThumbnailError");
function PDFThumbnail(_a) {
    var previewSourceURL = _a.previewSourceURL, style = _a.style, _b = _a.isAuthTokenRequired, isAuthTokenRequired = _b === void 0 ? false : _b, _c = _a.enabled, enabled = _c === void 0 ? true : _c, _d = _a.fitPolicy, fitPolicy = _d === void 0 ? 0 : _d, onPassword = _a.onPassword, onLoadError = _a.onLoadError, onLoadSuccess = _a.onLoadSuccess;
    var styles = (0, useThemeStyles_1.default)();
    var sizeStyles = [styles.w100, styles.h100];
    var _e = (0, react_1.useState)(false), failedToLoad = _e[0], setFailedToLoad = _e[1];
    return (<react_native_1.View style={[style, styles.overflowHidden]}>
            <react_native_1.View style={[sizeStyles, !failedToLoad && styles.alignItemsCenter, styles.justifyContentCenter]}>
                {enabled && !failedToLoad && (<react_native_pdf_1.default fitPolicy={fitPolicy} trustAllCerts={false} renderActivityIndicator={function () { return <FullscreenLoadingIndicator_1.default />; }} source={{ uri: isAuthTokenRequired ? (0, addEncryptedAuthTokenToURL_1.default)(previewSourceURL) : previewSourceURL }} singlePage style={sizeStyles} onError={function (error) {
                if ('message' in error && typeof error.message === 'string' && error.message.match(/password/i) && onPassword) {
                    onPassword();
                    return;
                }
                if (onLoadError) {
                    onLoadError();
                }
                setFailedToLoad(true);
            }} onLoadComplete={function () {
                if (!onLoadSuccess) {
                    return;
                }
                onLoadSuccess();
            }}/>)}
                {failedToLoad && <PDFThumbnailError_1.default />}
            </react_native_1.View>
        </react_native_1.View>);
}
PDFThumbnail.displayName = 'PDFThumbnail';
exports.default = react_1.default.memo(PDFThumbnail);
