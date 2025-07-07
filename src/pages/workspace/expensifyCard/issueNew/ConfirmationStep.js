"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useDefaultFundID_1 = require("@hooks/useDefaultFundID");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Card_1 = require("@libs/actions/Card");
var User_1 = require("@libs/actions/User");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ConfirmationStep(_a) {
    var _b, _c;
    var policyID = _a.policyID, backTo = _a.backTo;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var issueNewCard = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD).concat(policyID), { canBeMissing: true })[0];
    var validateError = (0, ErrorUtils_1.getLatestErrorMessageField)(issueNewCard);
    var _d = (0, react_1.useState)(false), isValidateCodeActionModalVisible = _d[0], setIsValidateCodeActionModalVisible = _d[1];
    var data = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data;
    var isSuccessful = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.isSuccessful;
    var defaultFundID = (0, useDefaultFundID_1.default)(policyID);
    var submitButton = (0, react_1.useRef)(null);
    (0, useBeforeRemove_1.default)(function () { return setIsValidateCodeActionModalVisible(false); });
    (0, react_1.useEffect)(function () {
        var _a;
        (_a = submitButton.current) === null || _a === void 0 ? void 0 : _a.focus();
        (0, User_1.resetValidateActionCodeSent)();
    }, []);
    (0, react_1.useEffect)(function () {
        if (!isSuccessful) {
            return;
        }
        if (backTo) {
            Navigation_1.default.goBack(backTo);
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
        }
        (0, Card_1.clearIssueNewCardFlow)(policyID);
    }, [backTo, policyID, isSuccessful]);
    var submit = function (validateCode) {
        (0, Card_1.issueExpensifyCard)(defaultFundID, policyID, CONST_1.default.COUNTRY.US, validateCode, data);
    };
    var errorMessage = (0, ErrorUtils_1.getLatestErrorMessage)(issueNewCard);
    var editStep = function (step) {
        (0, Card_1.setIssueNewCardStepAndData)({ step: step, isEditing: true, policyID: policyID });
    };
    var handleBackButtonPress = function () {
        (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.CARD_NAME, policyID: policyID });
    };
    var translationForLimitType = (0, CardUtils_1.getTranslationKeyForLimitType)(data === null || data === void 0 ? void 0 : data.limitType);
    return (<InteractiveStepWrapper_1.default wrapperID={ConfirmationStep.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('workspace.card.issueCard')} handleBackButtonPress={handleBackButtonPress} startStepIndex={5} stepNames={CONST_1.default.EXPENSIFY_CARD.STEP_NAMES} enableEdgeToEdgeBottomSafeAreaPadding>
            <ScrollView_1.default style={styles.pt0} contentContainerStyle={styles.flexGrow1} addBottomSafeAreaPadding>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.card.issueNewCard.letsDoubleCheck')}</Text_1.default>
                <Text_1.default style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.willBeReady')}</Text_1.default>
                <MenuItemWithTopDescription_1.default description={translate('workspace.card.issueNewCard.cardholder')} title={(0, PersonalDetailsUtils_1.getUserNameByEmail)((_b = data === null || data === void 0 ? void 0 : data.assigneeEmail) !== null && _b !== void 0 ? _b : '', 'displayName')} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.EXPENSIFY_CARD.STEP.ASSIGNEE); }}/>
                <MenuItemWithTopDescription_1.default description={translate('workspace.card.issueNewCard.cardType')} title={(data === null || data === void 0 ? void 0 : data.cardType) ? translate("workspace.card.issueNewCard.".concat(data === null || data === void 0 ? void 0 : data.cardType, "Card")) : ''} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.EXPENSIFY_CARD.STEP.CARD_TYPE); }}/>
                <MenuItemWithTopDescription_1.default description={translate('workspace.card.issueNewCard.limit')} title={(0, CurrencyUtils_1.convertToShortDisplayString)(data === null || data === void 0 ? void 0 : data.limit)} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.EXPENSIFY_CARD.STEP.LIMIT); }}/>
                <MenuItemWithTopDescription_1.default description={translate('workspace.card.issueNewCard.limitType')} title={translationForLimitType ? translate(translationForLimitType) : ''} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.EXPENSIFY_CARD.STEP.LIMIT_TYPE); }}/>
                <MenuItemWithTopDescription_1.default description={translate('workspace.card.issueNewCard.name')} title={data === null || data === void 0 ? void 0 : data.cardTitle} shouldShowRightIcon onPress={function () { return editStep(CONST_1.default.EXPENSIFY_CARD.STEP.CARD_NAME); }}/>
                <react_native_1.View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <FormAlertWithSubmitButton_1.default buttonRef={submitButton} message={errorMessage} isAlertVisible={!!errorMessage} isDisabled={isOffline} isLoading={issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.isLoading} onSubmit={function () { return setIsValidateCodeActionModalVisible(true); }} buttonText={translate('workspace.card.issueCard')}/>
                </react_native_1.View>
            </ScrollView_1.default>
            {!!issueNewCard && (<ValidateCodeActionModal_1.default handleSubmitForm={submit} isLoading={issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.isLoading} sendValidateCode={User_1.requestValidateCodeAction} validateCodeActionErrorField={(data === null || data === void 0 ? void 0 : data.cardType) === CONST_1.default.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL ? 'createExpensifyCard' : 'createAdminIssuedVirtualCard'} validateError={validateError} clearError={function () { return (0, Card_1.clearIssueNewCardError)(policyID); }} onClose={function () { return setIsValidateCodeActionModalVisible(false); }} isVisible={isValidateCodeActionModalVisible} title={translate('cardPage.validateCardTitle')} descriptionPrimary={translate('cardPage.enterMagicCode', { contactMethod: (_c = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _c !== void 0 ? _c : '' })}/>)}
        </InteractiveStepWrapper_1.default>);
}
ConfirmationStep.displayName = 'ConfirmationStep';
exports.default = ConfirmationStep;
