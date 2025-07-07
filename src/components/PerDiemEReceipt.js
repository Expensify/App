"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EReceiptThumbnail_1 = require("./EReceiptThumbnail");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var Text_1 = require("./Text");
function computeDefaultPerDiemExpenseRates(customUnit, currency) {
    var _a;
    var subRates = (_a = customUnit.subRates) !== null && _a !== void 0 ? _a : [];
    var subRateComments = subRates.map(function (subRate) {
        var _a, _b, _c;
        var rate = (_a = subRate.rate) !== null && _a !== void 0 ? _a : 0;
        var rateComment = (_b = subRate.name) !== null && _b !== void 0 ? _b : '';
        var quantity = (_c = subRate.quantity) !== null && _c !== void 0 ? _c : 0;
        return "".concat(quantity, "x ").concat(rateComment, " @ ").concat((0, CurrencyUtils_1.convertAmountToDisplayString)(rate, currency));
    });
    return subRateComments.join(', ');
}
function getPerDiemDestination(merchant) {
    var merchantParts = merchant.split(', ');
    if (merchantParts.length < 3) {
        return '';
    }
    return merchantParts.slice(0, merchantParts.length - 3).join(', ');
}
function getPerDiemDates(merchant) {
    var merchantParts = merchant.split(', ');
    if (merchantParts.length < 3) {
        return merchant;
    }
    return merchantParts.slice(-3).join(', ');
}
function PerDiemEReceipt(_a) {
    var _b, _c, _d, _e;
    var transactionID = _a.transactionID;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID))[0];
    // Get receipt colorway, or default to Yellow.
    var _f = (_b = StyleUtils.getEReceiptColorStyles(StyleUtils.getEReceiptColorCode(transaction))) !== null && _b !== void 0 ? _b : {}, primaryColor = _f.backgroundColor, secondaryColor = _f.color;
    var _g = (_c = (0, ReportUtils_1.getTransactionDetails)(transaction, CONST_1.default.DATE.MONTH_DAY_YEAR_FORMAT)) !== null && _c !== void 0 ? _c : {}, transactionAmount = _g.amount, transactionCurrency = _g.currency, transactionMerchant = _g.merchant;
    var ratesDescription = computeDefaultPerDiemExpenseRates((_e = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit) !== null && _e !== void 0 ? _e : {}, transactionCurrency !== null && transactionCurrency !== void 0 ? transactionCurrency : '');
    var datesDescription = getPerDiemDates(transactionMerchant !== null && transactionMerchant !== void 0 ? transactionMerchant : '');
    var destination = getPerDiemDestination(transactionMerchant !== null && transactionMerchant !== void 0 ? transactionMerchant : '');
    var formattedAmount = (0, CurrencyUtils_1.convertToDisplayStringWithoutCurrency)(transactionAmount !== null && transactionAmount !== void 0 ? transactionAmount : 0, transactionCurrency);
    var currency = (0, CurrencyUtils_1.getCurrencySymbol)(transactionCurrency !== null && transactionCurrency !== void 0 ? transactionCurrency : '');
    var secondaryTextColorStyle = secondaryColor ? StyleUtils.getColorStyle(secondaryColor) : undefined;
    return (<react_native_1.View style={[styles.eReceiptContainer, primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : undefined]}>
            <react_native_1.View style={styles.fullScreen}>
                <EReceiptThumbnail_1.default transactionID={transactionID} centerIconV={false}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.alignItemsCenter, styles.ph8, styles.pb14, styles.pt8]}>
                <react_native_1.View style={[StyleUtils.getWidthAndHeightStyle(variables_1.default.eReceiptIconWidth, variables_1.default.eReceiptIconHeight)]}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.flexColumn, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph9, styles.flex1]}>
                <react_native_1.View style={[styles.alignItemsCenter, styles.alignSelfCenter, styles.flexColumn, styles.gap2, styles.mb8]}>
                    <react_native_1.View style={[styles.flexRow, styles.justifyContentCenter, StyleUtils.getWidthStyle(variables_1.default.eReceiptTextContainerWidth)]}>
                        <react_native_1.View style={[styles.flexColumn, styles.pt1]}>
                            <Text_1.default style={[styles.eReceiptCurrency, secondaryTextColorStyle]}>{currency}</Text_1.default>
                        </react_native_1.View>
                        <Text_1.default adjustsFontSizeToFit style={[styles.eReceiptAmountLarge, secondaryTextColorStyle]}>
                            {formattedAmount}
                        </Text_1.default>
                    </react_native_1.View>
                    <Text_1.default style={[styles.eReceiptMerchant, styles.breakWord, styles.textAlignCenter]}>{"".concat(destination, " ").concat(translate('common.perDiem').toLowerCase())}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles.alignSelfStretch, styles.flexColumn, styles.mb8, styles.gap4]}>
                    <react_native_1.View style={[styles.flexColumn, styles.gap1]}>
                        <Text_1.default style={[styles.eReceiptWaypointTitle, secondaryTextColorStyle]}>{translate('iou.dates')}</Text_1.default>
                        <Text_1.default style={[styles.eReceiptWaypointAddress]}>{datesDescription}</Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.flexColumn, styles.gap1]}>
                        <Text_1.default style={[styles.eReceiptWaypointTitle, secondaryTextColorStyle]}>{translate('iou.rates')}</Text_1.default>
                        <Text_1.default style={[styles.eReceiptWaypointAddress]}>{ratesDescription}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
                <react_native_1.View style={[styles.justifyContentBetween, styles.alignItemsCenter, styles.alignSelfStretch, styles.flexRow, styles.mb8]}>
                    <Icon_1.default width={variables_1.default.eReceiptWordmarkWidth} height={variables_1.default.eReceiptWordmarkHeight} fill={secondaryColor} src={Expensicons.ExpensifyWordmark}/>
                    <Text_1.default style={styles.eReceiptGuaranteed}>{translate('eReceipt.guaranteed')}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
PerDiemEReceipt.displayName = 'PerDiemEReceipt';
exports.default = PerDiemEReceipt;
