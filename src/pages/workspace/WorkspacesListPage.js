"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FeatureList_1 = require("@components/FeatureList");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var LottieAnimations_1 = require("@components/LottieAnimations");
var NavigationTabBar_1 = require("@components/Navigation/NavigationTabBar");
var NAVIGATION_TABS_1 = require("@components/Navigation/NavigationTabBar/NAVIGATION_TABS");
var TopBar_1 = require("@components/Navigation/TopBar");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Pressable_1 = require("@components/Pressable");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var SearchBar_1 = require("@components/SearchBar");
var SupportalActionRestrictedModal_1 = require("@components/SupportalActionRestrictedModal");
var Text_1 = require("@components/Text");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useHandleBackButton_1 = require("@hooks/useHandleBackButton");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePayAndDowngrade_1 = require("@hooks/usePayAndDowngrade");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Session_1 = require("@libs/actions/Session");
var CardUtils_1 = require("@libs/CardUtils");
var interceptAnonymousUser_1 = require("@libs/interceptAnonymousUser");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var WorkspacesListRow_1 = require("./WorkspacesListRow");
var workspaceFeatures = [
    {
        icon: Illustrations.MoneyReceipts,
        translationKey: 'workspace.emptyWorkspace.features.trackAndCollect',
    },
    {
        icon: Illustrations.CreditCardsNew,
        translationKey: 'workspace.emptyWorkspace.features.companyCards',
    },
    {
        icon: Illustrations.MoneyWings,
        translationKey: 'workspace.emptyWorkspace.features.reimbursements',
    },
];
/**
 * Dismisses the errors on one item
 */
