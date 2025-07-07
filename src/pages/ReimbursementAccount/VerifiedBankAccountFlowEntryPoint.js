"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MenuItem_1 = require("@components/MenuItem");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var getPlaidDesktopMessage_1 = require("@libs/getPlaidDesktopMessage");
var ReimbursementAccountUtils_1 = require("@libs/ReimbursementAccountUtils");
var WorkspaceResetBankAccountModal_1 = require("@pages/workspace/WorkspaceResetBankAccountModal");
var BankAccounts_1 = require("@userActions/BankAccounts");
var Link_1 = require("@userActions/Link");
var ReimbursementAccount_1 = require("@userActions/ReimbursementAccount");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var bankInfoStepKeys = ReimbursementAccountForm_1.default.BANK_INFO_STEP;
function VerifiedBankAccountFlowEntryPoint(_a) {
    var _b, _c, _d, _e, _f;
    var _g = _a.policyName, policyName = _g === void 0 ? '' : _g, _h = _a.policyID, policyID = _h === void 0 ? '' : _h, onBackButtonPress = _a.onBackButtonPress, reimbursementAccount = _a.reimbursementAccount, onContinuePress = _a.onContinuePress, shouldShowContinueSetupButton = _a.shouldShowContinueSetupButton, isNonUSDWorkspace = _a.isNonUSDWorkspace, isValidateCodeActionModalVisible = _a.isValidateCodeActionModalVisible, toggleValidateCodeActionModal = _a.toggleValidateCodeActionModal, setNonUSDBankAccountStep = _a.setNonUSDBankAccountStep, setUSDBankAccountStep = _a.setUSDBankAccountStep;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var isPlaidDisabled = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_PLAID_DISABLED, { canBeMissing: true })[0];
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: true })[0];
    var errors = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) !== null && _b !== void 0 ? _b : {};
    var pendingAction = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.pendingAction) !== null && _c !== void 0 ? _c : null;
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var optionPressed = (0, react_1.useRef)('');
    var isAccountValidated = (_d = account === null || account === void 0 ? void 0 : account.validated) !== null && _d !== void 0 ? _d : false;
    var contactMethod = (_e = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _e !== void 0 ? _e : '';
    var loginData = (0, react_1.useMemo)(function () { return loginList === null || loginList === void 0 ? void 0 : loginList[contactMethod]; }, [loginList, contactMethod]);
    var validateLoginError = (0, ErrorUtils_1.getEarliestErrorField)(loginData, 'validateLogin');
    var plaidDesktopMessage = (0, getPlaidDesktopMessage_1.default)();
    var bankAccountRoute = "".concat(ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES_1.default.WORKSPACE_INITIAL.getRoute(policyID)));
    var personalBankAccounts = bankAccountList ? Object.keys(bankAccountList).filter(function (key) { return bankAccountList[key].accountType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT; }) : [];
    var removeExistingBankAccountDetails = function () {
        var _a;
        var bankAccountData = (_a = {},
            _a[bankInfoStepKeys.ROUTING_NUMBER] = '',
            _a[bankInfoStepKeys.ACCOUNT_NUMBER] = '',
            _a[bankInfoStepKeys.PLAID_MASK] = '',
            _a[bankInfoStepKeys.IS_SAVINGS] = undefined,
            _a[bankInfoStepKeys.BANK_NAME] = '',
            _a[bankInfoStepKeys.PLAID_ACCOUNT_ID] = '',
            _a[bankInfoStepKeys.PLAID_ACCESS_TOKEN] = '',
            _a);
        (0, BankAccounts_1.updateReimbursementAccountDraft)(bankAccountData);
    };
    /**
     * optionPressed ref indicates what user selected before modal to validate account was displayed
     * In this hook we check if account was validated and then proceed with the option user selected
     * note: non USD accounts only have manual option available
     */
    (0, react_1.useEffect)(function () {
        if (!isAccountValidated) {
            return;
        }
        if (optionPressed.current === CONST_1.default.BANK_ACCOUNT.SUBSTEP.MANUAL) {
            if (isNonUSDWorkspace) {
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);
                return;
            }
            (0, ReimbursementAccount_1.setBankAccountSubStep)(CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
            setUSDBankAccountStep(CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
        }
        else if (optionPressed.current === CONST_1.default.BANK_ACCOUNT.SUBSTEP.PLAID) {
            (0, ReimbursementAccount_1.setBankAccountSubStep)(CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID);
            setUSDBankAccountStep(CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
            (0, BankAccounts_1.openPlaidView)();
        }
    }, [isAccountValidated, isNonUSDWorkspace, setNonUSDBankAccountStep, setUSDBankAccountStep]);
    var handleConnectPlaid = function () {
        if (isPlaidDisabled) {
            return;
        }
        if (!isAccountValidated) {
            optionPressed.current = CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID;
            toggleValidateCodeActionModal === null || toggleValidateCodeActionModal === void 0 ? void 0 : toggleValidateCodeActionModal(true);
            return;
        }
        removeExistingBankAccountDetails();
        (0, ReimbursementAccount_1.setBankAccountSubStep)(CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID);
        setUSDBankAccountStep(CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
        (0, BankAccounts_1.openPlaidView)();
    };
    var handleConnectManually = function () {
        if (!isAccountValidated) {
            optionPressed.current = CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
            toggleValidateCodeActionModal === null || toggleValidateCodeActionModal === void 0 ? void 0 : toggleValidateCodeActionModal(true);
            return;
        }
        if (isNonUSDWorkspace) {
            setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);
            return;
        }
        removeExistingBankAccountDetails();
        (0, ReimbursementAccount_1.setBankAccountSubStep)(CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
        setUSDBankAccountStep(CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={VerifiedBankAccountFlowEntryPoint.displayName}>
            <HeaderWithBackButton_1.default title={translate('workspace.common.connectBankAccount')} subtitle={policyName} onBackButtonPress={onBackButtonPress}/>

            <ScrollView_1.default style={styles.flex1}>
                <Section_1.default title={translate(shouldShowContinueSetupButton === true ? 'workspace.bankAccount.almostDone' : 'workspace.bankAccount.streamlinePayments')} titleStyles={styles.textHeadline} subtitle={translate(shouldShowContinueSetupButton === true ? 'workspace.bankAccount.youAreAlmostDone' : 'bankAccount.toGetStarted')} subtitleStyles={styles.textSupporting} subtitleMuted illustration={LottieAnimations_1.default.FastMoney} illustrationBackgroundColor={theme.fallbackIconColor} isCentralPane>
                    {!!plaidDesktopMessage && !isNonUSDWorkspace && (<react_native_1.View style={[styles.mt3, styles.flexRow, styles.justifyContentBetween]}>
                            <TextLink_1.default onPress={function () { return (0, Link_1.openExternalLinkWithToken)(bankAccountRoute); }}>{translate(plaidDesktopMessage)}</TextLink_1.default>
                        </react_native_1.View>)}
                    {!!personalBankAccounts.length && (<react_native_1.View style={[styles.flexRow, styles.mt4, styles.alignItemsCenter, styles.pb1, styles.pt1]}>
                            <Icon_1.default src={Expensicons_1.Lightbulb} fill={theme.icon} additionalStyles={styles.mr2} medium/>
                            <Text_1.default style={[styles.textLabelSupportingNormal, styles.flex1]} suppressHighlighting>
                                {translate('workspace.bankAccount.connectBankAccountNote')}
                            </Text_1.default>
                        </react_native_1.View>)}
                    <react_native_1.View style={styles.mt4}>
                        {shouldShowContinueSetupButton === true ? (<OfflineWithFeedback_1.default errors={(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.maxAttemptsReached) ? (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('connectBankAccountStep.maxAttemptsReached') : (0, ErrorUtils_1.getLatestError)(errors)} errorRowStyles={styles.mt2} shouldShowErrorMessages canDismissError={!(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.maxAttemptsReached)} onClose={ReimbursementAccount_1.resetReimbursementAccount}>
                                <MenuItem_1.default title={translate('workspace.bankAccount.continueWithSetup')} icon={Expensicons_1.Connect} onPress={onContinuePress} shouldShowRightIcon outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8} disabled={!!pendingAction || !(0, EmptyObject_1.isEmptyObject)(errors)}/>
                                <MenuItem_1.default title={translate('workspace.bankAccount.startOver')} icon={Expensicons_1.RotateLeft} onPress={ReimbursementAccount_1.requestResetBankAccount} shouldShowRightIcon outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8} disabled={!!pendingAction || !(0, EmptyObject_1.isEmptyObject)(errors)}/>
                            </OfflineWithFeedback_1.default>) : (<>
                                {!isNonUSDWorkspace && !shouldShowContinueSetupButton && (<MenuItem_1.default title={translate('bankAccount.connectOnlineWithPlaid')} icon={Expensicons_1.Bank} disabled={!!isPlaidDisabled} onPress={handleConnectPlaid} shouldShowRightIcon outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}/>)}
                                <MenuItem_1.default title={translate('bankAccount.connectManually')} icon={Expensicons_1.Connect} onPress={handleConnectManually} shouldShowRightIcon outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}/>
                            </>)}
                    </react_native_1.View>
                </Section_1.default>
                <react_native_1.View style={[styles.mv0, styles.mh5, styles.flexRow, styles.justifyContentBetween]}>
                    <TextLink_1.default href={CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>{translate('common.privacy')}</TextLink_1.default>
                    <PressableWithoutFeedback_1.default onPress={function () { return (0, Link_1.openExternalLink)(CONST_1.default.ENCRYPTION_AND_SECURITY_HELP_URL); }} style={[styles.flexRow, styles.alignItemsCenter]} accessibilityLabel={translate('bankAccount.yourDataIsSecure')}>
                        <TextLink_1.default href={CONST_1.default.ENCRYPTION_AND_SECURITY_HELP_URL}>{translate('bankAccount.yourDataIsSecure')}</TextLink_1.default>
                        <react_native_1.View style={styles.ml1}>
                            <Icon_1.default src={Expensicons_1.Lock} fill={theme.link}/>
                        </react_native_1.View>
                    </PressableWithoutFeedback_1.default>
                </react_native_1.View>
            </ScrollView_1.default>

            {!!(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.shouldShowResetModal) && (<WorkspaceResetBankAccountModal_1.default reimbursementAccount={reimbursementAccount} isNonUSDWorkspace={isNonUSDWorkspace} setUSDBankAccountStep={setUSDBankAccountStep} setNonUSDBankAccountStep={setNonUSDBankAccountStep}/>)}

            <ValidateCodeActionModal_1.default title={translate('contacts.validateAccount')} descriptionPrimary={translate('contacts.featureRequiresValidate')} descriptionSecondary={translate('contacts.enterMagicCode', { contactMethod: contactMethod })} isVisible={!!isValidateCodeActionModalVisible} validateCodeActionErrorField="validateLogin" validatePendingAction={(_f = loginData === null || loginData === void 0 ? void 0 : loginData.pendingFields) === null || _f === void 0 ? void 0 : _f.validateCodeSent} sendValidateCode={function () { return (0, User_1.requestValidateCodeAction)(); }} handleSubmitForm={function (validateCode) { return (0, User_1.validateSecondaryLogin)(loginList, contactMethod, validateCode); }} validateError={!(0, EmptyObject_1.isEmptyObject)(validateLoginError) ? validateLoginError : (0, ErrorUtils_1.getLatestErrorField)(loginData, 'validateCodeSent')} clearError={function () { return (0, User_1.clearContactMethodErrors)(contactMethod, !(0, EmptyObject_1.isEmptyObject)(validateLoginError) ? 'validateLogin' : 'validateCodeSent'); }} onClose={function () { return toggleValidateCodeActionModal === null || toggleValidateCodeActionModal === void 0 ? void 0 : toggleValidateCodeActionModal(false); }}/>
        </ScreenWrapper_1.default>);
}
VerifiedBankAccountFlowEntryPoint.displayName = 'VerifiedBankAccountFlowEntryPoint';
exports.default = VerifiedBankAccountFlowEntryPoint;
