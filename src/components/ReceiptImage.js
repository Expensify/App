"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var EReceiptThumbnail_1 = require("./EReceiptThumbnail");
var EReceiptWithSizeCalculation_1 = require("./EReceiptWithSizeCalculation");
var ImageWithLoading_1 = require("./ImageWithLoading");
var PDFThumbnail_1 = require("./PDFThumbnail");
var ReceiptEmptyState_1 = require("./ReceiptEmptyState");
var ThumbnailImage_1 = require("./ThumbnailImage");
function ReceiptImage(_a) {
    var transactionID = _a.transactionID, _b = _a.isPDFThumbnail, isPDFThumbnail = _b === void 0 ? false : _b, _c = _a.isThumbnail, isThumbnail = _c === void 0 ? false : _c, _d = _a.shouldUseThumbnailImage, shouldUseThumbnailImage = _d === void 0 ? false : _d, _e = _a.isEReceipt, isEReceipt = _e === void 0 ? false : _e, source = _a.source, isAuthTokenRequired = _a.isAuthTokenRequired, style = _a.style, fileExtension = _a.fileExtension, iconSize = _a.iconSize, loadingIconSize = _a.loadingIconSize, fallbackIcon = _a.fallbackIcon, fallbackIconSize = _a.fallbackIconSize, _f = _a.shouldUseInitialObjectPosition, shouldUseInitialObjectPosition = _f === void 0 ? false : _f, fallbackIconColor = _a.fallbackIconColor, fallbackIconBackground = _a.fallbackIconBackground, _g = _a.isEmptyReceipt, isEmptyReceipt = _g === void 0 ? false : _g, onPress = _a.onPress, transactionItem = _a.transactionItem, isPerDiemRequest = _a.isPerDiemRequest, shouldUseFullHeight = _a.shouldUseFullHeight, loadingIndicatorStyles = _a.loadingIndicatorStyles, thumbnailContainerStyles = _a.thumbnailContainerStyles;
    var styles = (0, useThemeStyles_1.default)();
    if (isEmptyReceipt) {
        return (<ReceiptEmptyState_1.default isThumbnail onPress={onPress} disabled={!onPress} shouldUseFullHeight={shouldUseFullHeight}/>);
    }
    if (isPDFThumbnail) {
        return (<PDFThumbnail_1.default previewSourceURL={source !== null && source !== void 0 ? source : ''} style={[styles.w100, styles.h100]}/>);
    }
    if (isEReceipt && !isPerDiemRequest) {
        return (<EReceiptWithSizeCalculation_1.default transactionID={transactionID} transactionItem={transactionItem}/>);
    }
    if (isThumbnail || (isEReceipt && isPerDiemRequest)) {
        var props = isThumbnail && { borderRadius: style === null || style === void 0 ? void 0 : style.borderRadius, fileExtension: fileExtension, isReceiptThumbnail: true };
        return (<react_native_1.View style={style !== null && style !== void 0 ? style : [styles.w100, styles.h100]}>
                <EReceiptThumbnail_1.default transactionID={transactionID} iconSize={iconSize} 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}/>
            </react_native_1.View>);
    }
    if (shouldUseThumbnailImage) {
        return (<ThumbnailImage_1.default previewSourceURL={source !== null && source !== void 0 ? source : ''} style={[styles.w100, styles.h100, thumbnailContainerStyles]} isAuthTokenRequired={isAuthTokenRequired !== null && isAuthTokenRequired !== void 0 ? isAuthTokenRequired : false} shouldDynamicallyResize={false} fallbackIcon={fallbackIcon} fallbackIconSize={fallbackIconSize} fallbackIconColor={fallbackIconColor} fallbackIconBackground={fallbackIconBackground} objectPosition={shouldUseInitialObjectPosition ? CONST_1.default.IMAGE_OBJECT_POSITION.INITIAL : CONST_1.default.IMAGE_OBJECT_POSITION.TOP}/>);
    }
    return (<ImageWithLoading_1.default source={{ uri: source }} style={[style !== null && style !== void 0 ? style : [styles.w100, styles.h100], styles.overflowHidden]} isAuthTokenRequired={!!isAuthTokenRequired} loadingIconSize={loadingIconSize} loadingIndicatorStyles={loadingIndicatorStyles} shouldShowOfflineIndicator={false}/>);
}
exports.default = ReceiptImage;
