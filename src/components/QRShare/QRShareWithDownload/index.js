"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var getQrCodeDownloadFileName_1 = require("@components/QRShare/getQrCodeDownloadFileName");
var useNetwork_1 = require("@hooks/useNetwork");
var fileDownload_1 = require("@libs/fileDownload");
var __1 = require("..");
function QRShareWithDownload(props, ref) {
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var qrShareRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        download: function () {
            return new Promise(function (resolve, reject) {
                var _a;
                // eslint-disable-next-line es/no-optional-chaining
                var svg = (_a = qrShareRef.current) === null || _a === void 0 ? void 0 : _a.getSvg();
                if (!svg) {
                    reject();
                    return;
                }
                svg.toDataURL(function (dataURL) { var _a; return resolve((0, fileDownload_1.default)(dataURL, (0, getQrCodeDownloadFileName_1.default)((_a = props.title) !== null && _a !== void 0 ? _a : 'QRCode'))); });
            });
        },
    }); }, [props.title]);
    return (<__1.default ref={qrShareRef} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} logo={isOffline ? undefined : props.logo}/>);
}
QRShareWithDownload.displayName = 'QRShareWithDownload';
exports.default = (0, react_1.forwardRef)(QRShareWithDownload);
