"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Popover_1 = require("@components/Popover");
var Pressable_1 = require("@components/Pressable");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var getClickedTargetLocation_1 = require("@libs/getClickedTargetLocation");
var variables_1 = require("@styles/variables");
var Card_1 = require("@userActions/Card");
var Policy_1 = require("@userActions/Policy/Policy");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function WorkspaceCardsListLabel(_a) {
    var _b;
    var type = _a.type, value = _a.value, style = _a.style;
    var route = (0, native_1.useRoute)();
    var policy = (0, usePolicy_1.default)(route.params.policyID);
    var styles = (0, useThemeStyles_1.default)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var _c = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _c.shouldUseNarrowLayout, isMediumScreenWidth = _c.isMediumScreenWidth;
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST)[0];
    var _d = (0, react_1.useState)(false), isVisible = _d[0], setVisible = _d[1];
    var _e = (0, react_1.useState)({ top: 0, left: 0 }), anchorPosition = _e[0], setAnchorPosition = _e[1];
    var anchorRef = (0, react_1.useRef)(null);
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var policyCurrency = (0, react_1.useMemo)(function () { var _a; return (_a = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _a !== void 0 ? _a : CONST_1.default.CURRENCY.USD; }, [policy]);
    var cardSettings = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(workspaceAccountID))[0];
    var cardManualBilling = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING).concat(workspaceAccountID))[0];
    var paymentBankAccountID = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountID;
    var isLessThanMediumScreen = isMediumScreenWidth || shouldUseNarrowLayout;
    var isConnectedWithPlaid = (0, react_1.useMemo)(function () {
        var _a, _b;
        var bankAccountData = (_a = bankAccountList === null || bankAccountList === void 0 ? void 0 : bankAccountList[paymentBankAccountID !== null && paymentBankAccountID !== void 0 ? paymentBankAccountID : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _a === void 0 ? void 0 : _a.accountData;
        // TODO: remove the extra check when plaidAccountID storing is aligned in https://github.com/Expensify/App/issues/47944
        // Right after adding a bank account plaidAccountID is stored inside the accountData and not in the additionalData
        return !!(bankAccountData === null || bankAccountData === void 0 ? void 0 : bankAccountData.plaidAccountID) || !!((_b = bankAccountData === null || bankAccountData === void 0 ? void 0 : bankAccountData.additionalData) === null || _b === void 0 ? void 0 : _b.plaidAccountID);
    }, [bankAccountList, paymentBankAccountID]);
    (0, react_1.useEffect)(function () {
        if (!anchorRef.current || !isVisible) {
            return;
        }
        var position = (0, getClickedTargetLocation_1.default)(anchorRef.current);
        var BOTTOM_MARGIN_OFFSET = 3;
        setAnchorPosition({
            top: position.top + position.height + BOTTOM_MARGIN_OFFSET,
            left: position.left,
        });
    }, [isVisible, windowWidth]);
    var requestLimitIncrease = function () {
        (0, Policy_1.requestExpensifyCardLimitIncrease)(cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountID);
        setVisible(false);
        (0, Report_1.navigateToConciergeChat)();
    };
    var isCurrentBalanceType = type === CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE;
    var isSettleBalanceButtonDisplayed = !!(cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.isMonthlySettlementAllowed) && !cardManualBilling && isCurrentBalanceType;
    var isSettleDateTextDisplayed = !!cardManualBilling && isCurrentBalanceType;
    var settlementDate = isSettleDateTextDisplayed ? (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 1), CONST_1.default.DATE.FNS_FORMAT_STRING) : '';
    var handleSettleBalanceButtonClick = function () {
        (0, Card_1.queueExpensifyCardForBilling)(CONST_1.default.COUNTRY.US, workspaceAccountID);
    };
    return (<react_native_1.View style={styles.flex1}>
            <react_native_1.View style={styles.flex1}>
                <react_native_1.View ref={anchorRef} style={[styles.flexRow, styles.alignItemsCenter, styles.mb1, style]}>
                    <Text_1.default style={[styles.mutedNormalTextLabel, styles.mr1]}>{translate("workspace.expensifyCard.".concat(type))}</Text_1.default>
                    <Pressable_1.PressableWithFeedback accessibilityLabel={translate("workspace.expensifyCard.".concat(type))} accessibilityRole={CONST_1.default.ROLE.BUTTON} onPress={function () { return setVisible(true); }}>
                        <Icon_1.default src={Expensicons_1.Info} width={variables_1.default.iconSizeExtraSmall} height={variables_1.default.iconSizeExtraSmall} fill={theme.icon}/>
                    </Pressable_1.PressableWithFeedback>
                </react_native_1.View>
                <react_native_1.View style={[styles.flexRow, styles.flexWrap]}>
                    <Text_1.default style={[styles.shortTermsHeadline, isSettleBalanceButtonDisplayed && [styles.mb2, styles.mr3]]}>{(0, CurrencyUtils_1.convertToDisplayString)(value, policyCurrency)}</Text_1.default>
                    {isSettleBalanceButtonDisplayed && (<react_native_1.View style={[styles.mr2, isLessThanMediumScreen && styles.mb3]}>
                            <Button_1.default onPress={handleSettleBalanceButtonClick} text={translate('workspace.expensifyCard.settleBalance')} innerStyles={[styles.buttonSmall]} textStyles={[styles.buttonSmallText]}/>
                        </react_native_1.View>)}
                </react_native_1.View>
            </react_native_1.View>
            {isSettleDateTextDisplayed && <Text_1.default style={[styles.mutedNormalTextLabel, styles.mt1]}>{translate('workspace.expensifyCard.balanceWillBeSettledOn', { settlementDate: settlementDate })}</Text_1.default>}
            <Popover_1.default onClose={function () { return setVisible(false); }} isVisible={isVisible} outerStyle={!shouldUseNarrowLayout ? styles.pr5 : undefined} innerContainerStyle={!shouldUseNarrowLayout ? { maxWidth: variables_1.default.modalContentMaxWidth } : undefined} anchorRef={anchorRef} anchorPosition={anchorPosition}>
                <react_native_1.View style={styles.p4}>
                    <Text_1.default numberOfLines={1} style={[styles.optionDisplayName, styles.textStrong, styles.mb2]}>
                        {translate("workspace.expensifyCard.".concat(type))}
                    </Text_1.default>
                    <Text_1.default style={[styles.textLabelSupporting, styles.lh16]}>{translate("workspace.expensifyCard.".concat(type, "Description"))}</Text_1.default>

                    {!isConnectedWithPlaid && type === CONST_1.default.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT && (<react_native_1.View style={[styles.flexRow, styles.mt3]}>
                            <Button_1.default onPress={requestLimitIncrease} text={translate('workspace.expensifyCard.requestLimitIncrease')} style={shouldUseNarrowLayout && styles.flex1}/>
                        </react_native_1.View>)}
                </react_native_1.View>
            </Popover_1.default>
        </react_native_1.View>);
}
exports.default = WorkspaceCardsListLabel;
