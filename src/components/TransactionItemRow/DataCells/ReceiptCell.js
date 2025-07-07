"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons_1 = require("@components/Icon/Expensicons");
var ReceiptImage_1 = require("@components/ReceiptImage");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var ReceiptUtils_1 = require("@libs/ReceiptUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var variables_1 = require("@styles/variables");
function ReceiptCell(_a) {
    var _b, _c, _d, _e, _f;
    var transactionItem = _a.transactionItem, isSelected = _a.isSelected;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var backgroundStyles = isSelected ? StyleUtils.getBackgroundColorStyle(theme.buttonHoveredBG) : StyleUtils.getBackgroundColorStyle(theme.border);
    var source = (_c = (_b = transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.receipt) === null || _b === void 0 ? void 0 : _b.source) !== null && _c !== void 0 ? _c : '';
    if (source && typeof source === 'string') {
        var filename = (0, FileUtils_1.getFileName)(source);
        var receiptURIs = (0, ReceiptUtils_1.getThumbnailAndImageURIs)(transactionItem, null, filename);
        var isReceiptPDF = expensify_common_1.Str.isPDF(filename);
        source = (0, tryResolveUrlFromApiRoot_1.default)(isReceiptPDF && !receiptURIs.isLocalFile ? ((_d = receiptURIs.thumbnail) !== null && _d !== void 0 ? _d : '') : ((_e = receiptURIs.image) !== null && _e !== void 0 ? _e : ''));
    }
    return (<react_native_1.View style={[
            StyleUtils.getWidthAndHeightStyle(variables_1.default.h36, variables_1.default.w40),
            StyleUtils.getBorderRadiusStyle(variables_1.default.componentBorderRadiusSmall),
            styles.overflowHidden,
            backgroundStyles,
        ]}>
            <ReceiptImage_1.default source={source} isEReceipt={transactionItem.hasEReceipt && !(0, TransactionUtils_1.hasReceiptSource)(transactionItem)} transactionID={transactionItem.transactionID} shouldUseThumbnailImage={!((_f = transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.receipt) === null || _f === void 0 ? void 0 : _f.source)} isAuthTokenRequired fallbackIcon={Expensicons_1.Receipt} fallbackIconSize={20} fallbackIconColor={theme.icon} fallbackIconBackground={isSelected ? theme.buttonHoveredBG : undefined} iconSize="x-small" loadingIconSize="small" loadingIndicatorStyles={styles.bgTransparent} transactionItem={transactionItem}/>
        </react_native_1.View>);
}
ReceiptCell.displayName = 'ReceiptCell';
exports.default = ReceiptCell;
