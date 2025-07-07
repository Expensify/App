"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_view_shot_1 = require("react-native-view-shot");
var getQrCodeDownloadFileName_1 = require("@components/QRShare/getQrCodeDownloadFileName");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var fileDownload_1 = require("@libs/fileDownload");
var __1 = require("..");
function QRShareWithDownload(props, ref) {
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var qrCodeScreenshotRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        download: function () { var _a, _b; return (_b = (_a = qrCodeScreenshotRef.current) === null || _a === void 0 ? void 0 : _a.capture) === null || _b === void 0 ? void 0 : _b.call(_a).then(function (uri) { var _a; return (0, fileDownload_1.default)(uri, (0, getQrCodeDownloadFileName_1.default)((_a = props.title) !== null && _a !== void 0 ? _a : 'QRCode'), translate('fileDownload.success.qrMessage')); }); },
    }); }, [props.title, translate]);
    return (<react_native_view_shot_1.default ref={qrCodeScreenshotRef}>
            <__1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} logo={isOffline ? undefined : props.logo}/>
        </react_native_view_shot_1.default>);
}
QRShareWithDownload.displayName = 'QRShareWithDownload';
exports.default = (0, react_1.forwardRef)(QRShareWithDownload);
