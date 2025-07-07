"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var FeatureList_1 = require("@components/FeatureList");
var Illustrations_1 = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var colors_1 = require("@styles/theme/colors");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceCompanyCardExpensifyCardPromotionBanner_1 = require("./WorkspaceCompanyCardExpensifyCardPromotionBanner");
var companyCardFeatures = [
    {
        icon: Illustrations_1.CreditCardsNew,
        translationKey: 'workspace.moreFeatures.companyCards.feed.features.support',
    },
    {
        icon: Illustrations_1.HandCard,
        translationKey: 'workspace.moreFeatures.companyCards.feed.features.assignCards',
    },
    {
        icon: Illustrations_1.MagnifyingGlassMoney,
        translationKey: 'workspace.moreFeatures.companyCards.feed.features.automaticImport',
    },
];
function WorkspaceCompanyCardPageEmptyState(_a) {
    var _b, _c;
    var policy = _a.policy, shouldShowGBDisclaimer = _a.shouldShowGBDisclaimer;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _d = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _d.isActingAsDelegate, showDelegateNoAccessModal = _d.showDelegateNoAccessModal;
    var allWorkspaceCards = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, { canBeMissing: true })[0];
    var shouldShowExpensifyCardPromotionBanner = !(0, CardUtils_1.hasIssuedExpensifyCard)((_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID, allWorkspaceCards);
    var workspaceAccountID = (_c = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID;
    var handleCtaPress = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        (0, CompanyCards_1.clearAddNewCardFlow)();
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policy.id));
    }, [policy, isActingAsDelegate, showDelegateNoAccessModal]);
    return (<react_native_1.View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {shouldShowExpensifyCardPromotionBanner && <WorkspaceCompanyCardExpensifyCardPromotionBanner_1.default policy={policy}/>}
            <FeatureList_1.default menuItems={companyCardFeatures} title={translate('workspace.moreFeatures.companyCards.feed.title')} subtitle={translate('workspace.moreFeatures.companyCards.subtitle')} ctaText={translate('workspace.companyCards.addCards')} ctaAccessibilityLabel={translate('workspace.companyCards.addCards')} onCtaPress={handleCtaPress} illustrationBackgroundColor={colors_1.default.blue700} illustration={Illustrations_1.CompanyCardsEmptyState} illustrationStyle={styles.emptyStateCardIllustration} illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart]} titleStyles={styles.textHeadlineH1} isButtonDisabled={workspaceAccountID === CONST_1.default.DEFAULT_NUMBER_ID}/>
            {!!shouldShowGBDisclaimer && <Text_1.default style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.companyCards.ukRegulation')}</Text_1.default>}
        </react_native_1.View>);
}
WorkspaceCompanyCardPageEmptyState.displayName = 'WorkspaceCompanyCardPageEmptyState';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceCompanyCardPageEmptyState);
