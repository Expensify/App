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
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var native_1 = require("@react-navigation/native");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var CustomStatusBarAndBackgroundContext_1 = require("@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext");
var FloatingActionButton_1 = require("@components/FloatingActionButton");
var Expensicons = require("@components/Icon/Expensicons");
var PopoverMenu_1 = require("@components/PopoverMenu");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var IOU_1 = require("@libs/actions/IOU");
var Link_1 = require("@libs/actions/Link");
var QuickActionNavigation_1 = require("@libs/actions/QuickActionNavigation");
var Report_1 = require("@libs/actions/Report");
var Session_1 = require("@libs/actions/Session");
var Task_1 = require("@libs/actions/Task");
var getIconForAction_1 = require("@libs/getIconForAction");
var interceptAnonymousUser_1 = require("@libs/interceptAnonymousUser");
var isSearchTopmostFullScreenRoute_1 = require("@libs/Navigation/helpers/isSearchTopmostFullScreenRoute");
var navigateAfterInteraction_1 = require("@libs/Navigation/navigateAfterInteraction");
var Navigation_1 = require("@libs/Navigation/Navigation");
var onboardingSelectors_1 = require("@libs/onboardingSelectors");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var QuickActionUtils_1 = require("@libs/QuickActionUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var variables_1 = require("@styles/variables");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var mapOnyxCollectionItems_1 = require("@src/utils/mapOnyxCollectionItems");
var policySelector = function (policy) {
    return (policy && {
        type: policy.type,
        role: policy.role,
        id: policy.id,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        pendingAction: policy.pendingAction,
        avatarURL: policy.avatarURL,
        name: policy.name,
        areInvoicesEnabled: policy.areInvoicesEnabled,
    });
};
/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover(_a, ref) {
    var _b;
    var onHideCreateMenu = _a.onHideCreateMenu, onShowCreateMenu = _a.onShowCreateMenu, isTooltipAllowed = _a.isTooltipAllowed;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: true })[0], isLoading = _c === void 0 ? false : _c;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false, selector: function (onyxSession) { return ({ email: onyxSession === null || onyxSession === void 0 ? void 0 : onyxSession.email, accountID: onyxSession === null || onyxSession === void 0 ? void 0 : onyxSession.accountID }); } })[0];
    var quickAction = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE, { canBeMissing: true })[0];
    var quickActionReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(quickAction === null || quickAction === void 0 ? void 0 : quickAction.chatReportID), { canBeMissing: true })[0];
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(quickActionReport === null || quickActionReport === void 0 ? void 0 : quickActionReport.reportID), { canBeMissing: true })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true })[0];
    var activePolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(activePolicyID), { canBeMissing: true })[0];
    var policyChatForActivePolicy = (0, react_1.useMemo)(function () {
        var _a;
        if ((0, EmptyObject_1.isEmptyObject)(activePolicy) || !(activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.isPolicyExpenseChatEnabled)) {
            return {};
        }
        var policyChatsForActivePolicy = (0, ReportUtils_1.getWorkspaceChats)(activePolicyID, [(_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID], allReports);
        return policyChatsForActivePolicy.length > 0 ? policyChatsForActivePolicy.at(0) : {};
    }, [activePolicy, activePolicyID, session === null || session === void 0 ? void 0 : session.accountID, allReports]);
    var quickActionPolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(quickActionReport === null || quickActionReport === void 0 ? void 0 : quickActionReport.policyID), { canBeMissing: true })[0];
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { selector: function (c) { return (0, mapOnyxCollectionItems_1.default)(c, policySelector); }, canBeMissing: true })[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _d = (0, react_1.useState)(false), isCreateMenuActive = _d[0], setIsCreateMenuActive = _d[1];
    var _e = (0, react_1.useState)(false), modalVisible = _e[0], setModalVisible = _e[1];
    var fabRef = (0, react_1.useRef)(null);
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var isFocused = (0, native_1.useIsFocused)();
    var prevIsFocused = (0, usePrevious_1.default)(isFocused);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _f = (0, usePermissions_1.default)(), isBlockedFromSpotnanaTravel = _f.isBlockedFromSpotnanaTravel, isBetaEnabled = _f.isBetaEnabled;
    var isManualDistanceTrackingEnabled = isBetaEnabled(CONST_1.default.BETAS.MANUAL_DISTANCE);
    var primaryLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return account === null || account === void 0 ? void 0 : account.primaryLogin; }, canBeMissing: true })[0];
    var primaryContactMethod = (_b = primaryLogin !== null && primaryLogin !== void 0 ? primaryLogin : session === null || session === void 0 ? void 0 : session.email) !== null && _b !== void 0 ? _b : '';
    var travelSettings = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_TRAVEL_SETTINGS, { canBeMissing: true })[0];
    var canSendInvoice = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.canSendInvoice)(allPolicies, session === null || session === void 0 ? void 0 : session.email); }, [allPolicies, session === null || session === void 0 ? void 0 : session.email]);
    var isValidReport = !((0, EmptyObject_1.isEmptyObject)(quickActionReport) || (0, ReportUtils_1.isArchivedReport)(reportNameValuePairs));
    var introSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_INTRO_SELECTED, { canBeMissing: true })[0];
    var _g = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, {
        selector: onboardingSelectors_1.hasSeenTourSelector,
        canBeMissing: true,
    })[0], hasSeenTour = _g === void 0 ? false : _g;
    var viewTourReportID = introSelected === null || introSelected === void 0 ? void 0 : introSelected.viewTour;
    var viewTourReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(viewTourReportID), { canBeMissing: true })[0];
    var setRootStatusBarEnabled = (0, react_1.useContext)(CustomStatusBarAndBackgroundContext_1.default).setRootStatusBarEnabled;
    var groupPoliciesWithChatEnabled = (0, PolicyUtils_1.getGroupPaidPoliciesWithExpenseChatEnabled)();
    /**
     * There are scenarios where users who have not yet had their group workspace-chats in NewDot (isPolicyExpenseChatEnabled). In those scenarios, things can get confusing if they try to submit/track expenses. To address this, we block them from Creating, Tracking, Submitting expenses from NewDot if they are:
     * 1. on at least one group policy
     * 2. none of the group policies they are a member of have isPolicyExpenseChatEnabled=true
     */
    var shouldRedirectToExpensifyClassic = (0, react_1.useMemo)(function () {
        var _a;
        return (0, PolicyUtils_1.areAllGroupPoliciesExpenseChatDisabled)((_a = allPolicies) !== null && _a !== void 0 ? _a : {});
    }, [allPolicies]);
    var shouldShowCreateReportOption = shouldRedirectToExpensifyClassic || groupPoliciesWithChatEnabled.length > 0;
    var shouldShowNewWorkspaceButton = Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).every(function (policy) { return !(0, PolicyUtils_1.shouldShowPolicy)(policy, !!isOffline, session === null || session === void 0 ? void 0 : session.email); });
    var quickActionAvatars = (0, react_1.useMemo)(function () {
        if (isValidReport) {
            var avatars = (0, ReportUtils_1.getIcons)(quickActionReport, personalDetails);
            return avatars.length <= 1 || (0, ReportUtils_1.isPolicyExpenseChat)(quickActionReport) ? avatars : avatars.filter(function (avatar) { return avatar.id !== (session === null || session === void 0 ? void 0 : session.accountID); });
        }
        if (!(0, EmptyObject_1.isEmptyObject)(policyChatForActivePolicy)) {
            return (0, ReportUtils_1.getIcons)(policyChatForActivePolicy, personalDetails);
        }
        return [];
        // Policy is needed as a dependency in order to update the shortcut details when the workspace changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [personalDetails, session === null || session === void 0 ? void 0 : session.accountID, quickActionReport, quickActionPolicy, policyChatForActivePolicy]);
    var quickActionTitle = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d;
        if ((0, EmptyObject_1.isEmptyObject)(quickActionReport)) {
            return '';
        }
        if ((quickAction === null || quickAction === void 0 ? void 0 : quickAction.action) === CONST_1.default.QUICK_ACTIONS.SEND_MONEY && quickActionAvatars.length > 0) {
            var accountID = (_b = (_a = quickActionAvatars.at(0)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
            var name_1 = (_c = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: Number(accountID), shouldUseShortForm: true })) !== null && _c !== void 0 ? _c : '';
            return translate('quickAction.paySomeone', { name: name_1 });
        }
        var titleKey = (0, QuickActionUtils_1.getQuickActionTitle)((_d = quickAction === null || quickAction === void 0 ? void 0 : quickAction.action) !== null && _d !== void 0 ? _d : '');
        return titleKey ? translate(titleKey) : '';
    }, [quickAction, translate, quickActionAvatars, quickActionReport]);
    var hideQABSubtitle = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d;
        if (!isValidReport) {
            return true;
        }
        if (quickActionAvatars.length === 0) {
            return false;
        }
        var displayName = (_d = (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_b = (_a = quickActionAvatars.at(0)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _c === void 0 ? void 0 : _c.firstName) !== null && _d !== void 0 ? _d : '';
        return (quickAction === null || quickAction === void 0 ? void 0 : quickAction.action) === CONST_1.default.QUICK_ACTIONS.SEND_MONEY && displayName.length === 0;
    }, [isValidReport, quickActionAvatars, personalDetails, quickAction === null || quickAction === void 0 ? void 0 : quickAction.action]);
    var quickActionSubtitle = (0, react_1.useMemo)(function () {
        var _a;
        if ((quickAction === null || quickAction === void 0 ? void 0 : quickAction.action) === CONST_1.default.QUICK_ACTIONS.CREATE_REPORT) {
            return quickActionPolicy === null || quickActionPolicy === void 0 ? void 0 : quickActionPolicy.name;
        }
        return !hideQABSubtitle ? ((_a = (0, ReportUtils_1.getReportName)(quickActionReport)) !== null && _a !== void 0 ? _a : translate('quickAction.updateDestination')) : '';
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hideQABSubtitle, personalDetails, quickAction === null || quickAction === void 0 ? void 0 : quickAction.action, quickActionPolicy === null || quickActionPolicy === void 0 ? void 0 : quickActionPolicy.name, quickActionReport, translate]);
    var selectOption = (0, react_1.useCallback)(function (onSelected, shouldRestrictAction) {
        if (shouldRestrictAction && (quickActionReport === null || quickActionReport === void 0 ? void 0 : quickActionReport.policyID) && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(quickActionReport.policyID)) {
            Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(quickActionReport.policyID));
            return;
        }
        onSelected();
    }, [quickActionReport === null || quickActionReport === void 0 ? void 0 : quickActionReport.policyID]);
    /**
     * Check if LHN status changed from active to inactive.
     * Used to close already opened FAB menu when open any other pages (i.e. Press Command + K on web).
     */
    var didScreenBecomeInactive = (0, react_1.useCallback)(function () {
        // When any other page is opened over LHN
        return !isFocused && prevIsFocused;
    }, [isFocused, prevIsFocused]);
    /**
     * Method called when we click the floating action button
     */
    var showCreateMenu = (0, react_1.useCallback)(function () {
        if (!isFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsCreateMenuActive(true);
        onShowCreateMenu === null || onShowCreateMenu === void 0 ? void 0 : onShowCreateMenu();
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [isFocused, shouldUseNarrowLayout]);
    /**
     * Method called either when:
     * - Pressing the floating action button to open the CreateMenu modal
     * - Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    var hideCreateMenu = (0, react_1.useCallback)(function () {
        if (!isCreateMenuActive) {
            return;
        }
        setIsCreateMenuActive(false);
        onHideCreateMenu === null || onHideCreateMenu === void 0 ? void 0 : onHideCreateMenu();
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [isCreateMenuActive]);
    (0, react_1.useEffect)(function () {
        if (!didScreenBecomeInactive()) {
            return;
        }
        // Hide menu manually when other pages are opened using shortcut key
        hideCreateMenu();
    }, [didScreenBecomeInactive, hideCreateMenu]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        hideCreateMenu: function () {
            hideCreateMenu();
        },
    }); });
    var toggleCreateMenu = function () {
        if (isCreateMenuActive) {
            hideCreateMenu();
        }
        else {
            showCreateMenu();
        }
    };
    var expenseMenuItems = (0, react_1.useMemo)(function () {
        return [
            {
                icon: (0, getIconForAction_1.default)(CONST_1.default.IOU.TYPE.CREATE),
                text: translate('iou.createExpense'),
                testID: 'create-expense',
                shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout,
                onSelected: function () {
                    return (0, interceptAnonymousUser_1.default)(function () {
                        if (shouldRedirectToExpensifyClassic) {
                            setModalVisible(true);
                            return;
                        }
                        (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.CREATE, 
                        // When starting to create an expense from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
                        // for all of the routes in the creation flow.
                        (0, ReportUtils_1.generateReportID)());
                    });
                },
            },
        ];
    }, [translate, shouldRedirectToExpensifyClassic, shouldUseNarrowLayout]);
    var quickActionMenuItems = (0, react_1.useMemo)(function () {
        // Define common properties in baseQuickAction
        var baseQuickAction = {
            label: translate('quickAction.header'),
            labelStyle: [styles.pt3, styles.pb2],
            isLabelHoverable: false,
            floatRightAvatars: quickActionAvatars,
            floatRightAvatarSize: CONST_1.default.AVATAR_SIZE.SMALL,
            numberOfLinesDescription: 1,
            tooltipAnchorAlignment: {
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            },
            shouldTeleportPortalToModalLayer: true,
        };
        if (quickAction === null || quickAction === void 0 ? void 0 : quickAction.action) {
            if (!(0, QuickActionUtils_1.isQuickActionAllowed)(quickAction, quickActionReport, quickActionPolicy)) {
                return [];
            }
            var onSelected = function () {
                (0, interceptAnonymousUser_1.default)(function () {
                    (0, QuickActionNavigation_1.navigateToQuickAction)(isValidReport, quickAction, currentUserPersonalDetails, quickActionPolicy === null || quickActionPolicy === void 0 ? void 0 : quickActionPolicy.id, selectOption);
                });
            };
            return [
                __assign(__assign({}, baseQuickAction), { icon: (0, QuickActionUtils_1.getQuickActionIcon)(quickAction === null || quickAction === void 0 ? void 0 : quickAction.action), text: quickActionTitle, description: quickActionSubtitle, onSelected: onSelected, shouldCallAfterModalHide: shouldUseNarrowLayout, shouldShowSubscriptRightAvatar: (0, ReportUtils_1.isPolicyExpenseChat)(quickActionReport) }),
            ];
        }
        if (!(0, EmptyObject_1.isEmptyObject)(policyChatForActivePolicy)) {
            var onSelected = function () {
                (0, interceptAnonymousUser_1.default)(function () {
                    if ((policyChatForActivePolicy === null || policyChatForActivePolicy === void 0 ? void 0 : policyChatForActivePolicy.policyID) && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policyChatForActivePolicy.policyID)) {
                        Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                        return;
                    }
                    var quickActionReportID = (policyChatForActivePolicy === null || policyChatForActivePolicy === void 0 ? void 0 : policyChatForActivePolicy.reportID) || (0, ReportUtils_1.generateReportID)();
                    (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.SUBMIT, quickActionReportID, CONST_1.default.IOU.REQUEST_TYPE.SCAN, true);
                });
            };
            return [
                __assign(__assign({}, baseQuickAction), { icon: Expensicons.ReceiptScan, text: translate('quickAction.scanReceipt'), description: (0, ReportUtils_1.getReportName)(policyChatForActivePolicy), shouldCallAfterModalHide: shouldUseNarrowLayout, onSelected: onSelected, shouldShowSubscriptRightAvatar: true }),
            ];
        }
        return [];
    }, [
        translate,
        styles.pt3,
        styles.pb2,
        quickActionAvatars,
        quickAction,
        policyChatForActivePolicy,
        quickActionTitle,
        quickActionSubtitle,
        currentUserPersonalDetails,
        quickActionPolicy,
        quickActionReport,
        isValidReport,
        selectOption,
        shouldUseNarrowLayout,
    ]);
    var isTravelEnabled = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e;
        if (!!isBlockedFromSpotnanaTravel || !primaryContactMethod || expensify_common_1.Str.isSMSLogin(primaryContactMethod) || !(0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy)) {
            return false;
        }
        var isPolicyProvisioned = (_b = (_a = activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.travelSettings) === null || _a === void 0 ? void 0 : _a.spotnanaCompanyID) !== null && _b !== void 0 ? _b : (_c = activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.travelSettings) === null || _c === void 0 ? void 0 : _c.associatedTravelDomainAccountID;
        return (_e = (_d = activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.travelSettings) === null || _d === void 0 ? void 0 : _d.hasAcceptedTerms) !== null && _e !== void 0 ? _e : ((travelSettings === null || travelSettings === void 0 ? void 0 : travelSettings.hasAcceptedTerms) && isPolicyProvisioned);
    }, [activePolicy, isBlockedFromSpotnanaTravel, primaryContactMethod, travelSettings === null || travelSettings === void 0 ? void 0 : travelSettings.hasAcceptedTerms]);
    var openTravel = (0, react_1.useCallback)(function () {
        var _a, _b;
        if (isTravelEnabled) {
            (_b = (_a = (0, Link_1.openTravelDotLink)(activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.id)) === null || _a === void 0 ? void 0 : _a.then(function () { })) === null || _b === void 0 ? void 0 : _b.catch(function () {
                Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_MY_TRIPS);
            });
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_MY_TRIPS);
        }
    }, [activePolicy, isTravelEnabled]);
    var menuItems = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], expenseMenuItems, true), (isManualDistanceTrackingEnabled
        ? [
            {
                icon: Expensicons.Location,
                text: translate('iou.trackDistance'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: function () {
                    (0, interceptAnonymousUser_1.default)(function () {
                        if (shouldRedirectToExpensifyClassic) {
                            setModalVisible(true);
                            return;
                        }
                        // Start the flow to start tracking a distance request
                        return null;
                    });
                },
            },
        ]
        : []), true), (shouldShowCreateReportOption
        ? [
            {
                icon: Expensicons.Document,
                text: translate('report.newReport.createReport'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: function () {
                    (0, interceptAnonymousUser_1.default)(function () {
                        var _a;
                        if (shouldRedirectToExpensifyClassic) {
                            setModalVisible(true);
                            return;
                        }
                        var workspaceIDForReportCreation;
                        if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && (0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy)) {
                            // If the user's default workspace is a paid group workspace with chat enabled, we create a report with it by default
                            workspaceIDForReportCreation = activePolicyID;
                        }
                        else if (groupPoliciesWithChatEnabled.length === 1) {
                            // If the user has only one paid group workspace with chat enabled, we create a report with it
                            workspaceIDForReportCreation = (_a = groupPoliciesWithChatEnabled.at(0)) === null || _a === void 0 ? void 0 : _a.id;
                        }
                        if (!workspaceIDForReportCreation || ((0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(workspaceIDForReportCreation) && groupPoliciesWithChatEnabled.length > 1)) {
                            // If we couldn't guess the workspace to create the report, or a guessed workspace is past it's grace period and we have other workspaces to choose from
                            Navigation_1.default.navigate(ROUTES_1.default.NEW_REPORT_WORKSPACE_SELECTION);
                            return;
                        }
                        if (!(0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(workspaceIDForReportCreation)) {
                            var createdReportID_1 = (0, Report_1.createNewReport)(currentUserPersonalDetails, workspaceIDForReportCreation);
                            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
                                Navigation_1.default.navigate((0, isSearchTopmostFullScreenRoute_1.default)()
                                    ? ROUTES_1.default.SEARCH_MONEY_REQUEST_REPORT.getRoute({ reportID: createdReportID_1, backTo: Navigation_1.default.getActiveRoute() })
                                    : ROUTES_1.default.REPORT_WITH_ID.getRoute(createdReportID_1, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute()));
                            });
                        }
                        else {
                            Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                        }
                    });
                },
            },
        ]
        : []), true), [
        {
            icon: Expensicons.ChatBubble,
            text: translate('sidebarScreen.fabNewChat'),
            shouldCallAfterModalHide: shouldUseNarrowLayout,
            onSelected: function () { return (0, interceptAnonymousUser_1.default)(Report_1.startNewChat); },
        }
    ], false), (canSendInvoice
        ? [
            {
                icon: Expensicons.InvoiceGeneric,
                text: translate('workspace.invoices.sendInvoice'),
                shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout,
                onSelected: function () {
                    return (0, interceptAnonymousUser_1.default)(function () {
                        if (shouldRedirectToExpensifyClassic) {
                            setModalVisible(true);
                            return;
                        }
                        (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.INVOICE, 
                        // When starting to create an invoice from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
                        // for all of the routes in the creation flow.
                        (0, ReportUtils_1.generateReportID)());
                    });
                },
            },
        ]
        : []), true), [
        {
            icon: Expensicons.Suitcase,
            text: translate('travel.bookTravel'),
            rightIcon: isTravelEnabled ? Expensicons.NewWindow : undefined,
            onSelected: function () { return (0, interceptAnonymousUser_1.default)(function () { return openTravel(); }); },
        },
    ], false), (!hasSeenTour
        ? [
            {
                icon: Expensicons.Binoculars,
                iconStyles: styles.popoverIconCircle,
                iconFill: theme.icon,
                text: translate('testDrive.quickAction.takeATwoMinuteTestDrive'),
                onSelected: function () {
                    return (0, interceptAnonymousUser_1.default)(function () {
                        react_native_1.InteractionManager.runAfterInteractions(function () {
                            if ((introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM ||
                                (introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) === CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER ||
                                (introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) === CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
                                (0, Task_1.completeTestDriveTask)(viewTourReport, viewTourReportID, (0, Session_1.isAnonymousUser)());
                                Navigation_1.default.navigate(ROUTES_1.default.TEST_DRIVE_DEMO_ROOT);
                            }
                            else {
                                Navigation_1.default.navigate(ROUTES_1.default.TEST_DRIVE_MODAL_ROOT.route);
                            }
                        });
                    });
                },
            },
        ]
        : []), true), (!isLoading && shouldShowNewWorkspaceButton
        ? [
            {
                displayInDefaultIconColor: true,
                contentFit: 'contain',
                icon: Expensicons.NewWorkspace,
                iconWidth: variables_1.default.w46,
                iconHeight: variables_1.default.h40,
                text: translate('workspace.new.newWorkspace'),
                description: translate('workspace.new.getTheExpensifyCardAndMore'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: function () { return (0, interceptAnonymousUser_1.default)(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CONFIRMATION.getRoute(Navigation_1.default.getActiveRoute())); }); },
            },
        ]
        : []), true), quickActionMenuItems, true);
    return (<react_native_1.View style={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <PopoverMenu_1.default onClose={hideCreateMenu} shouldEnableMaxHeight={false} isVisible={isCreateMenuActive && (!shouldUseNarrowLayout || isFocused)} anchorPosition={styles.createMenuPositionSidebar(windowHeight)} onItemSelected={hideCreateMenu} fromSidebarMediumScreen={!shouldUseNarrowLayout} animationInTiming={CONST_1.default.MODAL.ANIMATION_TIMING.FAB_IN} animationOutTiming={CONST_1.default.MODAL.ANIMATION_TIMING.FAB_OUT} menuItems={menuItems.map(function (item) {
            return __assign(__assign({}, item), { onSelected: function () {
                    if (!item.onSelected) {
                        return;
                    }
                    (0, navigateAfterInteraction_1.default)(item.onSelected);
                } });
        })} anchorRef={fabRef}/>
            <ConfirmModal_1.default prompt={translate('sidebarScreen.redirectToExpensifyClassicModal.description')} isVisible={modalVisible} onConfirm={function () {
            setModalVisible(false);
            if (CONFIG_1.default.IS_HYBRID_APP) {
                react_native_hybrid_app_1.default.closeReactNativeApp({ shouldSignOut: false, shouldSetNVP: true });
                setRootStatusBarEnabled(false);
                return;
            }
            (0, Link_1.openOldDotLink)(CONST_1.default.OLDDOT_URLS.INBOX);
        }} onCancel={function () { return setModalVisible(false); }} title={translate('sidebarScreen.redirectToExpensifyClassicModal.title')} confirmText={translate('exitSurvey.goToExpensifyClassic')} cancelText={translate('common.cancel')}/>
            <FloatingActionButton_1.default isTooltipAllowed={isTooltipAllowed} accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')} role={CONST_1.default.ROLE.BUTTON} isActive={isCreateMenuActive} ref={fabRef} onPress={toggleCreateMenu}/>
        </react_native_1.View>);
}
FloatingActionButtonAndPopover.displayName = 'FloatingActionButtonAndPopover';
exports.default = (0, react_1.forwardRef)(FloatingActionButtonAndPopover);
