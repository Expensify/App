"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var BankIcons_1 = require("@components/Icon/BankIcons");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWorkspaceAccountID_1 = require("@hooks/useWorkspaceAccountID");
var BankAccountUtils_1 = require("@libs/BankAccountUtils");
var CardUtils_1 = require("@libs/CardUtils");
var ReimbursementAccountUtils_1 = require("@libs/ReimbursementAccountUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var variables_1 = require("@styles/variables");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function WorkspaceExpensifyCardBankAccounts(_a) {
    var _b;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var bankAccountsList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: false })[0];
    var policyID = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.policyID;
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var cardBankAccountMetadata = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.EXPENSIFY_CARD_BANK_ACCOUNT_METADATA).concat(workspaceAccountID), { canBeMissing: true })[0];
    var cardOnWaitlist = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST).concat(policyID), { canBeMissing: true })[0];
    var getVerificationState = function () {
        if (cardOnWaitlist) {
            return CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST;
        }
        if (cardBankAccountMetadata === null || cardBankAccountMetadata === void 0 ? void 0 : cardBankAccountMetadata.isSuccess) {
            return CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED;
        }
        if (cardBankAccountMetadata === null || cardBankAccountMetadata === void 0 ? void 0 : cardBankAccountMetadata.isLoading) {
            return CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING;
        }
        return '';
    };
    var handleAddBankAccount = function () {
        Navigation_1.default.navigate(ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
    };
    var handleSelectBankAccount = function (value) {
        (0, Card_1.configureExpensifyCardsForPolicy)(policyID, value);
    };
    var renderBankOptions = function () {
        if (!bankAccountsList || (0, EmptyObject_1.isEmptyObject)(bankAccountsList)) {
            return null;
        }
        var eligibleBankAccounts = (0, CardUtils_1.getEligibleBankAccountsForCard)(bankAccountsList);
        return eligibleBankAccounts.map(function (bankAccount) {
            var _a, _b, _c, _d, _e, _f;
            var bankName = ((_b = (_a = bankAccount.accountData) === null || _a === void 0 ? void 0 : _a.addressName) !== null && _b !== void 0 ? _b : '');
            var bankAccountNumber = (_d = (_c = bankAccount.accountData) === null || _c === void 0 ? void 0 : _c.accountNumber) !== null && _d !== void 0 ? _d : '';
            var bankAccountID = (_f = (_e = bankAccount.accountData) === null || _e === void 0 ? void 0 : _e.bankAccountID) !== null && _f !== void 0 ? _f : bankAccount === null || bankAccount === void 0 ? void 0 : bankAccount.methodID;
            var _g = (0, BankIcons_1.default)({ bankName: bankName, styles: styles }), icon = _g.icon, iconSize = _g.iconSize, iconStyles = _g.iconStyles;
            return (<MenuItem_1.default title={bankName} description={"".concat(translate('workspace.expensifyCard.accountEndingIn'), " ").concat((0, BankAccountUtils_1.getLastFourDigits)(bankAccountNumber))} onPress={function () { return handleSelectBankAccount(bankAccountID); }} icon={icon} iconHeight={iconSize} iconWidth={iconSize} iconStyles={iconStyles} shouldShowRightIcon displayInDefaultIconColor/>);
        });
    };
    var verificationState = getVerificationState();
    var isInVerificationState = !!verificationState;
    var bottomSafeAreaPaddingStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({ addBottomSafeAreaPadding: true });
    var renderVerificationStateView = function () {
        switch (verificationState) {
            case CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING:
                return (<BlockingView_1.default title={translate('workspace.expensifyCard.verifyingBankAccount')} subtitle={translate('workspace.expensifyCard.verifyingBankAccountDescription')} animation={LottieAnimations_1.default.ReviewingBankInfo} animationStyles={styles.loadingVBAAnimation} animationWebStyle={styles.loadingVBAAnimationWeb} subtitleStyle={styles.textLabelSupporting} containerStyle={styles.pb20} addBottomSafeAreaPadding/>);
            case CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST:
                return (<>
                        <BlockingView_1.default title={translate('workspace.expensifyCard.oneMoreStep')} subtitle={translate('workspace.expensifyCard.oneMoreStepDescription')} icon={Illustrations.Puzzle} subtitleStyle={styles.textLabelSupporting} iconHeight={variables_1.default.cardPreviewHeight} iconWidth={variables_1.default.cardPreviewHeight}/>
                        <Button_1.default success large text={translate('workspace.expensifyCard.goToConcierge')} style={[styles.m5, bottomSafeAreaPaddingStyle]} pressOnEnter onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.CONCIERGE); }}/>
                    </>);
            case CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED:
                return (<>
                        <BlockingView_1.default title={translate('workspace.expensifyCard.bankAccountVerified')} subtitle={translate('workspace.expensifyCard.bankAccountVerifiedDescription')} animation={LottieAnimations_1.default.Fireworks} animationStyles={styles.loadingVBAAnimation} animationWebStyle={styles.loadingVBAAnimationWeb} subtitleStyle={styles.textLabelSupporting}/>
                        <Button_1.default success large text={translate('workspace.expensifyCard.gotIt')} style={[styles.m5, bottomSafeAreaPaddingStyle]} pressOnEnter onPress={function () {
                        Navigation_1.default.dismissModal();
                        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID));
                    }}/>
                    </>);
            default:
                return null;
        }
    };
    var getHeaderButtonText = function () {
        switch (verificationState) {
            case CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST:
            case CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING:
                return translate('workspace.expensifyCard.verifyingHeader');
            case CONST_1.default.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED:
                return translate('workspace.expensifyCard.bankAccountVerifiedHeader');
            default:
                return translate('workspace.expensifyCard.chooseBankAccount');
        }
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceExpensifyCardBankAccounts.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldShowOfflineIndicator={false}>
                <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                    <HeaderWithBackButton_1.default shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.goBack(); }} title={getHeaderButtonText()}/>
                    {isInVerificationState && renderVerificationStateView()}
                    {!isInVerificationState && (<FullPageOfflineBlockingView_1.default addBottomSafeAreaPadding>
                            <react_native_1.View style={styles.flex1}>
                                <Text_1.default style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text_1.default>
                                {renderBankOptions()}
                                <MenuItem_1.default icon={Expensicons.Plus} title={translate('workspace.expensifyCard.addNewBankAccount')} onPress={handleAddBankAccount}/>
                            </react_native_1.View>
                        </FullPageOfflineBlockingView_1.default>)}
                </DelegateNoAccessWrapper_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceExpensifyCardBankAccounts.displayName = 'WorkspaceExpensifyCardBankAccounts';
exports.default = WorkspaceExpensifyCardBankAccounts;
