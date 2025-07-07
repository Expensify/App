"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var FeatureList_1 = require("@components/FeatureList");
var Illustrations = require("@components/Icon/Illustrations");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var Text_1 = require("@components/Text");
var useDismissModalForUSD_1 = require("@hooks/useDismissModalForUSD");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var ReimbursementAccountUtils_1 = require("@libs/ReimbursementAccountUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var WorkspacePageWithSections_1 = require("@pages/workspace/WorkspacePageWithSections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var expensifyCardFeatures = [
    {
        icon: Illustrations.MoneyReceipts,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.cashBack',
    },
    {
        icon: Illustrations.CreditCardsNew,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.unlimited',
    },
    {
        icon: Illustrations.MoneyWings,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.spend',
    },
];
function WorkspaceExpensifyCardPageEmptyState(_a) {
    var _b, _c;
    var route = _a.route, policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: false })[0];
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var _d = (0, useDismissModalForUSD_1.default)(policy === null || policy === void 0 ? void 0 : policy.outputCurrency), isCurrencyModalOpen = _d[0], setIsCurrencyModalOpen = _d[1];
    var _e = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _e.isActingAsDelegate, showDelegateNoAccessModal = _e.showDelegateNoAccessModal;
    var _f = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _f.isAccountLocked, showLockedAccountModal = _f.showLockedAccountModal;
    var eligibleBankAccounts = (0, CardUtils_1.getEligibleBankAccountsForCard)(bankAccountList !== null && bankAccountList !== void 0 ? bankAccountList : {});
    var reimbursementAccountStatus = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.state) !== null && _c !== void 0 ? _c : '';
    var isSetupUnfinished = (0, EmptyObject_1.isEmptyObject)(bankAccountList) && reimbursementAccountStatus && reimbursementAccountStatus !== CONST_1.default.BANK_ACCOUNT.STATE.OPEN;
    var startFlow = (0, react_1.useCallback)(function () {
        if (!eligibleBankAccounts.length || isSetupUnfinished) {
            Navigation_1.default.navigate(ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policy === null || policy === void 0 ? void 0 : policy.id, ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD.getRoute(policy === null || policy === void 0 ? void 0 : policy.id)));
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(policy === null || policy === void 0 ? void 0 : policy.id));
        }
    }, [eligibleBankAccounts.length, isSetupUnfinished, policy === null || policy === void 0 ? void 0 : policy.id]);
    var confirmCurrencyChangeAndHideModal = (0, react_1.useCallback)(function () {
        if (!policy) {
            return;
        }
        (0, Policy_1.updateGeneralSettings)(policy.id, policy.name, CONST_1.default.CURRENCY.USD);
        setIsCurrencyModalOpen(false);
        startFlow();
    }, [policy, startFlow, setIsCurrencyModalOpen]);
    return (<WorkspacePageWithSections_1.default shouldUseScrollView icon={Illustrations.HandCard} headerText={translate('workspace.common.expensifyCard')} route={route} showLoadingAsFirstRender={false} shouldShowOfflineIndicatorInWideScreen addBottomSafeAreaPadding>
            <react_native_1.View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <FeatureList_1.default menuItems={expensifyCardFeatures} title={translate('workspace.moreFeatures.expensifyCard.feed.title')} subtitle={translate('workspace.moreFeatures.expensifyCard.feed.subTitle')} ctaText={translate(isSetupUnfinished ? 'workspace.expensifyCard.finishSetup' : 'workspace.expensifyCard.issueNewCard')} ctaAccessibilityLabel={translate('workspace.moreFeatures.expensifyCard.feed.ctaTitle')} onCtaPress={function () {
            if (isActingAsDelegate) {
                showDelegateNoAccessModal();
                return;
            }
            if (isAccountLocked) {
                showLockedAccountModal();
                return;
            }
            if (!((policy === null || policy === void 0 ? void 0 : policy.outputCurrency) === CONST_1.default.CURRENCY.USD)) {
                setIsCurrencyModalOpen(true);
                return;
            }
            startFlow();
        }} illustrationBackgroundColor={theme.fallbackIconColor} illustration={Illustrations.ExpensifyCardIllustration} illustrationStyle={styles.expensifyCardIllustrationContainer} titleStyles={styles.textHeadlineH1}/>
                <ConfirmModal_1.default title={translate('workspace.common.expensifyCard')} isVisible={isCurrencyModalOpen} onConfirm={confirmCurrencyChangeAndHideModal} onCancel={function () { return setIsCurrencyModalOpen(false); }} prompt={translate('workspace.bankAccount.updateCurrencyPrompt')} confirmText={translate('workspace.bankAccount.updateToUSD')} cancelText={translate('common.cancel')} danger/>
                <Text_1.default style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text_1.default>
            </react_native_1.View>
        </WorkspacePageWithSections_1.default>);
}
WorkspaceExpensifyCardPageEmptyState.displayName = 'WorkspaceExpensifyCardPageEmptyState';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceExpensifyCardPageEmptyState);
