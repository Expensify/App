"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FlatList_1 = require("@components/FlatList");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var Policy_1 = require("@libs/actions/Policy/Policy");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var WorkspaceReportFieldUtils_1 = require("@libs/WorkspaceReportFieldUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var ReportField_1 = require("@userActions/Policy/ReportField");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function WorkspaceReportFieldsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policyID = _a.route.params.policyID;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for the small screen selection mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _k = (0, react_1.useState)(false), isReportFieldsWarningModalOpen = _k[0], setIsReportFieldsWarningModalOpen = _k[1];
    var policy = (0, usePolicy_1.default)(policyID);
    var connectionSyncProgress = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policy === null || policy === void 0 ? void 0 : policy.id), { canBeMissing: true })[0];
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var isSyncInProgress = (0, connections_1.isConnectionInProgress)(connectionSyncProgress, policy);
    var hasSyncError = (0, PolicyUtils_1.shouldShowSyncError)(policy, isSyncInProgress);
    var connectedIntegration = (_b = (0, PolicyUtils_1.getConnectedIntegration)(policy)) !== null && _b !== void 0 ? _b : connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName;
    var isConnectionVerified = connectedIntegration && !(0, connections_1.isConnectionUnverified)(policy, connectedIntegration);
    var currentConnectionName = (0, PolicyUtils_1.getCurrentConnectionName)(policy);
    var hasReportAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var filteredPolicyFieldList = (0, react_1.useMemo)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.fieldList)) {
            return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return Object.fromEntries(Object.entries(policy.fieldList).filter(function (_a) {
            var _ = _a[0], value = _a[1];
            return value.fieldID !== 'text_title';
        }));
    }, [policy]);
    var hasAccountingConnection = !(0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections);
    var _l = (0, react_1.useState)(false), isOrganizeWarningModalOpen = _l[0], setIsOrganizeWarningModalOpen = _l[1];
    var onDisabledOrganizeSwitchPress = (0, react_1.useCallback)(function () {
        if (!hasAccountingConnection) {
            return;
        }
        setIsOrganizeWarningModalOpen(true);
    }, [hasAccountingConnection]);
    var fetchReportFields = (0, react_1.useCallback)(function () {
        (0, ReportField_1.openPolicyReportFieldsPage)(policyID);
    }, [policyID]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchReportFields }).isOffline;
    (0, react_1.useEffect)(function () {
        fetchReportFields();
    }, [fetchReportFields]);
    var reportFieldsSections = (0, react_1.useMemo)(function () {
        if (!policy) {
            return [];
        }
        return Object.values(filteredPolicyFieldList)
            .sort(function (a, b) { return (0, LocaleCompare_1.default)(a.name, b.name); })
            .map(function (reportField) { return ({
            text: reportField.name,
            keyForList: String(reportField.fieldID),
            fieldID: reportField.fieldID,
            pendingAction: reportField.pendingAction,
            isDisabled: reportField.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            rightLabel: expensify_common_1.Str.recapitalize(translate((0, WorkspaceReportFieldUtils_1.getReportFieldTypeTranslationKey)(reportField.type))),
        }); });
    }, [filteredPolicyFieldList, policy, translate]);
    var navigateToReportFieldsSettings = (0, react_1.useCallback)(function (reportField) {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_REPORT_FIELDS_SETTINGS.getRoute(policyID, reportField.fieldID));
    }, [policyID]);
    var getHeaderText = function () {
        return !hasSyncError && isConnectionVerified ? (<Text_1.default style={[styles.mr5, styles.mt1]}>
                <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{"".concat(translate('workspace.reportFields.importedFromAccountingSoftware'), " ")}</Text_1.default>
                <TextLink_1.default style={[styles.textNormal, styles.link]} href={"".concat(environmentURL, "/").concat(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID))}>
                    {"".concat(currentConnectionName, " ").concat(translate('workspace.accounting.settings'))}
                </TextLink_1.default>
                <Text_1.default style={[styles.textNormal, styles.colorMuted]}>.</Text_1.default>
            </Text_1.default>) : (<Text_1.default style={[styles.textNormal, styles.colorMuted, styles.mr5, styles.mt1]}>{translate('workspace.reportFields.subtitle')}</Text_1.default>);
    };
    var isLoading = !isOffline && policy === undefined;
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item;
        return (<OfflineWithFeedback_1.default pendingAction={item.pendingAction}>
                <MenuItem_1.default style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8} onPress={function () { return navigateToReportFieldsSettings(item); }} description={item.text} disabled={item.isDisabled} shouldShowRightIcon={!item.isDisabled} interactive={!item.isDisabled} rightLabel={item.rightLabel} descriptionTextStyle={[styles.popoverMenuText, styles.textStrong]}/>
            </OfflineWithFeedback_1.default>);
    }, [shouldUseNarrowLayout, styles.ph5, styles.ph8, styles.popoverMenuText, styles.textStrong, navigateToReportFieldsSettings]);
    var reportTitlePendingFields = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _c === void 0 ? void 0 : _c[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE]) === null || _d === void 0 ? void 0 : _d.pendingFields) !== null && _e !== void 0 ? _e : {};
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspaceReportFieldsPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto}>
                <HeaderWithBackButton_1.default icon={Illustrations_1.ReportReceipt} title={translate('common.reports')} shouldUseHeadlineHeader shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={Navigation_1.default.popToSidebar}/>
                {isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={styles.flex1} color={theme.spinner}/>)}
                {!isLoading && (<ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section_1.default isCentralPane title={translate('workspace.common.reportTitle')} renderSubtitle={function () { return (<Text_1.default style={[[styles.textLabelSupportingEmptyValue, styles.lh20, styles.mt1]]}>
                                    {translate('workspace.rules.expenseReportRules.customReportNamesSubtitle')}
                                    <TextLink_1.default style={[styles.link]} href={CONST_1.default.CUSTOM_REPORT_NAME_HELP_URL}>
                                        {translate('workspace.rules.expenseReportRules.customNameDescriptionLink')}
                                    </TextLink_1.default>
                                    .
                                </Text_1.default>); }} containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8} titleStyles={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]}>
                            <OfflineWithFeedback_1.default pendingAction={reportTitlePendingFields.defaultValue}>
                                <MenuItemWithTopDescription_1.default description={translate('workspace.rules.expenseReportRules.customNameTitle')} title={expensify_common_1.Str.htmlDecode((_g = (_f = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _f === void 0 ? void 0 : _f[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE].defaultValue) !== null && _g !== void 0 ? _g : '')} shouldShowRightIcon style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_CUSTOM_NAME.getRoute(policyID)); }}/>
                            </OfflineWithFeedback_1.default>
                            <ToggleSettingsOptionRow_1.default pendingAction={reportTitlePendingFields.deletable} title={translate('workspace.rules.expenseReportRules.preventMembersFromChangingCustomNamesTitle')} switchAccessibilityLabel={translate('workspace.rules.expenseReportRules.preventMembersFromChangingCustomNamesTitle')} wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt6]} titleStyle={styles.pv2} isActive={!((_h = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _h === void 0 ? void 0 : _h[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE].deletable)} onToggle={function (isEnabled) {
                if (isEnabled && !(0, PolicyUtils_1.isControlPolicy)(policy)) {
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.alias, ROUTES_1.default.WORKSPACE_REPORT_FIELDS.getRoute(policyID)));
                    return;
                }
                (0, Policy_1.setPolicyPreventMemberCreatedTitle)(policyID, isEnabled);
            }}/>
                        </Section_1.default>
                        <Section_1.default isCentralPane containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}>
                            <ToggleSettingsOptionRow_1.default pendingAction={(_j = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _j === void 0 ? void 0 : _j.areReportFieldsEnabled} title={translate('workspace.common.reportFields')} switchAccessibilityLabel={translate('workspace.common.reportFields')} subtitle={getHeaderText()} titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]} isActive={!!(policy === null || policy === void 0 ? void 0 : policy.areReportFieldsEnabled)} onToggle={function (isEnabled) {
                if (!isEnabled) {
                    setIsReportFieldsWarningModalOpen(true);
                    return;
                }
                if (!(0, PolicyUtils_1.isControlPolicy)(policy)) {
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias, ROUTES_1.default.WORKSPACE_REPORT_FIELDS.getRoute(policyID)));
                    return;
                }
                (0, Policy_1.enablePolicyReportFields)(policyID, isEnabled);
            }} disabled={hasAccountingConnection} disabledAction={onDisabledOrganizeSwitchPress} subMenuItems={!!(policy === null || policy === void 0 ? void 0 : policy.areReportFieldsEnabled) && (<>
                                            <FlatList_1.default data={reportFieldsSections} renderItem={renderItem} style={[shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8, styles.mt6]} scrollEnabled={false}/>
                                            {!hasReportAccountingConnections && (<MenuItem_1.default onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID)); }} title={translate('workspace.reportFields.addField')} icon={Expensicons_1.Plus} style={[styles.sectionMenuItemTopDescription]}/>)}
                                        </>)}/>
                        </Section_1.default>
                    </ScrollView_1.default>)}
                <ConfirmModal_1.default title={translate('workspace.reportFields.disableReportFields')} isVisible={isReportFieldsWarningModalOpen} onConfirm={function () {
            if (!policyID) {
                return;
            }
            setIsReportFieldsWarningModalOpen(false);
            (0, Policy_1.enablePolicyReportFields)(policyID, false);
        }} onCancel={function () { return setIsReportFieldsWarningModalOpen(false); }} prompt={translate('workspace.reportFields.disableReportFieldsConfirmation')} confirmText={translate('common.disable')} cancelText={translate('common.cancel')} danger/>
                <ConfirmModal_1.default title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')} onConfirm={function () {
            if (!policyID) {
                return;
            }
            setIsOrganizeWarningModalOpen(false);
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID));
        }} onCancel={function () { return setIsOrganizeWarningModalOpen(false); }} isVisible={isOrganizeWarningModalOpen} prompt={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText')} confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')} cancelText={translate('common.cancel')}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceReportFieldsPage.displayName = 'WorkspaceReportFieldsPage';
exports.default = WorkspaceReportFieldsPage;