function dismissWorkspaceError(policyID, pendingAction) {
    if (pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        (0, Policy_1.clearDeleteWorkspaceError)(policyID);
        return;
    }
    if (pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        (0, Policy_1.removeWorkspace)(policyID);
        return;
    }
    (0, Policy_1.clearErrors)(policyID);
}
function WorkspacesListPage() {
    var _a, _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _c = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _c.shouldUseNarrowLayout, isMediumScreenWidth = _c.isMediumScreenWidth;
    var allConnectionSyncProgresses = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS, { canBeMissing: true })[0];
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: true })[0];
    var shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    var route = (0, native_1.useRoute)();
    var _d = (0, react_1.useState)(false), isDeleteModalOpen = _d[0], setIsDeleteModalOpen = _d[1];
    var _e = (0, react_1.useState)(), policyIDToDelete = _e[0], setPolicyIDToDelete = _e[1];
    var _f = (0, react_1.useState)(), policyNameToDelete = _f[0], setPolicyNameToDelete = _f[1];
    var _g = (0, usePayAndDowngrade_1.default)(setIsDeleteModalOpen), setIsDeletingPaidWorkspace = _g.setIsDeletingPaidWorkspace, isLoadingBill = _g.isLoadingBill;
    var _h = (0, react_1.useState)(null), loadingSpinnerIconIndex = _h[0], setLoadingSpinnerIconIndex = _h[1];
    var isLessThanMediumScreen = isMediumScreenWidth || shouldUseNarrowLayout;
    var shouldDisplayLHB = !shouldUseNarrowLayout;
    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    var workspaceAccountID = (_b = (_a = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyIDToDelete)]) === null || _a === void 0 ? void 0 : _a.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var cardFeeds = (0, useCardFeeds_1.default)(policyIDToDelete)[0];
    var cardsList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(workspaceAccountID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), {
        selector: CardUtils_1.filterInactiveCards,
        canBeMissing: true,
    })[0];
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policyToDelete = (0, PolicyUtils_1.getPolicy)(policyIDToDelete);
    var hasCardFeedOrExpensifyCard = !(0, EmptyObject_1.isEmptyObject)(cardFeeds) ||
        !(0, EmptyObject_1.isEmptyObject)(cardsList) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (((policyToDelete === null || policyToDelete === void 0 ? void 0 : policyToDelete.areExpensifyCardsEnabled) || (policyToDelete === null || policyToDelete === void 0 ? void 0 : policyToDelete.areCompanyCardsEnabled)) && (policyToDelete === null || policyToDelete === void 0 ? void 0 : policyToDelete.workspaceAccountID));
    var isSupportalAction = (0, Session_1.isSupportAuthToken)();
    var _j = (0, react_1.useState)(false), isSupportalActionRestrictedModalOpen = _j[0], setIsSupportalActionRestrictedModalOpen = _j[1];
    var hideSupportalModal = function () {
        setIsSupportalActionRestrictedModalOpen(false);
    };
    var confirmDeleteAndHideModal = function () {
        if (!policyIDToDelete || !policyNameToDelete) {
            return;
        }
        (0, Policy_1.deleteWorkspace)(policyIDToDelete, policyNameToDelete);
        setIsDeleteModalOpen(false);
    };
    var shouldCalculateBillNewDot = (0, SubscriptionUtils_1.shouldCalculateBillNewDot)();
    var resetLoadingSpinnerIconIndex = (0, react_1.useCallback)(function () {
        setLoadingSpinnerIconIndex(null);
    }, []);
    /**
     * Gets the menu item for each workspace
     */
    var getMenuItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item, index = _a.index;
        var isAdmin = (0, PolicyUtils_1.isPolicyAdmin)(item, session === null || session === void 0 ? void 0 : session.email);
        var isOwner = item.ownerAccountID === (session === null || session === void 0 ? void 0 : session.accountID);
        var isDefault = activePolicyID === item.policyID;
        var threeDotsMenuItems = [
            {
                icon: Expensicons.Building,
                text: translate('workspace.common.goToWorkspace'),
                onSelected: item.action,
            },
        ];
        if (isOwner) {
            threeDotsMenuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('workspace.common.delete'),
                shouldShowLoadingSpinnerIcon: loadingSpinnerIconIndex === index,
                onSelected: function () {
                    if (loadingSpinnerIconIndex !== null) {
                        return;
                    }
                    if (isSupportalAction) {
                        setIsSupportalActionRestrictedModalOpen(true);
                        return;
                    }
                    setPolicyIDToDelete(item.policyID);
                    setPolicyNameToDelete(item.title);
                    if (shouldCalculateBillNewDot) {
                        setIsDeletingPaidWorkspace(true);
                        (0, Policy_1.calculateBillNewDot)();
                        setLoadingSpinnerIconIndex(index);
                        return;
                    }
                    setIsDeleteModalOpen(true);
                },
                shouldKeepModalOpen: shouldCalculateBillNewDot,
                shouldCallAfterModalHide: !shouldCalculateBillNewDot,
            });
        }
        if (!(isAdmin || isOwner)) {
            threeDotsMenuItems.push({
                icon: Expensicons.Exit,
                text: translate('common.leave'),
                onSelected: (0, Session_1.callFunctionIfActionIsAllowed)(function () { return (0, Policy_1.leaveWorkspace)(item.policyID); }),
            });
        }
        if (!isDefault && !(item === null || item === void 0 ? void 0 : item.isJoinRequestPending)) {
            threeDotsMenuItems.push({
                icon: Expensicons.Star,
                text: translate('workspace.common.setAsDefault'),
                onSelected: function () { return (0, Policy_1.updateDefaultPolicy)(item.policyID, activePolicyID); },
            });
        }
        return (<OfflineWithFeedback_1.default key={"".concat(item.title, "_").concat(index)} pendingAction={item.pendingAction} errorRowStyles={styles.ph5} onClose={item.dismissError} errors={item.errors} style={styles.mb2}>
                    <Pressable_1.PressableWithoutFeedback role={CONST_1.default.ROLE.BUTTON} accessibilityLabel="row" style={[styles.mh5]} disabled={item.disabled} onPress={item.action}>
                        {function (_a) {
                var hovered = _a.hovered;
                return (<WorkspacesListRow_1.default title={item.title} policyID={item.policyID} menuItems={threeDotsMenuItems} workspaceIcon={item.icon} ownerAccountID={item.ownerAccountID} workspaceType={item.type} isJoinRequestPending={item === null || item === void 0 ? void 0 : item.isJoinRequestPending} rowStyles={hovered && styles.hoveredComponentBG} layoutWidth={isLessThanMediumScreen ? CONST_1.default.LAYOUT_WIDTH.NARROW : CONST_1.default.LAYOUT_WIDTH.WIDE} brickRoadIndicator={item.brickRoadIndicator} shouldDisableThreeDotsMenu={item.disabled} style={[item.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? styles.offlineFeedback.deleted : {}]} isDefault={isDefault} isLoadingBill={isLoadingBill} resetLoadingSpinnerIconIndex={resetLoadingSpinnerIconIndex}/>);
            }}
                    </Pressable_1.PressableWithoutFeedback>
                </OfflineWithFeedback_1.default>);
    }, [
        isLessThanMediumScreen,
        styles.mb2,
        styles.mh5,
        styles.ph5,
        styles.hoveredComponentBG,
        translate,
        styles.offlineFeedback.deleted,
        session === null || session === void 0 ? void 0 : session.accountID,
        session === null || session === void 0 ? void 0 : session.email,
        activePolicyID,
        isSupportalAction,
        setIsDeletingPaidWorkspace,
        isLoadingBill,
        shouldCalculateBillNewDot,
        loadingSpinnerIconIndex,
        resetLoadingSpinnerIconIndex,
    ]);
    var navigateToWorkspace = (0, react_1.useCallback)(function (policyID) {
        // On the wide layout, we always want to open the Profile page when opening workspace settings from the list
        if (shouldUseNarrowLayout) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INITIAL.getRoute(policyID));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW.getRoute(policyID));
    }, [shouldUseNarrowLayout]);
    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     */
    var workspaces = (0, react_1.useMemo)(function () {
        var reimbursementAccountBrickRoadIndicator = !(0, EmptyObject_1.isEmptyObject)(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
        if ((0, EmptyObject_1.isEmptyObject)(policies)) {
            return [];
        }
        return Object.values(policies)
            .filter(function (policy) { return (0, PolicyUtils_1.shouldShowPolicy)(policy, isOffline, session === null || session === void 0 ? void 0 : session.email); })
            .map(function (policy) {
            if ((policy === null || policy === void 0 ? void 0 : policy.isJoinRequestPending) && (policy === null || policy === void 0 ? void 0 : policy.policyDetailsForNonMembers)) {
                var policyInfo = Object.values(policy.policyDetailsForNonMembers).at(0);
                var id = Object.keys(policy.policyDetailsForNonMembers).at(0);
                return {
                    title: policyInfo.name,
                    icon: (policyInfo === null || policyInfo === void 0 ? void 0 : policyInfo.avatar) ? policyInfo.avatar : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy.name),
                    disabled: true,
                    ownerAccountID: policyInfo.ownerAccountID,
                    type: policyInfo.type,
                    iconType: (policyInfo === null || policyInfo === void 0 ? void 0 : policyInfo.avatar) ? CONST_1.default.ICON_TYPE_AVATAR : CONST_1.default.ICON_TYPE_ICON,
                    iconFill: theme.textLight,
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    policyID: id,
                    role: CONST_1.default.POLICY.ROLE.USER,
                    errors: undefined,
                    action: function () { return null; },
                    dismissError: function () { return null; },
                    isJoinRequestPending: true,
                };
            }
            return {
                title: policy.name,
                icon: policy.avatarURL ? policy.avatarURL : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy.name),
                action: function () { return navigateToWorkspace(policy.id); },
                brickRoadIndicator: !(0, PolicyUtils_1.isPolicyAdmin)(policy)
                    ? undefined
                    : (reimbursementAccountBrickRoadIndicator !== null && reimbursementAccountBrickRoadIndicator !== void 0 ? reimbursementAccountBrickRoadIndicator : (0, PolicyUtils_1.getPolicyBrickRoadIndicatorStatus)(policy, (0, connections_1.isConnectionInProgress)(allConnectionSyncProgresses === null || allConnectionSyncProgresses === void 0 ? void 0 : allConnectionSyncProgresses["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policy.id)], policy))),
                pendingAction: policy.pendingAction,
                errors: policy.errors,
                dismissError: function () { return dismissWorkspaceError(policy.id, policy.pendingAction); },
                disabled: policy.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                iconType: policy.avatarURL ? CONST_1.default.ICON_TYPE_AVATAR : CONST_1.default.ICON_TYPE_ICON,
                iconFill: theme.textLight,
                fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                policyID: policy.id,
                ownerAccountID: policy.ownerAccountID,
                role: policy.role,
                type: policy.type,
                employeeList: policy.employeeList,
            };
        });
    }, [reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors, policies, isOffline, session === null || session === void 0 ? void 0 : session.email, allConnectionSyncProgresses, theme.textLight, navigateToWorkspace]);
    var filterWorkspace = (0, react_1.useCallback)(function (workspace, inputValue) { return workspace.title.toLowerCase().includes(inputValue); }, []);
    var sortWorkspace = (0, react_1.useCallback)(function (workspaceItems) { return workspaceItems.sort(function (a, b) { return (0, LocaleCompare_1.default)(a.title, b.title); }); }, []);
    var _k = (0, useSearchResults_1.default)(workspaces, filterWorkspace, sortWorkspace), inputValue = _k[0], setInputValue = _k[1], filteredWorkspaces = _k[2];
    var listHeaderComponent = (<>
            {isLessThanMediumScreen && <react_native_1.View style={styles.mt3}/>}
            {workspaces.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.common.findWorkspace')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={filteredWorkspaces.length === 0 && inputValue.length > 0}/>)}
            {!isLessThanMediumScreen && filteredWorkspaces.length > 0 && (<react_native_1.View style={[styles.flexRow, styles.gap5, styles.pt2, styles.pb3, styles.pr5, styles.pl10, styles.appBG]}>
                    <react_native_1.View style={[styles.flexRow, styles.flex2]}>
                        <Text_1.default numberOfLines={1} style={[styles.flexGrow1, styles.textLabelSupporting]}>
                            {translate('workspace.common.workspaceName')}
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.flexRow, styles.flex1, styles.workspaceOwnerSectionTitle, styles.workspaceOwnerSectionMinWidth]}>
                        <Text_1.default numberOfLines={1} style={[styles.flexGrow1, styles.textLabelSupporting]}>
                            {translate('workspace.common.workspaceOwner')}
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.flexRow, styles.flex1, styles.workspaceTypeSectionTitle]}>
                        <Text_1.default numberOfLines={1} style={[styles.flexGrow1, styles.textLabelSupporting]}>
                            {translate('workspace.common.workspaceType')}
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.workspaceRightColumn, styles.mr2]}/>
                </react_native_1.View>)}
        </>);
    var getHeaderButton = function () { return (<Button_1.default accessibilityLabel={translate('workspace.new.newWorkspace')} text={translate('workspace.new.newWorkspace')} onPress={function () { return (0, interceptAnonymousUser_1.default)(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CONFIRMATION.getRoute(ROUTES_1.default.WORKSPACES_LIST.route)); }); }} icon={Expensicons.Plus} style={[shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]]}/>); };
    var onBackButtonPress = function () {
        var _a;
        Navigation_1.default.goBack((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo);
        return true;
    };
    (0, useHandleBackButton_1.default)(onBackButtonPress);
    if ((0, EmptyObject_1.isEmptyObject)(workspaces)) {
        return (<ScreenWrapper_1.default shouldEnablePickerAvoiding={false} shouldEnableMaxHeight testID={WorkspacesListPage.displayName} shouldShowOfflineIndicatorInWideScreen bottomContent={shouldUseNarrowLayout && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.WORKSPACES}/>} enableEdgeToEdgeBottomSafeAreaPadding={false}>
                <react_native_1.View style={styles.topBarWrapper}>
                    <TopBar_1.default breadcrumbLabel={translate('common.workspaces')}/>
                </react_native_1.View>
                {shouldShowLoadingIndicator ? (<react_native_1.View style={[styles.flex1]}>
                        <FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>
                    </react_native_1.View>) : (<ScrollView_1.default contentContainerStyle={styles.pt2} addBottomSafeAreaPadding>
                        <react_native_1.View style={[styles.flex1, isLessThanMediumScreen ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                            <FeatureList_1.default menuItems={workspaceFeatures} title={translate('workspace.emptyWorkspace.title')} subtitle={translate('workspace.emptyWorkspace.subtitle')} ctaText={translate('workspace.new.newWorkspace')} ctaAccessibilityLabel={translate('workspace.new.newWorkspace')} onCtaPress={function () { return (0, interceptAnonymousUser_1.default)(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CONFIRMATION.getRoute(ROUTES_1.default.WORKSPACES_LIST.route)); }); }} illustration={LottieAnimations_1.default.WorkspacePlanet} 
            // We use this style to vertically center the illustration, as the original illustration is not centered
            illustrationStyle={styles.emptyWorkspaceIllustrationStyle} titleStyles={styles.textHeadlineH1}/>
                        </react_native_1.View>
                    </ScrollView_1.default>)}
                {shouldDisplayLHB && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.WORKSPACES}/>}
            </ScreenWrapper_1.default>);
    }
    return (<ScreenWrapper_1.default shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen testID={WorkspacesListPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding={false} bottomContent={shouldUseNarrowLayout && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.WORKSPACES}/>}>
            <react_native_1.View style={styles.flex1}>
                <TopBar_1.default breadcrumbLabel={translate('common.workspaces')}>{!shouldUseNarrowLayout && <react_native_1.View style={[styles.pr2]}>{getHeaderButton()}</react_native_1.View>}</TopBar_1.default>
                {shouldUseNarrowLayout && <react_native_1.View style={[styles.ph5, styles.pt2]}>{getHeaderButton()}</react_native_1.View>}
                <react_native_1.FlatList data={filteredWorkspaces} renderItem={getMenuItem} ListHeaderComponent={listHeaderComponent} keyboardShouldPersistTaps="handled"/>
            </react_native_1.View>
            <ConfirmModal_1.default title={translate('workspace.common.delete')} isVisible={isDeleteModalOpen} onConfirm={confirmDeleteAndHideModal} onCancel={function () { return setIsDeleteModalOpen(false); }} prompt={hasCardFeedOrExpensifyCard ? translate('workspace.common.deleteWithCardsConfirmation') : translate('workspace.common.deleteConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
            <SupportalActionRestrictedModal_1.default isModalOpen={isSupportalActionRestrictedModalOpen} hideSupportalModal={hideSupportalModal}/>
            {shouldDisplayLHB && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.WORKSPACES}/>}
        </ScreenWrapper_1.default>);
}
WorkspacesListPage.displayName = 'WorkspacesListPage';
exports.default = WorkspacesListPage;
