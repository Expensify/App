"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var Policy_1 = require("@src/libs/actions/Policy/Policy");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var DowngradeConfirmation_1 = require("./DowngradeConfirmation");
var DowngradeIntro_1 = require("./DowngradeIntro");
function WorkspaceDowngradePage(_a) {
    var _b;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _c = (0, react_1.useState)(false), isDowngradeWarningModalOpen = _c[0], setIsDowngradeWarningModalOpen = _c[1];
    var canPerformDowngrade = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.canModifyPlan)(policyID); }, [policyID]);
    var isDowngraded = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isCollectPolicy)(policy); }, [policy]);
    var onDowngradeToTeam = function () {
        if (!canPerformDowngrade || !policy) {
            return;
        }
        if (Object.keys(companyFeeds).length > 1) {
            setIsDowngradeWarningModalOpen(true);
            return;
        }
        (0, Policy_1.downgradeToTeam)(policy.id);
    };
    var onClose = function () {
        setIsDowngradeWarningModalOpen(false);
        Navigation_1.default.dismissModal();
    };
    var onMoveToCompanyCardFeeds = function () {
        if (!policyID) {
            return;
        }
        setIsDowngradeWarningModalOpen(false);
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID));
    };
    if (!canPerformDowngrade) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator testID="workspaceDowngradePage" offlineIndicatorStyle={styles.mtAuto}>
            <HeaderWithBackButton_1.default title={translate('common.downgradeWorkspace')} onBackButtonPress={function () {
            if (isDowngraded) {
                Navigation_1.default.dismissModal();
            }
            else {
                Navigation_1.default.goBack();
            }
        }}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                {isDowngraded && !!policyID && (<DowngradeConfirmation_1.default onConfirmDowngrade={function () {
                Navigation_1.default.dismissModal();
            }} policyID={policyID}/>)}
                {!isDowngraded && (<DowngradeIntro_1.default policyID={policyID} onDowngrade={onDowngradeToTeam} buttonDisabled={isOffline} loading={policy === null || policy === void 0 ? void 0 : policy.isPendingDowngrade} backTo={route.params.backTo}/>)}
            </ScrollView_1.default>
            <ConfirmModal_1.default title={translate('workspace.moreFeatures.companyCards.downgradeTitle')} isVisible={isDowngradeWarningModalOpen} onConfirm={onClose} shouldShowCancelButton={false} onCancel={onClose} prompt={<Text_1.default>
                        {translate('workspace.moreFeatures.companyCards.downgradeSubTitleFirstPart')}{' '}
                        <TextLink_1.default style={styles.link} onPress={onMoveToCompanyCardFeeds}>
                            {translate('workspace.moreFeatures.companyCards.downgradeSubTitleMiddlePart')}
                        </TextLink_1.default>{' '}
                        {translate('workspace.moreFeatures.companyCards.downgradeSubTitleLastPart')}
                    </Text_1.default>} confirmText={translate('common.buttonConfirm')}/>
        </ScreenWrapper_1.default>);
}
exports.default = WorkspaceDowngradePage;
