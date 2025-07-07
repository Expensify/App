"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCardsList_1 = require("@hooks/useCardsList");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceCompanyCardsSettingsPage(_a) {
    var _b, _c;
    var policyID = _a.route.params.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, usePolicy_1.default)(policyID);
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var _d = (0, react_1.useState)(false), deleteCompanyCardConfirmModalVisible = _d[0], setDeleteCompanyCardConfirmModalVisible = _d[1];
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var lastSelectedFeed = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID), { canBeMissing: true })[0];
    var selectedFeed = (0, react_1.useMemo)(function () { return (0, CardUtils_1.getSelectedFeed)(lastSelectedFeed, cardFeeds); }, [cardFeeds, lastSelectedFeed]);
    var cardsList = (0, useCardsList_1.default)(policyID, selectedFeed)[0];
    var feedName = (0, CardUtils_1.getCustomOrFormattedFeedName)(selectedFeed, (_c = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _c === void 0 ? void 0 : _c.companyCardNicknames);
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var selectedFeedData = selectedFeed ? companyFeeds[selectedFeed] : undefined;
    var liabilityType = selectedFeedData === null || selectedFeedData === void 0 ? void 0 : selectedFeedData.liabilityType;
    var isPersonal = liabilityType === CONST_1.default.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW;
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, selectedFeedData);
    var navigateToChangeFeedName = function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_SETTINGS_FEED_NAME.getRoute(policyID));
    };
    var deleteCompanyCardFeed = function () {
        setDeleteCompanyCardConfirmModalVisible(false);
        Navigation_1.default.goBack();
        if (selectedFeed) {
            var _a = cardsList !== null && cardsList !== void 0 ? cardsList : {}, cardList = _a.cardList, cards = __rest(_a, ["cardList"]);
            var cardIDs_1 = Object.keys(cards);
            var feedToOpen_1 = Object.keys(companyFeeds)
                .filter(function (feed) { var _a; return feed !== selectedFeed && ((_a = companyFeeds[feed]) === null || _a === void 0 ? void 0 : _a.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; })
                .at(0);
            react_native_1.InteractionManager.runAfterInteractions(function () {
                (0, CompanyCards_1.deleteWorkspaceCompanyCardFeed)(policyID, domainOrWorkspaceAccountID, selectedFeed, cardIDs_1, feedToOpen_1);
            });
        }
    };
    var onToggleLiability = function (isOn) {
        if (!selectedFeed) {
            return;
        }
        (0, CompanyCards_1.setWorkspaceCompanyCardTransactionLiability)(domainOrWorkspaceAccountID, policyID, selectedFeed, isOn ? CONST_1.default.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW : CONST_1.default.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT);
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceCompanyCardsSettingsPage.displayName} style={styles.defaultModalContainer} enableEdgeToEdgeBottomSafeAreaPadding>
                <ScrollView_1.default contentContainerStyle={styles.flexGrow1} addBottomSafeAreaPadding>
                    <HeaderWithBackButton_1.default title={translate('common.settings')}/>
                    <react_native_1.View style={styles.flex1}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={feedName} description={translate('workspace.moreFeatures.companyCards.cardFeedName')} style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} onPress={navigateToChangeFeedName}/>
                        <react_native_1.View style={[styles.mv3, styles.mh5]}>
                            <ToggleSettingsOptionRow_1.default title={translate('workspace.moreFeatures.companyCards.personal')} switchAccessibilityLabel={translate('workspace.moreFeatures.companyCards.personal')} onToggle={onToggleLiability} isActive={isPersonal}/>
                            <Text_1.default style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.moreFeatures.companyCards.setTransactionLiabilityDescription')}</Text_1.default>
                        </react_native_1.View>
                        <MenuItem_1.default icon={Expensicons.Trashcan} title={translate('workspace.moreFeatures.companyCards.removeCardFeed')} onPress={function () { return setDeleteCompanyCardConfirmModalVisible(true); }}/>
                    </react_native_1.View>
                    <ConfirmModal_1.default isVisible={deleteCompanyCardConfirmModalVisible} onConfirm={deleteCompanyCardFeed} onCancel={function () { return setDeleteCompanyCardConfirmModalVisible(false); }} title={feedName && translate('workspace.moreFeatures.companyCards.removeCardFeedTitle', { feedName: feedName })} prompt={translate('workspace.moreFeatures.companyCards.removeCardFeedDescription')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCompanyCardsSettingsPage.displayName = 'WorkspaceCompanyCardsSettingsPage';
exports.default = WorkspaceCompanyCardsSettingsPage;
