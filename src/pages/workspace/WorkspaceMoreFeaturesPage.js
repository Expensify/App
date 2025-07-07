"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Category_1 = require("@userActions/Policy/Category");
var DistanceRate_1 = require("@userActions/Policy/DistanceRate");
var PerDiem_1 = require("@userActions/Policy/PerDiem");
var Policy_1 = require("@userActions/Policy/Policy");
var Tag_1 = require("@userActions/Policy/Tag");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("./withPolicyAndFullscreenLoading");
var ToggleSettingsOptionRow_1 = require("./workflows/ToggleSettingsOptionRow");
function WorkspaceMoreFeaturesPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    var policy = _a.policy, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    var hasAccountingConnection = !(0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections);
    var isAccountingEnabled = !!(policy === null || policy === void 0 ? void 0 : policy.areConnectionsEnabled) || !(0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections);
    var isSyncTaxEnabled = !!((_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.config) === null || _d === void 0 ? void 0 : _d.syncTax) ||
        !!((_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.xero) === null || _f === void 0 ? void 0 : _f.config) === null || _g === void 0 ? void 0 : _g.importTaxRates) ||
        !!((_m = (_l = (_k = (_j = (_h = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _h === void 0 ? void 0 : _h.netsuite) === null || _j === void 0 ? void 0 : _j.options) === null || _k === void 0 ? void 0 : _k.config) === null || _l === void 0 ? void 0 : _l.syncOptions) === null || _m === void 0 ? void 0 : _m.syncTax);
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var workspaceAccountID = (_o = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _o !== void 0 ? _o : CONST_1.default.DEFAULT_NUMBER_ID;
    var cardsList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(workspaceAccountID.toString(), "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), {
        selector: CardUtils_1.filterInactiveCards,
        canBeMissing: true,
    })[0];
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var _11 = (0, react_1.useState)(false), isOrganizeWarningModalOpen = _11[0], setIsOrganizeWarningModalOpen = _11[1];
    var _12 = (0, react_1.useState)(false), isIntegrateWarningModalOpen = _12[0], setIsIntegrateWarningModalOpen = _12[1];
    var _13 = (0, react_1.useState)(false), isDisableExpensifyCardWarningModalOpen = _13[0], setIsDisableExpensifyCardWarningModalOpen = _13[1];
    var _14 = (0, react_1.useState)(false), isDisableCompanyCardsWarningModalOpen = _14[0], setIsDisableCompanyCardsWarningModalOpen = _14[1];
    var _15 = (0, react_1.useState)(false), isDisableWorkflowWarningModalOpen = _15[0], setIsDisableWorkflowWarningModalOpen = _15[1];
    var perDiemCustomUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var cardList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST), { canBeMissing: true })[0];
    var workspaceCards = (0, CardUtils_1.getAllCardsForWorkspace)(workspaceAccountID, cardList, cardFeeds);
    var isSmartLimitEnabled = (0, CardUtils_1.isSmartLimitEnabled)(workspaceCards);
    var allTransactionViolations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, { canBeMissing: true })[0];
    var policyTagLists = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policy === null || policy === void 0 ? void 0 : policy.id), { canBeMissing: true })[0];
    var onDisabledOrganizeSwitchPress = (0, react_1.useCallback)(function () {
        if (!hasAccountingConnection) {
            return;
        }
        setIsOrganizeWarningModalOpen(true);
    }, [hasAccountingConnection]);
    var onDisabledWorkflowPress = (0, react_1.useCallback)(function () {
        if (!isSmartLimitEnabled) {
            return;
        }
        setIsDisableWorkflowWarningModalOpen(true);
    }, [isSmartLimitEnabled]);
    var spendItems = [
        {
            icon: Illustrations.Car,
            titleTranslationKey: 'workspace.moreFeatures.distanceRates.title',
            subtitleTranslationKey: 'workspace.moreFeatures.distanceRates.subtitle',
            isActive: (_p = policy === null || policy === void 0 ? void 0 : policy.areDistanceRatesEnabled) !== null && _p !== void 0 ? _p : false,
            pendingAction: (_q = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _q === void 0 ? void 0 : _q.areDistanceRatesEnabled,
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, DistanceRate_1.enablePolicyDistanceRates)(policyID, isEnabled);
            },
        },
        {
            icon: Illustrations.HandCard,
            titleTranslationKey: 'workspace.moreFeatures.expensifyCard.title',
            subtitleTranslationKey: 'workspace.moreFeatures.expensifyCard.subtitle',
            isActive: (_r = policy === null || policy === void 0 ? void 0 : policy.areExpensifyCardsEnabled) !== null && _r !== void 0 ? _r : false,
            pendingAction: (_s = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _s === void 0 ? void 0 : _s.areExpensifyCardsEnabled,
            disabled: !(0, EmptyObject_1.isEmptyObject)(cardsList),
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, Policy_1.enableExpensifyCard)(policyID, isEnabled);
            },
            disabledAction: function () {
                setIsDisableExpensifyCardWarningModalOpen(true);
            },
        },
    ];
    spendItems.push({
        icon: Illustrations.CompanyCard,
        titleTranslationKey: 'workspace.moreFeatures.companyCards.title',
        subtitleTranslationKey: 'workspace.moreFeatures.companyCards.subtitle',
        isActive: (_t = policy === null || policy === void 0 ? void 0 : policy.areCompanyCardsEnabled) !== null && _t !== void 0 ? _t : false,
        pendingAction: (_u = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _u === void 0 ? void 0 : _u.areCompanyCardsEnabled,
        disabled: !(0, EmptyObject_1.isEmptyObject)((0, CardUtils_1.getCompanyFeeds)(cardFeeds)),
        action: function (isEnabled) {
            if (!policyID) {
                return;
            }
            (0, Policy_1.enableCompanyCards)(policyID, isEnabled, true);
        },
        disabledAction: function () {
            setIsDisableCompanyCardsWarningModalOpen(true);
        },
    });
    spendItems.push({
        icon: Illustrations.PerDiem,
        titleTranslationKey: 'workspace.moreFeatures.perDiem.title',
        subtitleTranslationKey: 'workspace.moreFeatures.perDiem.subtitle',
        isActive: (_v = policy === null || policy === void 0 ? void 0 : policy.arePerDiemRatesEnabled) !== null && _v !== void 0 ? _v : false,
        pendingAction: (_w = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _w === void 0 ? void 0 : _w.arePerDiemRatesEnabled,
        action: function (isEnabled) {
            if (!policyID) {
                return;
            }
            if (isEnabled && !(0, PolicyUtils_1.isControlPolicy)(policy)) {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.alias, ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID)));
                return;
            }
            (0, PerDiem_1.enablePerDiem)(policyID, isEnabled, perDiemCustomUnit === null || perDiemCustomUnit === void 0 ? void 0 : perDiemCustomUnit.customUnitID, true);
        },
    });
    var manageItems = [
        {
            icon: Illustrations.Workflows,
            titleTranslationKey: 'workspace.moreFeatures.workflows.title',
            subtitleTranslationKey: 'workspace.moreFeatures.workflows.subtitle',
            isActive: (_x = policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled) !== null && _x !== void 0 ? _x : false,
            pendingAction: (_y = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _y === void 0 ? void 0 : _y.areWorkflowsEnabled,
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, Policy_1.enablePolicyWorkflows)(policyID, isEnabled);
            },
            disabled: isSmartLimitEnabled,
            disabledAction: onDisabledWorkflowPress,
        },
        {
            icon: Illustrations.Rules,
            titleTranslationKey: 'workspace.moreFeatures.rules.title',
            subtitleTranslationKey: 'workspace.moreFeatures.rules.subtitle',
            isActive: (_z = policy === null || policy === void 0 ? void 0 : policy.areRulesEnabled) !== null && _z !== void 0 ? _z : false,
            pendingAction: (_0 = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _0 === void 0 ? void 0 : _0.areRulesEnabled,
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                if (isEnabled && !(0, PolicyUtils_1.isControlPolicy)(policy)) {
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias, ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID)));
                    return;
                }
                (0, Policy_1.enablePolicyRules)(policyID, isEnabled);
            },
        },
    ];
    var earnItems = [
        {
            icon: Illustrations.InvoiceBlue,
            titleTranslationKey: 'workspace.moreFeatures.invoices.title',
            subtitleTranslationKey: 'workspace.moreFeatures.invoices.subtitle',
            isActive: (_1 = policy === null || policy === void 0 ? void 0 : policy.areInvoicesEnabled) !== null && _1 !== void 0 ? _1 : false,
            pendingAction: (_2 = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _2 === void 0 ? void 0 : _2.areInvoicesEnabled,
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, Policy_1.enablePolicyInvoicing)(policyID, isEnabled);
            },
        },
    ];
    var organizeItems = [
        {
            icon: Illustrations.FolderOpen,
            titleTranslationKey: 'workspace.moreFeatures.categories.title',
            subtitleTranslationKey: 'workspace.moreFeatures.categories.subtitle',
            isActive: (_3 = policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled) !== null && _3 !== void 0 ? _3 : false,
            disabled: hasAccountingConnection,
            disabledAction: onDisabledOrganizeSwitchPress,
            pendingAction: (_4 = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _4 === void 0 ? void 0 : _4.areCategoriesEnabled,
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, Category_1.enablePolicyCategories)(policyID, isEnabled, policyTagLists, allTransactionViolations, true);
            },
        },
        {
            icon: Illustrations.Tag,
            titleTranslationKey: 'workspace.moreFeatures.tags.title',
            subtitleTranslationKey: 'workspace.moreFeatures.tags.subtitle',
            isActive: (_5 = policy === null || policy === void 0 ? void 0 : policy.areTagsEnabled) !== null && _5 !== void 0 ? _5 : false,
            disabled: hasAccountingConnection,
            pendingAction: (_6 = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _6 === void 0 ? void 0 : _6.areTagsEnabled,
            disabledAction: onDisabledOrganizeSwitchPress,
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, Tag_1.enablePolicyTags)(policyID, isEnabled);
            },
        },
        {
            icon: Illustrations.Coins,
            titleTranslationKey: 'workspace.moreFeatures.taxes.title',
            subtitleTranslationKey: 'workspace.moreFeatures.taxes.subtitle',
            isActive: ((_8 = (_7 = policy === null || policy === void 0 ? void 0 : policy.tax) === null || _7 === void 0 ? void 0 : _7.trackingEnabled) !== null && _8 !== void 0 ? _8 : false) || isSyncTaxEnabled,
            disabled: hasAccountingConnection,
            pendingAction: (_9 = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _9 === void 0 ? void 0 : _9.tax,
            disabledAction: onDisabledOrganizeSwitchPress,
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, Policy_1.enablePolicyTaxes)(policyID, isEnabled);
            },
        },
    ];
    var integrateItems = [
        {
            icon: Illustrations.Accounting,
            titleTranslationKey: 'workspace.moreFeatures.connections.title',
            subtitleTranslationKey: 'workspace.moreFeatures.connections.subtitle',
            isActive: isAccountingEnabled,
            pendingAction: (_10 = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _10 === void 0 ? void 0 : _10.areConnectionsEnabled,
            disabledAction: function () {
                if (!hasAccountingConnection) {
                    return;
                }
                setIsIntegrateWarningModalOpen(true);
            },
            action: function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, Policy_1.enablePolicyConnections)(policyID, isEnabled);
            },
            disabled: hasAccountingConnection,
            errors: (0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED),
            onCloseError: function () {
                if (!policyID) {
                    return;
                }
                (0, Policy_1.clearPolicyErrorField)(policyID, CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED);
            },
        },
    ];
    var sections = [
        {
            titleTranslationKey: 'workspace.moreFeatures.integrateSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.integrateSection.subtitle',
            items: integrateItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.organizeSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.organizeSection.subtitle',
            items: organizeItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.manageSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.manageSection.subtitle',
            items: manageItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.spendSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.spendSection.subtitle',
            items: spendItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.earnSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.earnSection.subtitle',
            items: earnItems,
        },
    ];
    var renderItem = (0, react_1.useCallback)(function (item) { return (<react_native_1.View key={item.titleTranslationKey} style={[styles.workspaceSectionMoreFeaturesItem, shouldUseNarrowLayout && styles.flexBasis100, shouldUseNarrowLayout && StyleUtils.getMinimumWidth(0)]}>
                <ToggleSettingsOptionRow_1.default icon={item.icon} disabled={item.disabled} disabledAction={item.disabledAction} title={translate(item.titleTranslationKey)} titleStyle={styles.textStrong} subtitle={translate(item.subtitleTranslationKey)} switchAccessibilityLabel={translate(item.subtitleTranslationKey)} isActive={item.isActive} pendingAction={item.pendingAction} onToggle={item.action} showLockIcon={item.disabled} errors={item.errors} onCloseError={item.onCloseError}/>
            </react_native_1.View>); }, [styles, StyleUtils, shouldUseNarrowLayout, translate]);
    /** Used to fill row space in the Section items when there are odd number of items to create equal margins for last odd item. */
    var sectionRowFillerItem = (0, react_1.useCallback)(function (section) {
        if (section.items.length % 2 === 0) {
            return null;
        }
        return (<react_native_1.View key="section-filler-col" aria-hidden accessibilityElementsHidden style={[
                styles.workspaceSectionMoreFeaturesItem,
                shouldUseNarrowLayout && StyleUtils.getMinimumWidth(0),
                styles.p0,
                styles.mt0,
                styles.visibilityHidden,
                styles.bgTransparent,
            ]}/>);
    }, [styles, StyleUtils, shouldUseNarrowLayout]);
    var renderSection = (0, react_1.useCallback)(function (section) { return (<react_native_1.View key={section.titleTranslationKey} style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : {}]}>
                <Section_1.default containerStyles={[styles.ph1, styles.pv0, styles.bgTransparent, styles.noBorderRadius]} childrenStyles={[styles.flexRow, styles.flexWrap, styles.columnGap3]} renderTitle={function () { return <Text_1.default style={styles.mutedNormalTextLabel}>{translate(section.titleTranslationKey)}</Text_1.default>; }} subtitleMuted>
                    {section.items.map(renderItem)}
                    {sectionRowFillerItem(section)}
                </Section_1.default>
            </react_native_1.View>); }, [shouldUseNarrowLayout, styles, renderItem, translate, sectionRowFillerItem]);
    var fetchFeatures = (0, react_1.useCallback)(function () {
        (0, Policy_1.openPolicyMoreFeaturesPage)(route.params.policyID);
    }, [route.params.policyID]);
    (0, react_1.useEffect)(function () {
        fetchFeatures();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    (0, useNetwork_1.default)({ onReconnect: fetchFeatures });
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={route.params.policyID}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspaceMoreFeaturesPage.displayName} shouldShowOfflineIndicatorInWideScreen>
                <HeaderWithBackButton_1.default icon={Illustrations.Gears} shouldUseHeadlineHeader title={translate('workspace.common.moreFeatures')} shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={Navigation_1.default.popToSidebar}/>

                <ScrollView_1.default addBottomSafeAreaPadding>
                    <Text_1.default style={[styles.ph5, styles.mb5, styles.mt3, styles.textSupporting, styles.workspaceSectionMobile]}>{translate('workspace.moreFeatures.subtitle')}</Text_1.default>
                    {sections.map(renderSection)}
                </ScrollView_1.default>

                <ConfirmModal_1.default title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')} onConfirm={function () {
            if (!policyID) {
                return;
            }
            setIsOrganizeWarningModalOpen(false);
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID));
        }} onCancel={function () { return setIsOrganizeWarningModalOpen(false); }} isVisible={isOrganizeWarningModalOpen} prompt={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText')} confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')} cancelText={translate('common.cancel')}/>
                <ConfirmModal_1.default title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')} onConfirm={function () {
            if (!policyID) {
                return;
            }
            setIsIntegrateWarningModalOpen(false);
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID));
        }} onCancel={function () { return setIsIntegrateWarningModalOpen(false); }} isVisible={isIntegrateWarningModalOpen} prompt={translate('workspace.moreFeatures.connectionsWarningModal.disconnectText')} confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')} cancelText={translate('common.cancel')}/>
                <ConfirmModal_1.default title={translate('workspace.moreFeatures.expensifyCard.disableCardTitle')} isVisible={isDisableExpensifyCardWarningModalOpen} onConfirm={function () {
            setIsDisableExpensifyCardWarningModalOpen(false);
            (0, Report_1.navigateToConciergeChat)();
        }} onCancel={function () { return setIsDisableExpensifyCardWarningModalOpen(false); }} prompt={translate('workspace.moreFeatures.expensifyCard.disableCardPrompt')} confirmText={translate('workspace.moreFeatures.expensifyCard.disableCardButton')} cancelText={translate('common.cancel')}/>
                <ConfirmModal_1.default title={translate('workspace.moreFeatures.companyCards.disableCardTitle')} isVisible={isDisableCompanyCardsWarningModalOpen} onConfirm={function () {
            setIsDisableCompanyCardsWarningModalOpen(false);
            (0, Report_1.navigateToConciergeChat)();
        }} onCancel={function () { return setIsDisableCompanyCardsWarningModalOpen(false); }} prompt={translate('workspace.moreFeatures.companyCards.disableCardPrompt')} confirmText={translate('workspace.moreFeatures.companyCards.disableCardButton')} cancelText={translate('common.cancel')}/>
                <ConfirmModal_1.default title={translate('workspace.moreFeatures.workflowWarningModal.featureEnabledTitle')} isVisible={isDisableWorkflowWarningModalOpen} onConfirm={function () {
            setIsDisableWorkflowWarningModalOpen(false);
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
        }} onCancel={function () { return setIsDisableWorkflowWarningModalOpen(false); }} prompt={translate('workspace.moreFeatures.workflowWarningModal.featureEnabledText')} confirmText={translate('workspace.moreFeatures.workflowWarningModal.confirmText')} cancelText={translate('common.cancel')}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceMoreFeaturesPage.displayName = 'WorkspaceMoreFeaturesPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceMoreFeaturesPage);
