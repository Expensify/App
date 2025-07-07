"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_qrcode_svg_1 = require("react-native-qrcode-svg");
var useTheme_1 = require("@hooks/useTheme");
var CONST_1 = require("@src/CONST");
function QRCode(_a) {
    var url = _a.url, logo = _a.logo, svgLogo = _a.svgLogo, svgLogoFillColor = _a.svgLogoFillColor, logoBackgroundColor = _a.logoBackgroundColor, getRef = _a.getRef, _b = _a.size, size = _b === void 0 ? 120 : _b, color = _a.color, backgroundColor = _a.backgroundColor, _c = _a.logoRatio, logoRatio = _c === void 0 ? CONST_1.default.QR.DEFAULT_LOGO_SIZE_RATIO : _c, _d = _a.logoMarginRatio, logoMarginRatio = _d === void 0 ? CONST_1.default.QR.DEFAULT_LOGO_MARGIN_RATIO : _d;
    var theme = (0, useTheme_1.default)();
    return (<react_native_qrcode_svg_1.default getRef={getRef} value={url} size={size} logo={logo} logoSVG={svgLogo} logoColor={svgLogoFillColor} logoBackgroundColor={logoBackgroundColor !== null && logoBackgroundColor !== void 0 ? logoBackgroundColor : theme.appBG} logoSize={size * logoRatio} logoMargin={size * logoMarginRatio} logoBorderRadius={size} backgroundColor={backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.appBG} color={color !== null && color !== void 0 ? color : theme.text}/>);
}
QRCode.displayName = 'QRCode';
exports.default = QRCode;
