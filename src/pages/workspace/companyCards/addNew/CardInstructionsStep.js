"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var RenderHTML_1 = require("@components/RenderHTML");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Card_1 = require("@libs/actions/Card");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var CardUtils_1 = require("@libs/CardUtils");
var Parser_1 = require("@libs/Parser");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function getCardInstructionHeader(feedProvider) {
    if (feedProvider === CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA) {
        return 'workspace.companyCards.addNewCard.enableFeed.visa';
    }
    if (feedProvider === CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD) {
        return 'workspace.companyCards.addNewCard.enableFeed.mastercard';
    }
    return 'workspace.companyCards.addNewCard.enableFeed.heading';
}
function CardInstructionsStep(_a) {
    var _b;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var data = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data;
    var feedProvider = (_b = data === null || data === void 0 ? void 0 : data.feedType) !== null && _b !== void 0 ? _b : CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA;
    var bank = data === null || data === void 0 ? void 0 : data.selectedBank;
    var isStripeFeedProvider = feedProvider === CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.STRIPE;
    var isAmexFeedProvider = feedProvider === CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX;
    var isOtherBankSelected = bank === CONST_1.default.COMPANY_CARDS.BANKS.OTHER;
    var translationKey = getCardInstructionHeader(feedProvider);
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var buttonTranslation = isStripeFeedProvider ? translate('common.submit') : translate('common.next');
    var submit = function () {
        if (isStripeFeedProvider && policyID) {
            (0, Card_1.updateSelectedFeed)(feedProvider, policyID);
            Navigation_1.default.goBack();
            return;
        }
        if (isOtherBankSelected) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                step: CONST_1.default.COMPANY_CARDS.STEP.CARD_NAME,
            });
            return;
        }
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
            step: CONST_1.default.COMPANY_CARDS.STEP.CARD_DETAILS,
        });
    };
    var handleBackButtonPress = function () {
        if (isAmexFeedProvider && !isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS)) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                step: CONST_1.default.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED,
            });
            return;
        }
        if (isStripeFeedProvider) {
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_BANK });
            return;
        }
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.CARD_TYPE });
    };
    return (<ScreenWrapper_1.default testID={CardInstructionsStep.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('workspace.companyCards.addCards')} onBackButtonPress={handleBackButtonPress}/>
            <ScrollView_1.default style={styles.pt0} contentContainerStyle={styles.flexGrow1} addBottomSafeAreaPadding>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>
                    {translate('workspace.companyCards.addNewCard.enableFeed.title', { provider: (0, CardUtils_1.getBankName)(feedProvider) })}
                </Text_1.default>
                <Text_1.default style={[styles.ph5, styles.mb3]}>{translate(translationKey)}</Text_1.default>
                <react_native_1.View style={[styles.ph5]}>
                    <RenderHTML_1.default html={Parser_1.default.replace(feedProvider ? translate("workspace.companyCards.addNewCard.enableFeed.".concat(feedProvider)) : '')}/>
                </react_native_1.View>
                <react_native_1.View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <Button_1.default isDisabled={isOffline} success large style={[styles.w100]} onPress={submit} text={buttonTranslation}/>
                </react_native_1.View>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
CardInstructionsStep.displayName = 'CardInstructionsStep';
exports.default = CardInstructionsStep;
