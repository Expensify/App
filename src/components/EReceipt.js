"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useEReceipt_1 = require("@hooks/useEReceipt");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var ImageSVG_1 = require("./ImageSVG");
var Text_1 = require("./Text");
var receiptMCCSize = variables_1.default.eReceiptMCCHeightWidthMedium;
var backgroundImageMinWidth = variables_1.default.eReceiptBackgroundImageMinWidth;
function EReceipt(_a) {
    var _b, _c;
    var transactionID = _a.transactionID, transactionItem = _a.transactionItem, _d = _a.isThumbnail, isThumbnail = _d === void 0 ? false : _d;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var cardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var _e = (0, useEReceipt_1.default)(transactionItem !== null && transactionItem !== void 0 ? transactionItem : transaction), primaryColor = _e.primaryColor, secondaryColor = _e.secondaryColor, titleColor = _e.titleColor, MCCIcon = _e.MCCIcon, tripIcon = _e.tripIcon, backgroundImage = _e.backgroundImage;
    var _f = (_b = (0, ReportUtils_1.getTransactionDetails)(transactionItem !== null && transactionItem !== void 0 ? transactionItem : transaction, CONST_1.default.DATE.MONTH_DAY_YEAR_FORMAT)) !== null && _b !== void 0 ? _b : {}, transactionAmount = _f.amount, transactionCurrency = _f.currency, transactionMerchant = _f.merchant, transactionDate = _f.created, transactionCardID = _f.cardID, transactionCardName = _f.cardName;
    var formattedAmount = (0, CurrencyUtils_1.convertToDisplayString)(transactionAmount, transactionCurrency);
    var currency = (0, CurrencyUtils_1.getCurrencySymbol)(transactionCurrency !== null && transactionCurrency !== void 0 ? transactionCurrency : '');
    var amount = currency ? formattedAmount.replace(currency, '') : formattedAmount;
    var cardDescription = (_c = (0, CardUtils_1.getCompanyCardDescription)(transactionCardName, transactionCardID, cardList)) !== null && _c !== void 0 ? _c : (transactionCardID ? (0, CardUtils_1.getCardDescription)(transactionCardID) : '');
    var secondaryBgcolorStyle = secondaryColor ? StyleUtils.getBackgroundColorStyle(secondaryColor) : undefined;
    var primaryTextColorStyle = primaryColor ? StyleUtils.getColorStyle(primaryColor) : undefined;
    var titleTextColorStyle = titleColor ? StyleUtils.getColorStyle(titleColor) : undefined;
    return (<react_native_1.View style={[
            styles.eReceiptContainer,
            primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : undefined,
            isThumbnail && StyleUtils.getMinimumWidth(variables_1.default.eReceiptBGHWidth),
        ]}>
            <react_native_1.View style={[styles.flex1, primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : {}, styles.overflowHidden, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <react_native_1.View style={[styles.eReceiptBackgroundThumbnail, StyleUtils.getMinimumWidth(backgroundImageMinWidth)]}>
                    <ImageSVG_1.default src={backgroundImage}/>
                </react_native_1.View>
                <react_native_1.View style={styles.eReceiptContentContainer}>
                    <react_native_1.View>
                        <ImageSVG_1.default src={Expensicons.ReceiptBody} fill={theme.textColorfulBackground} contentFit="fill"/>
                        <react_native_1.View style={styles.eReceiptContentWrapper}>
                            <react_native_1.View style={[StyleUtils.getBackgroundColorStyle(theme.textColorfulBackground), styles.alignItemsCenter, styles.justifyContentCenter, styles.h100]}>
                                <react_native_1.View style={[
            StyleUtils.getWidthAndHeightStyle(variables_1.default.eReceiptEmptyIconWidth, variables_1.default.eReceiptEmptyIconWidth),
            styles.alignItemsCenter,
            styles.justifyContentCenter,
            styles.borderRadiusComponentNormal,
            secondaryBgcolorStyle,
            styles.mb3,
        ]}>
                                    <react_native_1.View>
                                        {MCCIcon ? (<Icon_1.default src={MCCIcon} height={receiptMCCSize} width={receiptMCCSize} fill={primaryColor}/>) : null}
                                        {!MCCIcon && tripIcon ? (<Icon_1.default src={tripIcon} height={receiptMCCSize} width={receiptMCCSize} fill={primaryColor}/>) : null}
                                    </react_native_1.View>
                                </react_native_1.View>
                                <Text_1.default style={[styles.eReceiptGuaranteed, primaryTextColorStyle]}>{translate('eReceipt.guaranteed')}</Text_1.default>
                                <react_native_1.View style={[styles.alignItemsCenter]}>
                                    <react_native_1.View style={[StyleUtils.getWidthAndHeightStyle(variables_1.default.eReceiptIconWidth, variables_1.default.h40)]}/>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.flexColumn, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph9, styles.flex1]}>
                                    <react_native_1.View style={[styles.alignItemsCenter, styles.alignSelfCenter, styles.flexColumn, styles.gap2]}>
                                        <react_native_1.View style={[styles.flexRow, styles.justifyContentCenter, StyleUtils.getWidthStyle(variables_1.default.eReceiptTextContainerWidth)]}>
                                            <react_native_1.View style={[styles.flexColumn, styles.pt1]}>
                                                <Text_1.default style={[styles.eReceiptCurrency, primaryTextColorStyle]}>{currency}</Text_1.default>
                                            </react_native_1.View>
                                            <Text_1.default adjustsFontSizeToFit style={[styles.eReceiptAmountLarge, primaryTextColorStyle, styles.pr4]}>
                                                {amount}
                                            </Text_1.default>
                                        </react_native_1.View>
                                        <Text_1.default style={[styles.eReceiptMerchant, styles.breakWord, styles.textAlignCenter, primaryTextColorStyle]}>{transactionMerchant}</Text_1.default>
                                    </react_native_1.View>
                                    <react_native_1.View style={[styles.alignSelfStretch, styles.flexColumn, styles.gap4, styles.ph3]}>
                                        <react_native_1.View style={[styles.flexColumn, styles.gap1]}>
                                            <Text_1.default style={[styles.eReceiptWaypointTitle, titleTextColorStyle]}>{translate('eReceipt.transactionDate')}</Text_1.default>
                                            <Text_1.default style={[styles.eReceiptWaypointAddress, primaryTextColorStyle]}>{transactionDate}</Text_1.default>
                                        </react_native_1.View>
                                        <react_native_1.View style={[styles.flexColumn, styles.gap1]}>
                                            <Text_1.default style={[styles.eReceiptWaypointTitle, titleTextColorStyle]}>{translate('common.card')}</Text_1.default>
                                            <Text_1.default style={[styles.eReceiptWaypointAddress, primaryTextColorStyle]}>{cardDescription}</Text_1.default>
                                        </react_native_1.View>
                                    </react_native_1.View>
                                    <react_native_1.View>
                                        <react_native_1.View style={[styles.alignItemsCenter, styles.alignSelfStretch, styles.flexRow, styles.w100, styles.mb8]}>
                                            <Icon_1.default width={variables_1.default.eReceiptWordmarkWidth} height={variables_1.default.eReceiptWordmarkHeight} fill={secondaryColor} src={Expensicons.ExpensifyWordmark}/>
                                        </react_native_1.View>
                                    </react_native_1.View>
                                </react_native_1.View>
                            </react_native_1.View>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
EReceipt.displayName = 'EReceipt';
exports.default = EReceipt;
