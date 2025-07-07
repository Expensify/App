"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useEReceipt_1 = require("@hooks/useEReceipt");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var colors_1 = require("@styles/theme/colors");
var variables_1 = require("@styles/variables");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var ImageSVG_1 = require("./ImageSVG");
var Text_1 = require("./Text");
function EReceiptThumbnail(_a) {
    var transactionID = _a.transactionID, borderRadius = _a.borderRadius, fileExtension = _a.fileExtension, _b = _a.isReceiptThumbnail, isReceiptThumbnail = _b === void 0 ? false : _b, _c = _a.centerIconV, centerIconV = _c === void 0 ? true : _c, _d = _a.iconSize, iconSize = _d === void 0 ? 'large' : _d;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID))[0];
    var _e = (0, useEReceipt_1.default)(transaction, fileExtension, isReceiptThumbnail), primaryColor = _e.primaryColor, secondaryColor = _e.secondaryColor, MCCIcon = _e.MCCIcon, tripIcon = _e.tripIcon, backgroundImage = _e.backgroundImage;
    var isPerDiemRequest = (0, TransactionUtils_1.isPerDiemRequest)(transaction);
    var receiptIconWidth = variables_1.default.eReceiptIconWidth;
    var receiptIconHeight = variables_1.default.eReceiptIconHeight;
    var receiptMCCSize = variables_1.default.eReceiptMCCHeightWidth;
    var labelFontSize = variables_1.default.fontSizeNormal;
    var labelLineHeight = variables_1.default.lineHeightLarge;
    var backgroundImageMinWidth = variables_1.default.eReceiptBackgroundImageMinWidth;
    if (iconSize === 'x-small') {
        receiptIconWidth = variables_1.default.eReceiptIconWidthXSmall;
        receiptIconHeight = variables_1.default.eReceiptIconHeightXSmall;
        receiptMCCSize = variables_1.default.iconSizeXSmall;
        labelFontSize = variables_1.default.fontSizeExtraSmall;
        labelLineHeight = variables_1.default.lineHeightXSmall;
        backgroundImageMinWidth = variables_1.default.w80;
    }
    else if (iconSize === 'small') {
        receiptIconWidth = variables_1.default.eReceiptIconWidthSmall;
        receiptIconHeight = variables_1.default.eReceiptIconHeightSmall;
        receiptMCCSize = variables_1.default.eReceiptMCCHeightWidthSmall;
        labelFontSize = variables_1.default.fontSizeExtraSmall;
        labelLineHeight = variables_1.default.lineHeightXSmall;
    }
    else if (iconSize === 'medium') {
        receiptIconWidth = variables_1.default.eReceiptIconWidthMedium;
        receiptIconHeight = variables_1.default.eReceiptIconHeightMedium;
        receiptMCCSize = variables_1.default.eReceiptMCCHeightWidthMedium;
        labelFontSize = variables_1.default.fontSizeLabel;
        labelLineHeight = variables_1.default.lineHeightNormal;
    }
    return (<react_native_1.View style={[
            styles.flex1,
            primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : {},
            styles.overflowHidden,
            styles.alignItemsCenter,
            centerIconV ? styles.justifyContentCenter : {},
            borderRadius ? { borderRadius: borderRadius } : {},
        ]}>
            <react_native_1.View style={[styles.eReceiptBackgroundThumbnail, StyleUtils.getMinimumWidth(backgroundImageMinWidth)]}>
                <ImageSVG_1.default src={backgroundImage}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.alignItemsCenter, styles.ph8, styles.pt8, styles.pb8]}>
                <react_native_1.View style={[StyleUtils.getWidthAndHeightStyle(receiptIconWidth, receiptIconHeight), styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon_1.default src={Expensicons.EReceiptIcon} height={receiptIconHeight} width={receiptIconWidth} fill={secondaryColor} additionalStyles={[styles.fullScreen]}/>
                    {isReceiptThumbnail && !!fileExtension && (<Text_1.default selectable={false} style={[
                styles.labelStrong,
                StyleUtils.getFontSizeStyle(labelFontSize),
                StyleUtils.getLineHeightStyle(labelLineHeight),
                StyleUtils.getTextColorStyle(primaryColor !== null && primaryColor !== void 0 ? primaryColor : colors_1.default.black),
            ]}>
                            {fileExtension.toUpperCase()}
                        </Text_1.default>)}
                    {isPerDiemRequest ? (<Icon_1.default src={Expensicons.CalendarSolid} height={receiptMCCSize} width={receiptMCCSize} fill={primaryColor}/>) : null}
                    {!isPerDiemRequest && MCCIcon && !isReceiptThumbnail ? (<Icon_1.default src={MCCIcon} height={receiptMCCSize} width={receiptMCCSize} fill={primaryColor}/>) : null}
                    {!isPerDiemRequest && !MCCIcon && tripIcon ? (<Icon_1.default src={tripIcon} height={receiptMCCSize} width={receiptMCCSize} fill={primaryColor}/>) : null}
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
EReceiptThumbnail.displayName = 'EReceiptThumbnail';
exports.default = EReceiptThumbnail;
