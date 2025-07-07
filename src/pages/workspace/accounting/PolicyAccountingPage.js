"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var CollapsibleSection_1 = require("@components/CollapsibleSection");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemList_1 = require("@components/MenuItemList");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var ThreeDotsMenu_1 = require("@components/ThreeDotsMenu");
var useExpensifyCardFeeds_1 = require("@hooks/useExpensifyCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThreeDotsAnchorPosition_1 = require("@hooks/useThreeDotsAnchorPosition");
var connections_1 = require("@libs/actions/connections");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Link_1 = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AccountingContext_1 = require("./AccountingContext");
var utils_1 = require("./utils");
function PolicyAccountingPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var connectionSyncProgress = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policy === null || policy === void 0 ? void 0 : policy.id), { canBeMissing: true })[0];
    var conciergeReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.CONCIERGE_REPORT_ID, { canBeMissing: true })[0];
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _j = (0, useLocalize_1.default)(), translate = _j.translate, getDatetimeToRelative = _j.datetimeToRelative, getLocalDateFromDatetime = _j.getLocalDateFromDatetime;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var threeDotsAnchorPosition = (0, useThreeDotsAnchorPosition_1.default)(styles.threeDotsPopoverOffsetNoCloseButton);
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _k = (0, react_1.useState)(false), isDisconnectModalOpen = _k[0], setIsDisconnectModalOpen = _k[1];
    var _l = (0, react_1.useState)(''), datetimeToRelative = _l[0], setDateTimeToRelative = _l[1];
    var threeDotsMenuContainerRef = (0, react_1.useRef)(null);
    var _m = (0, AccountingContext_1.useAccountingContext)(), startIntegrationFlow = _m.startIntegrationFlow, popoverAnchorRefs = _m.popoverAnchorRefs;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var isLargeScreenWidth = (0, useResponsiveLayout_1.default)().isLargeScreenWidth;
    var route = (0, native_1.useRoute)();
    var params = route.params;
    var newConnectionName = params === null || params === void 0 ? void 0 : params.newConnectionName;
    var integrationToDisconnect = params === null || params === void 0 ? void 0 : params.integrationToDisconnect;
    var shouldDisconnectIntegrationBeforeConnecting = params === null || params === void 0 ? void 0 : params.shouldDisconnectIntegrationBeforeConnecting;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var allCardSettings = (0, useExpensifyCardFeeds_1.default)(policyID);
    var isSyncInProgress = (0, connections_1.isConnectionInProgress)(connectionSyncProgress, policy);
    var connectionNames = CONST_1.default.POLICY.CONNECTIONS.NAME;
    var accountingIntegrations = Object.values(connectionNames);
    var connectedIntegration = (_b = (0, PolicyUtils_1.getConnectedIntegration)(policy, accountingIntegrations)) !== null && _b !== void 0 ? _b : connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName;
    var synchronizationError = connectedIntegration && (0, utils_1.getSynchronizationErrorMessage)(policy, connectedIntegration, isSyncInProgress, translate, styles);
    var shouldShowEnterCredentials = connectedIntegration && !!synchronizationError && (0, connections_1.isAuthenticationError)(policy, connectedIntegration);
    // Get the last successful date of the integration. Then, if `connectionSyncProgress` is the same integration displayed and the state is 'jobDone', get the more recent update time of the two.
    var successfulDate = (0, PolicyUtils_1.getIntegrationLastSuccessfulDate)(getLocalDateFromDatetime, connectedIntegration ? (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c[connectedIntegration] : undefined, connectedIntegration === (connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName) ? connectionSyncProgress : undefined);
    var hasSyncError = (0, PolicyUtils_1.shouldShowSyncError)(policy, isSyncInProgress);
    var hasUnsupportedNDIntegration = !(0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections) && (0, PolicyUtils_1.hasUnsupportedIntegration)(policy, accountingIntegrations);
    var tenants = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getXeroTenants)(policy); }, [policy]);
    var currentXeroOrganization = (0, PolicyUtils_1.findCurrentXeroOrganization)(tenants, (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.xero) === null || _e === void 0 ? void 0 : _e.config) === null || _f === void 0 ? void 0 : _f.tenantID);
    var shouldShowSynchronizationError = !!synchronizationError;
    var shouldShowReinstallConnectorMenuItem = shouldShowSynchronizationError && connectedIntegration === CONST_1.default.POLICY.CONNECTIONS.NAME.QBD;
    var shouldShowCardReconciliationOption = (_g = Object.values(allCardSettings !== null && allCardSettings !== void 0 ? allCardSettings : {})) === null || _g === void 0 ? void 0 : _g.some(function (cardSetting) { return (0, CardUtils_1.isExpensifyCardFullySetUp)(policy, cardSetting); });
    var overflowMenu = (0, react_1.useMemo)(function () { return __spreadArray(__spreadArray(__spreadArray([], (shouldShowReinstallConnectorMenuItem
        ? [
            {
                icon: Expensicons.CircularArrowBackwards,
                text: translate('workspace.accounting.reinstall'),
                onSelected: function () { return startIntegrationFlow({ name: CONST_1.default.POLICY.CONNECTIONS.NAME.QBD }); },
                shouldCallAfterModalHide: true,
                disabled: isOffline,
                iconRight: Expensicons.NewWindow,
            },
        ]
        : []), true), (shouldShowEnterCredentials
        ? [
            {
                icon: Expensicons.Key,
                text: translate('workspace.accounting.enterCredentials'),
                onSelected: function () { return startIntegrationFlow({ name: connectedIntegration }); },
                shouldCallAfterModalHide: true,
                disabled: isOffline,
                iconRight: Expensicons.NewWindow,
            },
        ]
        : [
            {
                icon: Expensicons.Sync,
                text: translate('workspace.accounting.syncNow'),
                onSelected: function () { return (0, connections_1.syncConnection)(policy, connectedIntegration); },
                disabled: isOffline,
            },
        ]), true), [
        {
            icon: Expensicons.Trashcan,
            text: translate('workspace.accounting.disconnect'),
            onSelected: function () { return setIsDisconnectModalOpen(true); },
            shouldCallAfterModalHide: true,
        },
    ], false); }, [shouldShowEnterCredentials, shouldShowReinstallConnectorMenuItem, translate, isOffline, policy, connectedIntegration, startIntegrationFlow]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        if (!newConnectionName || !(0, PolicyUtils_1.isControlPolicy)(policy)) {
            return;
        }
        startIntegrationFlow({
            name: newConnectionName,
            integrationToDisconnect: integrationToDisconnect,
            shouldDisconnectIntegrationBeforeConnecting: shouldDisconnectIntegrationBeforeConnecting,
        });
    }, [newConnectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting, policy, startIntegrationFlow]));
    (0, react_1.useEffect)(function () {
        if (successfulDate) {
            setDateTimeToRelative(getDatetimeToRelative(successfulDate));
            return;
        }
        setDateTimeToRelative('');
    }, [getDatetimeToRelative, successfulDate]);
    var calculateAndSetThreeDotsMenuPosition = (0, react_1.useCallback)(function () {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({ horizontal: 0, vertical: 0 });
        }
        return new Promise(function (resolve) {
            var _a;
            (_a = threeDotsMenuContainerRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y, width, height) {
                resolve({
                    horizontal: x + width,
                    vertical: y + height,
                });
            });
        });
    }, [shouldUseNarrowLayout]);
    var integrationSpecificMenuItems = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26;
        var sageIntacctEntityList = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.entities) !== null && _d !== void 0 ? _d : [];
        var netSuiteSubsidiaryList = (_j = (_h = (_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.netsuite) === null || _f === void 0 ? void 0 : _f.options) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.subsidiaryList) !== null && _j !== void 0 ? _j : [];
        switch (connectedIntegration) {
            case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
                return !((_m = (_l = (_k = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _k === void 0 ? void 0 : _k.xero) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.tenants)
                    ? {}
                    : {
                        description: translate('workspace.xero.organization'),
                        iconRight: Expensicons.ArrowRight,
                        title: (0, PolicyUtils_1.getCurrentXeroOrganizationName)(policy),
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        titleStyle: styles.fontWeightNormal,
                        shouldShowRightIcon: tenants.length > 1,
                        shouldShowDescriptionOnTop: true,
                        onPress: function () {
                            if (!(tenants.length > 1)) {
                                return;
                            }
                            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_ORGANIZATION.getRoute(policyID, currentXeroOrganization === null || currentXeroOrganization === void 0 ? void 0 : currentXeroOrganization.id));
                        },
                        pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.TENANT_ID], (_q = (_p = (_o = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _o === void 0 ? void 0 : _o.xero) === null || _p === void 0 ? void 0 : _p.config) === null || _q === void 0 ? void 0 : _q.pendingFields),
                        brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.XERO_CONFIG.TENANT_ID], (_t = (_s = (_r = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _r === void 0 ? void 0 : _r.xero) === null || _s === void 0 ? void 0 : _s.config) === null || _t === void 0 ? void 0 : _t.errorFields)
                            ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
                            : undefined,
                    };
            case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
                return !((_x = (_w = (_v = (_u = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _u === void 0 ? void 0 : _u.netsuite) === null || _v === void 0 ? void 0 : _v.options) === null || _w === void 0 ? void 0 : _w.config) === null || _x === void 0 ? void 0 : _x.subsidiary)
                    ? {}
                    : {
                        description: translate('workspace.netsuite.subsidiary'),
                        iconRight: Expensicons.ArrowRight,
                        title: (_2 = (_1 = (_0 = (_z = (_y = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _y === void 0 ? void 0 : _y.netsuite) === null || _z === void 0 ? void 0 : _z.options) === null || _0 === void 0 ? void 0 : _0.config) === null || _1 === void 0 ? void 0 : _1.subsidiary) !== null && _2 !== void 0 ? _2 : '',
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        titleStyle: styles.fontWeightNormal,
                        shouldShowRightIcon: (netSuiteSubsidiaryList === null || netSuiteSubsidiaryList === void 0 ? void 0 : netSuiteSubsidiaryList.length) > 1,
                        shouldShowDescriptionOnTop: true,
                        pendingAction: (_7 = (_6 = (_5 = (_4 = (_3 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _3 === void 0 ? void 0 : _3.netsuite) === null || _4 === void 0 ? void 0 : _4.options) === null || _5 === void 0 ? void 0 : _5.config) === null || _6 === void 0 ? void 0 : _6.pendingFields) === null || _7 === void 0 ? void 0 : _7.subsidiary,
                        brickRoadIndicator: ((_12 = (_11 = (_10 = (_9 = (_8 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _8 === void 0 ? void 0 : _8.netsuite) === null || _9 === void 0 ? void 0 : _9.options) === null || _10 === void 0 ? void 0 : _10.config) === null || _11 === void 0 ? void 0 : _11.errorFields) === null || _12 === void 0 ? void 0 : _12.subsidiary) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                        onPress: function () {
                            if (!((netSuiteSubsidiaryList === null || netSuiteSubsidiaryList === void 0 ? void 0 : netSuiteSubsidiaryList.length) > 1)) {
                                return;
                            }
                            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.getRoute(policyID));
                        },
                    };
            case CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                return !sageIntacctEntityList.length
                    ? {}
                    : {
                        description: translate('workspace.intacct.entity'),
                        iconRight: Expensicons.ArrowRight,
                        title: (0, PolicyUtils_1.getCurrentSageIntacctEntityName)(policy, translate('workspace.common.topLevel')),
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        titleStyle: styles.fontWeightNormal,
                        shouldShowRightIcon: true,
                        shouldShowDescriptionOnTop: true,
                        pendingAction: (_16 = (_15 = (_14 = (_13 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _13 === void 0 ? void 0 : _13.intacct) === null || _14 === void 0 ? void 0 : _14.config) === null || _15 === void 0 ? void 0 : _15.pendingFields) === null || _16 === void 0 ? void 0 : _16.entity,
                        brickRoadIndicator: ((_20 = (_19 = (_18 = (_17 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _17 === void 0 ? void 0 : _17.intacct) === null || _18 === void 0 ? void 0 : _18.config) === null || _19 === void 0 ? void 0 : _19.errorFields) === null || _20 === void 0 ? void 0 : _20.entity) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                        onPress: function () {
                            if (!sageIntacctEntityList.length) {
                                return;
                            }
                            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY.getRoute(policyID));
                        },
                    };
            case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
                return !((_23 = (_22 = (_21 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _21 === void 0 ? void 0 : _21.quickbooksOnline) === null || _22 === void 0 ? void 0 : _22.config) === null || _23 === void 0 ? void 0 : _23.companyName)
                    ? {}
                    : {
                        description: translate('workspace.qbo.connectedTo'),
                        title: (_26 = (_25 = (_24 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _24 === void 0 ? void 0 : _24.quickbooksOnline) === null || _25 === void 0 ? void 0 : _25.config) === null || _26 === void 0 ? void 0 : _26.companyName,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        titleStyle: styles.fontWeightNormal,
                        shouldShowDescriptionOnTop: true,
                        interactive: false,
                    };
            default:
                return undefined;
        }
    }, [connectedIntegration, currentXeroOrganization === null || currentXeroOrganization === void 0 ? void 0 : currentXeroOrganization.id, policy, policyID, styles.fontWeightNormal, styles.sectionMenuItemTopDescription, tenants.length, translate]);
    var connectionsMenuItems = (0, react_1.useMemo)(function () {
        if ((0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections) && !isSyncInProgress && policyID) {
            return accountingIntegrations
                .map(function (integration) {
                var integrationData = (0, utils_1.getAccountingIntegrationData)(integration, policyID, translate);
                if (!integrationData) {
                    return undefined;
                }
                var iconProps = (integrationData === null || integrationData === void 0 ? void 0 : integrationData.icon)
                    ? {
                        icon: integrationData.icon,
                        iconType: CONST_1.default.ICON_TYPE_AVATAR,
                    }
                    : {};
                return __assign(__assign({}, iconProps), { interactive: false, wrapperStyle: [styles.sectionMenuItemTopDescription], shouldShowRightComponent: true, title: integrationData === null || integrationData === void 0 ? void 0 : integrationData.title, rightComponent: (<Button_1.default onPress={function () { return startIntegrationFlow({ name: integration }); }} text={translate('workspace.accounting.setup')} style={styles.justifyContentCenter} small isDisabled={isOffline} ref={function (ref) {
                            if (!(popoverAnchorRefs === null || popoverAnchorRefs === void 0 ? void 0 : popoverAnchorRefs.current)) {
                                return;
                            }
                            // eslint-disable-next-line react-compiler/react-compiler
                            popoverAnchorRefs.current[integration].current = ref;
                        }}/>) });
            })
                .filter(Boolean);
        }
        if (!connectedIntegration || !policyID) {
            return [];
        }
        var isConnectionVerified = !(0, connections_1.isConnectionUnverified)(policy, connectedIntegration);
        var integrationData = (0, utils_1.getAccountingIntegrationData)(connectedIntegration, policyID, translate, policy, undefined, undefined, undefined, isBetaEnabled(CONST_1.default.BETAS.NETSUITE_USA_TAX));
        var iconProps = (integrationData === null || integrationData === void 0 ? void 0 : integrationData.icon) ? { icon: integrationData.icon, iconType: CONST_1.default.ICON_TYPE_AVATAR } : {};
        var connectionMessage;
        if (isSyncInProgress && (connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.stageInProgress)) {
            connectionMessage = translate('workspace.accounting.connections.syncStageName', { stage: connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.stageInProgress });
        }
        else if (!isConnectionVerified) {
            connectionMessage = translate('workspace.accounting.notSync');
        }
        else {
            connectionMessage = translate('workspace.accounting.lastSync', { relativeDate: datetimeToRelative });
        }
        var configurationOptions = __spreadArray(__spreadArray([
            {
                icon: Expensicons.Pencil,
                iconRight: Expensicons.ArrowRight,
                shouldShowRightIcon: true,
                title: translate('workspace.accounting.import'),
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                onPress: integrationData === null || integrationData === void 0 ? void 0 : integrationData.onImportPagePress,
                brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(integrationData === null || integrationData === void 0 ? void 0 : integrationData.subscribedImportSettings, integrationData === null || integrationData === void 0 ? void 0 : integrationData.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                pendingAction: (0, PolicyUtils_1.settingsPendingAction)(integrationData === null || integrationData === void 0 ? void 0 : integrationData.subscribedImportSettings, integrationData === null || integrationData === void 0 ? void 0 : integrationData.pendingFields),
            },
            {
                icon: Expensicons.Send,
                iconRight: Expensicons.ArrowRight,
                shouldShowRightIcon: true,
                title: translate('workspace.accounting.export'),
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                onPress: integrationData === null || integrationData === void 0 ? void 0 : integrationData.onExportPagePress,
                brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(integrationData === null || integrationData === void 0 ? void 0 : integrationData.subscribedExportSettings, integrationData === null || integrationData === void 0 ? void 0 : integrationData.errorFields) || (0, QuickbooksOnline_1.shouldShowQBOReimbursableExportDestinationAccountError)(policy)
                    ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
                    : undefined,
                pendingAction: (0, PolicyUtils_1.settingsPendingAction)(integrationData === null || integrationData === void 0 ? void 0 : integrationData.subscribedExportSettings, integrationData === null || integrationData === void 0 ? void 0 : integrationData.pendingFields),
            }
        ], (shouldShowCardReconciliationOption
            ? [
                {
                    icon: Expensicons.ExpensifyCard,
                    iconRight: Expensicons.ArrowRight,
                    shouldShowRightIcon: true,
                    title: translate('workspace.accounting.cardReconciliation'),
                    wrapperStyle: [styles.sectionMenuItemTopDescription],
                    onPress: integrationData === null || integrationData === void 0 ? void 0 : integrationData.onCardReconciliationPagePress,
                },
            ]
            : []), true), [
            {
                icon: Expensicons.Gear,
                iconRight: Expensicons.ArrowRight,
                shouldShowRightIcon: true,
                title: translate('workspace.accounting.advanced'),
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                onPress: integrationData === null || integrationData === void 0 ? void 0 : integrationData.onAdvancedPagePress,
                brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(integrationData === null || integrationData === void 0 ? void 0 : integrationData.subscribedAdvancedSettings, integrationData === null || integrationData === void 0 ? void 0 : integrationData.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                pendingAction: (0, PolicyUtils_1.settingsPendingAction)(integrationData === null || integrationData === void 0 ? void 0 : integrationData.subscribedAdvancedSettings, integrationData === null || integrationData === void 0 ? void 0 : integrationData.pendingFields),
            },
        ], false);
        return __spreadArray(__spreadArray([
            __assign(__assign({}, iconProps), { interactive: false, wrapperStyle: [styles.sectionMenuItemTopDescription, shouldShowSynchronizationError && styles.pb0], shouldShowRightComponent: true, title: integrationData === null || integrationData === void 0 ? void 0 : integrationData.title, errorText: synchronizationError, errorTextStyle: [styles.mt5], shouldShowRedDotIndicator: true, description: connectionMessage, rightComponent: isSyncInProgress ? (<react_native_1.ActivityIndicator style={[styles.popoverMenuIcon]} color={theme.spinner}/>) : (<react_native_1.View ref={threeDotsMenuContainerRef}>
                        <ThreeDotsMenu_1.default getAnchorPosition={calculateAndSetThreeDotsMenuPosition} menuItems={overflowMenu} anchorAlignment={{
                        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}/>
                    </react_native_1.View>) })
        ], ((0, EmptyObject_1.isEmptyObject)(integrationSpecificMenuItems) || shouldShowSynchronizationError || (0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections) ? [] : [integrationSpecificMenuItems]), true), ((0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections) || !isConnectionVerified ? [] : configurationOptions), true);
    }, [
        policy,
        isSyncInProgress,
        connectedIntegration,
        synchronizationError,
        shouldShowSynchronizationError,
        policyID,
        translate,
        styles.sectionMenuItemTopDescription,
        styles.pb0,
        styles.mt5,
        styles.popoverMenuIcon,
        styles.justifyContentCenter,
        connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.stageInProgress,
        datetimeToRelative,
        theme.spinner,
        overflowMenu,
        calculateAndSetThreeDotsMenuPosition,
        integrationSpecificMenuItems,
        accountingIntegrations,
        isOffline,
        startIntegrationFlow,
        popoverAnchorRefs,
        isBetaEnabled,
        shouldShowCardReconciliationOption,
    ]);
    var otherIntegrationsItems = (0, react_1.useMemo)(function () {
        if (((0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections) && !isSyncInProgress) || !policyID) {
            return;
        }
        var otherIntegrations = accountingIntegrations.filter(function (integration) { return (isSyncInProgress && integration !== (connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName)) || integration !== connectedIntegration; });
        return otherIntegrations
            .map(function (integration) {
            var integrationData = (0, utils_1.getAccountingIntegrationData)(integration, policyID, translate);
            if (!integrationData) {
                return undefined;
            }
            var iconProps = (integrationData === null || integrationData === void 0 ? void 0 : integrationData.icon) ? { icon: integrationData.icon, iconType: CONST_1.default.ICON_TYPE_AVATAR } : {};
            return __assign(__assign({}, iconProps), { title: integrationData === null || integrationData === void 0 ? void 0 : integrationData.title, rightComponent: (<Button_1.default onPress={function () {
                        return startIntegrationFlow({
                            name: integration,
                            integrationToDisconnect: connectedIntegration,
                            shouldDisconnectIntegrationBeforeConnecting: true,
                        });
                    }} text={translate('workspace.accounting.setup')} style={styles.justifyContentCenter} small isDisabled={isOffline} ref={function (r) {
                        if (!(popoverAnchorRefs === null || popoverAnchorRefs === void 0 ? void 0 : popoverAnchorRefs.current)) {
                            return;
                        }
                        popoverAnchorRefs.current[integration].current = r;
                    }}/>), interactive: false, shouldShowRightComponent: true, wrapperStyle: styles.sectionMenuItemTopDescription });
        })
            .filter(Boolean);
    }, [
        policy === null || policy === void 0 ? void 0 : policy.connections,
        isSyncInProgress,
        accountingIntegrations,
        connectionSyncProgress === null || connectionSyncProgress === void 0 ? void 0 : connectionSyncProgress.connectionName,
        connectedIntegration,
        policyID,
        translate,
        styles.justifyContentCenter,
        styles.sectionMenuItemTopDescription,
        isOffline,
        startIntegrationFlow,
        popoverAnchorRefs,
    ]);
    var _o = (0, react_1.useMemo)(function () {
        // If they have an onboarding specialist assigned display the following and link to the #admins room with the setup specialist.
        if (policy === null || policy === void 0 ? void 0 : policy.chatReportIDAdmins) {
            return [translate('workspace.accounting.talkYourOnboardingSpecialist'), policy === null || policy === void 0 ? void 0 : policy.chatReportIDAdmins];
        }
        // If not, if they have an account manager assigned display the following and link to the DM with their account manager.
        if (account === null || account === void 0 ? void 0 : account.accountManagerAccountID) {
            return [translate('workspace.accounting.talkYourAccountManager'), account === null || account === void 0 ? void 0 : account.accountManagerReportID];
        }
        // Else, display the following and link to their Concierge DM.
        return [translate('workspace.accounting.talkToConcierge'), conciergeReportID];
    }, [account, conciergeReportID, translate]), chatTextLink = _o[0], chatReportID = _o[1];
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}>
            <ScreenWrapper_1.default testID={PolicyAccountingPage.displayName} shouldShowOfflineIndicatorInWideScreen>
                <HeaderWithBackButton_1.default title={translate('workspace.common.accounting')} shouldShowBackButton={shouldUseNarrowLayout} icon={Illustrations.Accounting} shouldUseHeadlineHeader threeDotsAnchorPosition={threeDotsAnchorPosition} onBackButtonPress={Navigation_1.default.popToSidebar}/>
                <ScrollView_1.default contentContainerStyle={styles.pt3} addBottomSafeAreaPadding>
                    <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section_1.default title={translate('workspace.accounting.title')} subtitle={translate('workspace.accounting.subtitle')} isCentralPane subtitleMuted titleStyles={styles.accountSettingsSectionTitle} childrenStyles={styles.pt5}>
                            {!hasUnsupportedNDIntegration &&
            connectionsMenuItems.map(function (menuItem) { return (<OfflineWithFeedback_1.default pendingAction={menuItem.pendingAction} key={menuItem.title} shouldDisableStrikeThrough>
                                        <MenuItem_1.default brickRoadIndicator={menuItem.brickRoadIndicator} key={menuItem.title} 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...menuItem}/>
                                    </OfflineWithFeedback_1.default>); })}
                            {hasUnsupportedNDIntegration && hasSyncError && !!policyID && (<FormHelpMessage_1.default isError style={styles.menuItemError}>
                                    <Text_1.default style={[{ color: theme.textError }]}>
                                        {translate('workspace.accounting.errorODIntegration')}
                                        <TextLink_1.default onPress={function () {
                // Go to Expensify Classic.
                (0, Link_1.openOldDotLink)(CONST_1.default.OLDDOT_URLS.POLICY_CONNECTIONS_URL(policyID));
            }}>
                                            {translate('workspace.accounting.goToODToFix')}
                                        </TextLink_1.default>
                                    </Text_1.default>
                                </FormHelpMessage_1.default>)}
                            {hasUnsupportedNDIntegration && !hasSyncError && !!policyID && (<FormHelpMessage_1.default shouldShowRedDotIndicator={false}>
                                    <Text_1.default>
                                        <TextLink_1.default onPress={function () {
                // Go to Expensify Classic.
                (0, Link_1.openOldDotLink)(CONST_1.default.OLDDOT_URLS.POLICY_CONNECTIONS_URL(policyID));
            }}>
                                            {translate('workspace.accounting.goToODToSettings')}
                                        </TextLink_1.default>
                                    </Text_1.default>
                                </FormHelpMessage_1.default>)}
                            {!!otherIntegrationsItems && (<CollapsibleSection_1.default title={translate('workspace.accounting.other')} wrapperStyle={[styles.pr3, styles.mt5, styles.pv3]} titleStyle={[styles.textNormal, styles.colorMuted]} textStyle={[styles.flex1, styles.userSelectNone, styles.textNormal, styles.colorMuted]}>
                                    <MenuItemList_1.default menuItems={otherIntegrationsItems} shouldUseSingleExecution/>
                                </CollapsibleSection_1.default>)}
                            {!!((_h = account === null || account === void 0 ? void 0 : account.guideDetails) === null || _h === void 0 ? void 0 : _h.email) && !(0, PolicyUtils_1.hasAccountingConnections)(policy) && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mt7]}>
                                    <Icon_1.default src={Expensicons.QuestionMark} width={20} height={20} fill={theme.icon} additionalStyles={styles.mr3}/>
                                    <react_native_1.View style={[!isLargeScreenWidth ? styles.flexColumn : styles.flexRow]}>
                                        <Text_1.default style={styles.textSupporting}>{translate('workspace.accounting.needAnotherAccounting')}</Text_1.default>
                                        <TextLink_1.default onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(String(chatReportID))); }}>{chatTextLink}</TextLink_1.default>
                                    </react_native_1.View>
                                </react_native_1.View>)}
                        </Section_1.default>
                    </react_native_1.View>
                </ScrollView_1.default>
                <ConfirmModal_1.default title={translate('workspace.accounting.disconnectTitle', { connectionName: connectedIntegration })} isVisible={isDisconnectModalOpen} onConfirm={function () {
            if (connectedIntegration && policyID) {
                (0, connections_1.removePolicyConnection)(policyID, connectedIntegration);
            }
            setIsDisconnectModalOpen(false);
        }} onCancel={function () { return setIsDisconnectModalOpen(false); }} prompt={translate('workspace.accounting.disconnectPrompt', { connectionName: connectedIntegration })} confirmText={translate('workspace.accounting.disconnect')} cancelText={translate('common.cancel')} danger/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
function PolicyAccountingPageWrapper(props) {
    return (<AccountingContext_1.AccountingContextProvider policy={props.policy}>
            <PolicyAccountingPage 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>
        </AccountingContext_1.AccountingContextProvider>);
}
PolicyAccountingPage.displayName = 'PolicyAccountingPage';
exports.default = (0, withPolicyConnections_1.default)(PolicyAccountingPageWrapper);
