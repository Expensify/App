"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("core-js/proposals/promise-with-resolvers");
// eslint-disable-next-line import/extensions
var pdf_worker_min_mjs_1 = require("pdfjs-dist/build/pdf.worker.min.mjs");
// eslint-disable-next-line import/extensions
var pdf_worker_min_mjs_2 = require("pdfjs-dist/legacy/build/pdf.worker.min.mjs");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_pdf_1 = require("react-pdf");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var Browser_1 = require("@libs/Browser");
var PDFThumbnailError_1 = require("./PDFThumbnailError");
var shouldUseLegacyWorker = (0, Browser_1.isMobileSafari)() && !(0, Browser_1.isModernSafari)();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
var pdfWorker = shouldUseLegacyWorker ? pdf_worker_min_mjs_2.default : pdf_worker_min_mjs_1.default;
if (!react_pdf_1.pdfjs.GlobalWorkerOptions.workerSrc) {
    react_pdf_1.pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorker], { type: 'text/javascript' }));
}
function PDFThumbnail(_a) {
    var previewSourceURL = _a.previewSourceURL, style = _a.style, _b = _a.isAuthTokenRequired, isAuthTokenRequired = _b === void 0 ? false : _b, _c = _a.enabled, enabled = _c === void 0 ? true : _c, onPassword = _a.onPassword, onLoadError = _a.onLoadError, onLoadSuccess = _a.onLoadSuccess;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, react_1.useState)(false), failedToLoad = _d[0], setFailedToLoad = _d[1];
    var thumbnail = (0, react_1.useMemo)(function () { return (<react_pdf_1.Document loading={<FullscreenLoadingIndicator_1.default />} file={isAuthTokenRequired ? (0, addEncryptedAuthTokenToURL_1.default)(previewSourceURL) : previewSourceURL} options={{
            cMapUrl: 'cmaps/',
            cMapPacked: true,
        }} externalLinkTarget="_blank" onPassword={onPassword} onLoad={function () {
            setFailedToLoad(false);
        }} onLoadSuccess={function () {
            if (!onLoadSuccess) {
                return;
            }
            onLoadSuccess();
        }} onLoadError={function () {
            if (onLoadError) {
                onLoadError();
            }
            setFailedToLoad(true);
        }} error={function () { return null; }}>
                <react_native_1.View pointerEvents="none">
                    <react_pdf_1.Thumbnail pageIndex={0}/>
                </react_native_1.View>
            </react_pdf_1.Document>); }, [isAuthTokenRequired, previewSourceURL, onPassword, onLoadError, onLoadSuccess]);
    return (<react_native_1.View style={[style, styles.overflowHidden, failedToLoad && styles.h100]}>
            <react_native_1.View style={[styles.w100, styles.h100, !failedToLoad && __assign(__assign({}, styles.alignItemsCenter), styles.justifyContentCenter)]}>
                {enabled && !failedToLoad && thumbnail}
                {failedToLoad && <PDFThumbnailError_1.default />}
            </react_native_1.View>
        </react_native_1.View>);
}
PDFThumbnail.displayName = 'PDFThumbnail';
exports.default = react_1.default.memo(PDFThumbnail);
