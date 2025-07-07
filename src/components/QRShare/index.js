"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var expensify_wordmark_svg_1 = require("@assets/images/expensify-wordmark.svg");
var ImageSVG_1 = require("@components/ImageSVG");
var QRCode_1 = require("@components/QRCode");
var Text_1 = require("@components/Text");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var variables_1 = require("@styles/variables");
function QRShare(_a, ref) {
    var url = _a.url, title = _a.title, subtitle = _a.subtitle, logo = _a.logo, svgLogo = _a.svgLogo, svgLogoFillColor = _a.svgLogoFillColor, logoBackgroundColor = _a.logoBackgroundColor, logoRatio = _a.logoRatio, logoMarginRatio = _a.logoMarginRatio, _b = _a.shouldShowExpensifyLogo, shouldShowExpensifyLogo = _b === void 0 ? true : _b, additionalStyles = _a.additionalStyles, size = _a.size;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var qrCodeContainerWidth = shouldUseNarrowLayout ? windowWidth : variables_1.default.sideBarWidth;
    var _c = (0, react_1.useState)(qrCodeContainerWidth - styles.ph5.paddingHorizontal * 2 - variables_1.default.qrShareHorizontalPadding * 2), qrCodeSize = _c[0], setQrCodeSize = _c[1];
    var svgRef = (0, react_1.useRef)(undefined);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        getSvg: function () { return svgRef.current; },
    }); }, []);
    var onLayout = function (event) {
        var containerWidth = event.nativeEvent.layout.width - variables_1.default.qrShareHorizontalPadding * 2 || 0;
        setQrCodeSize(Math.max(1, containerWidth));
    };
    return (<react_native_1.View style={[styles.shareCodeContainer, additionalStyles]} onLayout={onLayout}>
            {shouldShowExpensifyLogo && (<react_native_1.View style={styles.expensifyQrLogo}>
                    <ImageSVG_1.default contentFit="contain" src={expensify_wordmark_svg_1.default} fill={theme.QRLogo}/>
                </react_native_1.View>)}

            <QRCode_1.default getRef={function (svg) { return (svgRef.current = svg); }} url={url} svgLogo={svgLogo} svgLogoFillColor={svgLogoFillColor} logoBackgroundColor={logoBackgroundColor} logo={logo} size={size !== null && size !== void 0 ? size : qrCodeSize} logoRatio={logoRatio} logoMarginRatio={logoMarginRatio}/>

            {!!title && (<Text_1.default family="EXP_NEW_KANSAS_MEDIUM" fontSize={variables_1.default.fontSizeXLarge} numberOfLines={2} style={styles.qrShareTitle}>
                    {title}
                </Text_1.default>)}

            {!!subtitle && (<Text_1.default fontSize={variables_1.default.fontSizeLabel} numberOfLines={2} style={[styles.mt1, styles.textAlignCenter]} color={theme.textSupporting}>
                    {subtitle}
                </Text_1.default>)}
        </react_native_1.View>);
}
QRShare.displayName = 'QRShare';
exports.default = (0, react_1.forwardRef)(QRShare);
