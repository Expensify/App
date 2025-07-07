"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var TextLink_1 = require("@components/TextLink");
var useDefaultFundID_1 = require("@hooks/useDefaultFundID");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccountUtils_1 = require("@libs/BankAccountUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceCardSettingsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.policyID;
    var defaultFundID = (0, useDefaultFundID_1.default)(policyID);
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: false })[0];
    var cardSettings = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(defaultFundID), { canBeMissing: false })[0];
    var paymentBankAccountID = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountID;
    var paymentBankAccountNumber = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountNumber;
    var isMonthlySettlementAllowed = (_c = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.isMonthlySettlementAllowed) !== null && _c !== void 0 ? _c : false;
    var settlementFrequency = (cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.monthlySettlementDate) ? CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    var isSettlementFrequencyBlocked = !isMonthlySettlementAllowed && settlementFrequency === CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    var bankAccountNumber = (_h = (_g = (_f = (_e = bankAccountList === null || bankAccountList === void 0 ? void 0 : bankAccountList[(_d = paymentBankAccountID === null || paymentBankAccountID === void 0 ? void 0 : paymentBankAccountID.toString()) !== null && _d !== void 0 ? _d : '']) === null || _e === void 0 ? void 0 : _e.accountData) === null || _f === void 0 ? void 0 : _f.accountNumber) !== null && _g !== void 0 ? _g : paymentBankAccountNumber) !== null && _h !== void 0 ? _h : '';
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceCardSettingsPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.common.settings')}/>
                <ScrollView_1.default contentContainerStyle={styles.flexGrow1} addBottomSafeAreaPadding>
                    <react_native_1.View>
                        <OfflineWithFeedback_1.default errorRowStyles={styles.mh5}>
                            <MenuItemWithTopDescription_1.default description={translate('workspace.expensifyCard.settlementAccount')} title={bankAccountNumber ? "".concat(CONST_1.default.MASKED_PAN_PREFIX).concat((0, BankAccountUtils_1.getLastFourDigits)(bankAccountNumber)) : ''} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.getRoute(policyID, Navigation_1.default.getActiveRoute())); }}/>
                        </OfflineWithFeedback_1.default>
                        <OfflineWithFeedback_1.default errorRowStyles={styles.mh5}>
                            <MenuItemWithTopDescription_1.default description={translate('workspace.expensifyCard.settlementFrequency')} title={translate("workspace.expensifyCard.frequency.".concat(settlementFrequency))} shouldShowRightIcon={settlementFrequency !== CONST_1.default.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY} interactive={!isSettlementFrequencyBlocked} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_SETTINGS_FREQUENCY.getRoute(policyID)); }} hintText={isSettlementFrequencyBlocked ? (<>
                                            {translate('workspace.expensifyCard.settlementFrequencyInfo')}{' '}
                                            <TextLink_1.default href={CONST_1.default.EXPENSIFY_CARD.MANAGE_EXPENSIFY_CARDS_ARTICLE_LINK} style={styles.label}>
                                                {translate('common.learnMore')}
                                            </TextLink_1.default>
                                        </>) : undefined}/>
                        </OfflineWithFeedback_1.default>
                    </react_native_1.View>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCardSettingsPage.displayName = 'WorkspaceCardSettingsPage';
exports.default = WorkspaceCardSettingsPage;
