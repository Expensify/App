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
/* eslint-disable react/jsx-props-no-spreading */
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmedRoute_1 = require("@components/ConfirmedRoute");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithoutFocus_1 = require("@components/Pressable/PressableWithoutFocus");
var ReceiptImage_1 = require("@components/ReceiptImage");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */
function ReportActionItemImage(_a) {
    var _b, _c, _d;
    var thumbnail = _a.thumbnail, isThumbnail = _a.isThumbnail, image = _a.image, _e = _a.enablePreviewModal, enablePreviewModal = _e === void 0 ? false : _e, transaction = _a.transaction, _f = _a.isLocalFile, isLocalFile = _f === void 0 ? false : _f, _g = _a.isEmptyReceipt, isEmptyReceipt = _g === void 0 ? false : _g, fileExtension = _a.fileExtension, filename = _a.filename, _h = _a.isSingleImage, isSingleImage = _h === void 0 ? true : _h, _j = _a.readonly, readonly = _j === void 0 ? false : _j, shouldMapHaveBorderRadius = _a.shouldMapHaveBorderRadius, _k = _a.isFromReviewDuplicates, isFromReviewDuplicates = _k === void 0 ? false : _k, onPress = _a.onPress, shouldUseFullHeight = _a.shouldUseFullHeight;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isDistanceRequest = !!transaction && (0, TransactionUtils_1.isDistanceRequest)(transaction);
    var hasPendingWaypoints = transaction && (0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction);
    var hasErrors = !(0, EmptyObject_1.isEmptyObject)(transaction === null || transaction === void 0 ? void 0 : transaction.errors) || !(0, EmptyObject_1.isEmptyObject)((_b = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _b === void 0 ? void 0 : _b.route) || !(0, EmptyObject_1.isEmptyObject)((_c = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _c === void 0 ? void 0 : _c.waypoints);
    var showMapAsImage = isDistanceRequest && (hasErrors || hasPendingWaypoints);
    if (showMapAsImage) {
        return (<react_native_1.View style={[styles.w100, styles.h100]}>
                <ConfirmedRoute_1.default transaction={transaction} isSmallerIcon={!isSingleImage} shouldHaveBorderRadius={shouldMapHaveBorderRadius} interactive={false} requireRouteToDisplayMap/>
            </react_native_1.View>);
    }
    var attachmentModalSource = (0, tryResolveUrlFromApiRoot_1.default)(image !== null && image !== void 0 ? image : '');
    var thumbnailSource = (0, tryResolveUrlFromApiRoot_1.default)(thumbnail !== null && thumbnail !== void 0 ? thumbnail : '');
    var isEReceipt = transaction && !(0, TransactionUtils_1.hasReceiptSource)(transaction) && (0, TransactionUtils_1.hasEReceipt)(transaction);
    var propsObj;
    if (isEReceipt) {
        propsObj = { isEReceipt: true, transactionID: transaction.transactionID, iconSize: isSingleImage ? 'medium' : 'small' };
    }
    else if (thumbnail && !isLocalFile) {
        propsObj = {
            shouldUseThumbnailImage: true,
            source: thumbnailSource,
            fallbackIcon: Expensicons.Receipt,
            fallbackIconSize: isSingleImage ? variables_1.default.iconSizeSuperLarge : variables_1.default.iconSizeExtraLarge,
            isAuthTokenRequired: true,
            shouldUseInitialObjectPosition: isDistanceRequest,
        };
    }
    else if (isLocalFile && filename && expensify_common_1.Str.isPDF(filename) && typeof attachmentModalSource === 'string') {
        propsObj = { isPDFThumbnail: true, source: attachmentModalSource };
    }
    else {
        propsObj = __assign(__assign({ isThumbnail: isThumbnail }, (isThumbnail && { iconSize: (isSingleImage ? 'medium' : 'small'), fileExtension: fileExtension })), { shouldUseThumbnailImage: true, isAuthTokenRequired: false, source: (_d = thumbnail !== null && thumbnail !== void 0 ? thumbnail : image) !== null && _d !== void 0 ? _d : '', shouldUseInitialObjectPosition: isDistanceRequest, isEmptyReceipt: isEmptyReceipt, onPress: onPress });
    }
    propsObj.isPerDiemRequest = (0, TransactionUtils_1.isPerDiemRequest)(transaction);
    if (enablePreviewModal) {
        return (<ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
                {function (_a) {
                var report = _a.report, transactionThreadReport = _a.transactionThreadReport;
                return (<PressableWithoutFocus_1.default style={[styles.w100, styles.h100, styles.noOutline]} onPress={function () {
                        var _a;
                        return Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_RECEIPT.getRoute((_a = transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.reportID) !== null && _a !== void 0 ? _a : report === null || report === void 0 ? void 0 : report.reportID, transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, readonly, isFromReviewDuplicates));
                    }} accessibilityLabel={translate('accessibilityHints.viewAttachment')} accessibilityRole={CONST_1.default.ROLE.BUTTON}>
                        <ReceiptImage_1.default {...propsObj}/>
                    </PressableWithoutFocus_1.default>);
            }}
            </ShowContextMenuContext_1.ShowContextMenuContext.Consumer>);
    }
    return (<ReceiptImage_1.default {...propsObj} shouldUseFullHeight={shouldUseFullHeight} thumbnailContainerStyles={styles.thumbnailImageContainerHover}/>);
}
ReportActionItemImage.displayName = 'ReportActionItemImage';
exports.default = ReportActionItemImage;
