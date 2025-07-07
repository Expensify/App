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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYS_TO_PRESERVE = void 0;
exports.setLocale = setLocale;
exports.setLocaleAndNavigate = setLocaleAndNavigate;
exports.setSidebarLoaded = setSidebarLoaded;
exports.setUpPoliciesAndNavigate = setUpPoliciesAndNavigate;
exports.redirectThirdPartyDesktopSignIn = redirectThirdPartyDesktopSignIn;
exports.openApp = openApp;
exports.setAppLoading = setAppLoading;
exports.reconnectApp = reconnectApp;
exports.confirmReadyToOpenApp = confirmReadyToOpenApp;
exports.handleRestrictedEvent = handleRestrictedEvent;
exports.beginDeepLinkRedirect = beginDeepLinkRedirect;
exports.beginDeepLinkRedirectAfterTransition = beginDeepLinkRedirectAfterTransition;
exports.getMissingOnyxUpdates = getMissingOnyxUpdates;
exports.finalReconnectAppAfterActivatingReliableUpdates = finalReconnectAppAfterActivatingReliableUpdates;
exports.savePolicyDraftByNewWorkspace = savePolicyDraftByNewWorkspace;
exports.createWorkspaceWithPolicyDraftAndNavigateToIt = createWorkspaceWithPolicyDraftAndNavigateToIt;
exports.updateLastVisitedPath = updateLastVisitedPath;
exports.updateLastRoute = updateLastRoute;
exports.setIsUsingImportedState = setIsUsingImportedState;
exports.clearOnyxAndResetApp = clearOnyxAndResetApp;
exports.setPreservedUserSession = setPreservedUserSession;
// Issue - https://github.com/Expensify/App/issues/26719
var expensify_common_1 = require("expensify-common");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var emojis_1 = require("@assets/emojis");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var Browser = require("@libs/Browser");
var DateUtils_1 = require("@libs/DateUtils");
var EmojiTrie_1 = require("@libs/EmojiTrie");
var localeEventCallback_1 = require("@libs/Localize/localeEventCallback");
var Log_1 = require("@libs/Log");
var currentUrl_1 = require("@libs/Navigation/currentUrl");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Performance_1 = require("@libs/Performance");
var ReportUtils_1 = require("@libs/ReportUtils");
var SessionUtils_1 = require("@libs/SessionUtils");
var Sound_1 = require("@libs/Sound");
var CONST_1 = require("@src/CONST");
var LOCALES_1 = require("@src/CONST/LOCALES");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var Network_1 = require("./Network");
var PersistedRequests_1 = require("./PersistedRequests");
var Policy_1 = require("./Policy/Policy");
var Session_1 = require("./Session");
var currentUserAccountID;
var currentUserEmail;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (val) {
        var _a;
        currentUserAccountID = val === null || val === void 0 ? void 0 : val.accountID;
        currentUserEmail = (_a = val === null || val === void 0 ? void 0 : val.email) !== null && _a !== void 0 ? _a : '';
    },
});
var isSidebarLoaded;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.IS_SIDEBAR_LOADED,
    callback: function (val) { return (isSidebarLoaded = val); },
    initWithStoredValues: false,
});
var preferredLocale;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
    callback: function (val) {
        if (!val || !(0, LOCALES_1.isSupportedLocale)(val)) {
            return;
        }
        preferredLocale = val;
        IntlStore_1.default.load(val);
        (0, localeEventCallback_1.default)(val);
        // For locales without emoji support, fallback on English
        var normalizedLocale = (0, LOCALES_1.isFullySupportedLocale)(val) ? val : CONST_1.default.LOCALES.DEFAULT;
        (0, emojis_1.importEmojiLocale)(normalizedLocale).then(function () {
            (0, EmojiTrie_1.buildEmojisTrie)(normalizedLocale);
        });
    },
});
var priorityMode;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIORITY_MODE,
    callback: function (nextPriorityMode) {
        // When someone switches their priority mode we need to fetch all their chats because only #focus mode works with a subset of a user's chats. This is only possible via the OpenApp command.
        if (nextPriorityMode === CONST_1.default.PRIORITY_MODE.DEFAULT && priorityMode === CONST_1.default.PRIORITY_MODE.GSD) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            openApp();
        }
        priorityMode = nextPriorityMode;
    },
});
var isUsingImportedState;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.IS_USING_IMPORTED_STATE,
    callback: function (value) {
        isUsingImportedState = value !== null && value !== void 0 ? value : false;
    },
});
var preservedUserSession;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PRESERVED_USER_SESSION,
    callback: function (value) {
        preservedUserSession = value;
    },
});
var preservedShouldUseStagingServer;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ACCOUNT,
    callback: function (value) {
        preservedShouldUseStagingServer = value === null || value === void 0 ? void 0 : value.shouldUseStagingServer;
    },
});
var resolveHasLoadedAppPromise;
var hasLoadedAppPromise = new Promise(function (resolve) {
    resolveHasLoadedAppPromise = resolve;
});
var hasLoadedApp;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.HAS_LOADED_APP,
    callback: function (value) {
        hasLoadedApp = value;
        resolveHasLoadedAppPromise === null || resolveHasLoadedAppPromise === void 0 ? void 0 : resolveHasLoadedAppPromise();
    },
});
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var KEYS_TO_PRESERVE = [
    ONYXKEYS_1.default.ACCOUNT,
    ONYXKEYS_1.default.IS_CHECKING_PUBLIC_ROOM,
    ONYXKEYS_1.default.IS_LOADING_APP,
    ONYXKEYS_1.default.IS_SIDEBAR_LOADED,
    ONYXKEYS_1.default.MODAL,
    ONYXKEYS_1.default.NETWORK,
    ONYXKEYS_1.default.SESSION,
    ONYXKEYS_1.default.SHOULD_SHOW_COMPOSE_INPUT,
    ONYXKEYS_1.default.NVP_TRY_FOCUS_MODE,
    ONYXKEYS_1.default.PREFERRED_THEME,
    ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
    ONYXKEYS_1.default.CREDENTIALS,
    ONYXKEYS_1.default.PRESERVED_USER_SESSION,
];
exports.KEYS_TO_PRESERVE = KEYS_TO_PRESERVE;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.RESET_REQUIRED,
    callback: function (isResetRequired) {
        if (!isResetRequired) {
            return;
        }
        react_native_onyx_1.default.clear(KEYS_TO_PRESERVE).then(function () {
            // Set this to false to reset the flag for this client
            react_native_onyx_1.default.set(ONYXKEYS_1.default.RESET_REQUIRED, false);
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            openApp();
        });
    },
});
var resolveIsReadyPromise;
var isReadyToOpenApp = new Promise(function (resolve) {
    resolveIsReadyPromise = resolve;
});
function confirmReadyToOpenApp() {
    resolveIsReadyPromise();
}
function getNonOptimisticPolicyIDs(policies) {
    return Object.values(policies !== null && policies !== void 0 ? policies : {})
        .filter(function (policy) { return policy && policy.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD; })
        .map(function (policy) { return policy === null || policy === void 0 ? void 0 : policy.id; })
        .filter(function (id) { return !!id; });
}
function setLocale(locale) {
    if (locale === preferredLocale) {
        return;
    }
    // If user is not signed in, change just locally.
    if (!currentUserAccountID) {
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, locale);
        return;
    }
    // Optimistically change preferred locale
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
            value: locale,
        },
    ];
    var parameters = {
        value: locale,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, parameters, { optimisticData: optimisticData });
}
function setLocaleAndNavigate(locale) {
    setLocale(locale);
    Navigation_1.default.goBack();
}
function setSidebarLoaded() {
    if (isSidebarLoaded) {
        return;
    }
    react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_SIDEBAR_LOADED, true);
    Performance_1.default.markEnd(CONST_1.default.TIMING.SIDEBAR_LOADED);
}
function setAppLoading(isLoading) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_LOADING_APP, isLoading);
}
var appState;
react_native_1.AppState.addEventListener('change', function (nextAppState) {
    if (nextAppState.match(/inactive|background/) && appState === 'active') {
        Log_1.default.info('Flushing logs as app is going inactive', true, {}, true);
    }
    appState = nextAppState;
});
/**
 * Gets the policy params that are passed to the server in the OpenApp and ReconnectApp API commands. This includes a full list of policy IDs the client knows about as well as when they were last modified.
 */
function getPolicyParamsForOpenOrReconnect() {
    return new Promise(function (resolve) {
        isReadyToOpenApp.then(function () {
            var connection = react_native_onyx_1.default.connect({
                key: ONYXKEYS_1.default.COLLECTION.POLICY,
                waitForCollectionCallback: true,
                callback: function (policies) {
                    react_native_onyx_1.default.disconnect(connection);
                    resolve({ policyIDList: getNonOptimisticPolicyIDs(policies) });
                },
            });
        });
    });
}
/**
 * Returns the Onyx data that is used for both the OpenApp and ReconnectApp API commands.
 */
function getOnyxDataForOpenOrReconnect(isOpenApp, isFullReconnect, shouldKeepPublicRooms) {
    var _a, _b, _c;
    if (isOpenApp === void 0) { isOpenApp = false; }
    if (isFullReconnect === void 0) { isFullReconnect = false; }
    if (shouldKeepPublicRooms === void 0) { shouldKeepPublicRooms = false; }
    var result = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.IS_LOADING_REPORT_DATA,
                value: true,
            },
        ],
        successData: [],
        finallyData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.IS_LOADING_REPORT_DATA,
                value: false,
            },
        ],
        queueFlushedData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.HAS_LOADED_APP,
                value: true,
            },
        ],
    };
    if (isOpenApp) {
        (_a = result.optimisticData) === null || _a === void 0 ? void 0 : _a.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_APP,
            value: true,
        });
        (_b = result.finallyData) === null || _b === void 0 ? void 0 : _b.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_APP,
            value: false,
        });
    }
    if (isOpenApp || isFullReconnect) {
        (_c = result.successData) === null || _c === void 0 ? void 0 : _c.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LAST_FULL_RECONNECT_TIME,
            value: DateUtils_1.default.getDBTime(),
        });
    }
    if (shouldKeepPublicRooms) {
        var publicReports = Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).filter(function (report) { return (0, ReportUtils_1.isPublicRoom)(report) && (0, ReportUtils_1.isValidReport)(report); });
        publicReports === null || publicReports === void 0 ? void 0 : publicReports.forEach(function (report) {
            var _a;
            (_a = result.successData) === null || _a === void 0 ? void 0 : _a.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.reportID),
                value: __assign({}, report),
            });
        });
    }
    return result;
}
/**
 * Fetches data needed for app initialization
 */
function openApp(shouldKeepPublicRooms) {
    if (shouldKeepPublicRooms === void 0) { shouldKeepPublicRooms = false; }
    return getPolicyParamsForOpenOrReconnect().then(function (policyParams) {
        var params = __assign({ enablePriorityModeFilter: true }, policyParams);
        return API.writeWithNoDuplicatesConflictAction(types_1.WRITE_COMMANDS.OPEN_APP, params, getOnyxDataForOpenOrReconnect(true, undefined, shouldKeepPublicRooms));
    });
}
/**
 * Fetches data when the app reconnects to the network
 * @param [updateIDFrom] the ID of the Onyx update that we want to start fetching from
 */
function reconnectApp(updateIDFrom) {
    if (updateIDFrom === void 0) { updateIDFrom = 0; }
    hasLoadedAppPromise.then(function () {
        if (!hasLoadedApp) {
            openApp();
            return;
        }
        console.debug("[OnyxUpdates] App reconnecting with updateIDFrom: ".concat(updateIDFrom));
        getPolicyParamsForOpenOrReconnect().then(function (policyParams) {
            var params = policyParams;
            // Include the update IDs when reconnecting so that the server can send incremental updates if they are available.
            // Otherwise, a full set of app data will be returned.
            if (updateIDFrom) {
                params.updateIDFrom = updateIDFrom;
            }
            var isFullReconnect = !updateIDFrom;
            API.writeWithNoDuplicatesConflictAction(types_1.WRITE_COMMANDS.RECONNECT_APP, params, getOnyxDataForOpenOrReconnect(false, isFullReconnect, isSidebarLoaded));
        });
    });
}
/**
 * Fetches data when the app will call reconnectApp without params for the last time. This is a separate function
 * because it will follow patterns that are not recommended so we can be sure we're not putting the app in a unusable
 * state because of race conditions between reconnectApp and other pusher updates being applied at the same time.
 */
function finalReconnectAppAfterActivatingReliableUpdates() {
    console.debug("[OnyxUpdates] Executing last reconnect app with promise");
    return getPolicyParamsForOpenOrReconnect().then(function (policyParams) {
        var params = __assign({}, policyParams);
        // It is SUPER BAD FORM to return promises from action methods.
        // DO NOT FOLLOW THIS PATTERN!!!!!
        // It was absolutely necessary in order to not break the app while migrating to the new reliable updates pattern. This method will be removed
        // as soon as we have everyone migrated to the reliableUpdate beta.
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP, params, getOnyxDataForOpenOrReconnect(false, true));
    });
}
/**
 * Fetches data when the client has discovered it missed some Onyx updates from the server
 * @param [updateIDFrom] the ID of the Onyx update that we want to start fetching from
 * @param [updateIDTo] the ID of the Onyx update that we want to fetch up to
 */
function getMissingOnyxUpdates(updateIDFrom, updateIDTo) {
    if (updateIDFrom === void 0) { updateIDFrom = 0; }
    if (updateIDTo === void 0) { updateIDTo = 0; }
    console.debug("[OnyxUpdates] Fetching missing updates updateIDFrom: ".concat(updateIDFrom, " and updateIDTo: ").concat(updateIDTo));
    var parameters = {
        updateIDFrom: updateIDFrom,
        updateIDTo: updateIDTo,
    };
    // It is SUPER BAD FORM to return promises from action methods.
    // DO NOT FOLLOW THIS PATTERN!!!!!
    // It was absolutely necessary in order to block OnyxUpdates while fetching the missing updates from the server or else the updates aren't applied in the proper order.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES, parameters, getOnyxDataForOpenOrReconnect());
}
/**
 * This promise is used so that deeplink component know when a transition is end.
 * This is necessary because we want to begin deeplink redirection after the transition is end.
 */
var resolveSignOnTransitionToFinishPromise;
var signOnTransitionToFinishPromise = new Promise(function (resolve) {
    resolveSignOnTransitionToFinishPromise = resolve;
});
function waitForSignOnTransitionToFinish() {
    return signOnTransitionToFinishPromise;
}
function endSignOnTransition() {
    return resolveSignOnTransitionToFinishPromise();
}
/**
 * Create a new draft workspace and navigate to it
 *
 * @param [policyOwnerEmail] Optional, the email of the account to make the owner of the policy
 * @param [policyName] Optional, custom policy name we will use for created workspace
 * @param [transitionFromOldDot] Optional, if the user is transitioning from old dot
 * @param [makeMeAdmin] Optional, leave the calling account as an admin on the policy
 * @param [backTo] An optional return path. If provided, it will be URL-encoded and appended to the resulting URL.
 * @param [policyID] Optional, Policy id.
 * @param [currency] Optional, selected currency for the workspace
 * @param [file], avatar file for workspace
 * @param [routeToNavigateAfterCreate], Optional, route to navigate after creating a workspace
 */
function createWorkspaceWithPolicyDraftAndNavigateToIt(policyOwnerEmail, policyName, transitionFromOldDot, makeMeAdmin, backTo, policyID, currency, file, routeToNavigateAfterCreate) {
    if (policyOwnerEmail === void 0) { policyOwnerEmail = ''; }
    if (policyName === void 0) { policyName = ''; }
    if (transitionFromOldDot === void 0) { transitionFromOldDot = false; }
    if (makeMeAdmin === void 0) { makeMeAdmin = false; }
    if (backTo === void 0) { backTo = ''; }
    if (policyID === void 0) { policyID = ''; }
    var policyIDWithDefault = policyID || (0, Policy_1.generatePolicyID)();
    (0, Policy_1.createDraftInitialWorkspace)(policyOwnerEmail, policyName, policyIDWithDefault, makeMeAdmin, currency, file);
    Navigation_1.default.isNavigationReady()
        .then(function () {
        if (transitionFromOldDot) {
            // We must call goBack() to remove the /transition route from history
            Navigation_1.default.goBack();
        }
        var routeToNavigate = routeToNavigateAfterCreate !== null && routeToNavigateAfterCreate !== void 0 ? routeToNavigateAfterCreate : ROUTES_1.default.WORKSPACE_INITIAL.getRoute(policyIDWithDefault, backTo);
        savePolicyDraftByNewWorkspace(policyIDWithDefault, policyName, policyOwnerEmail, makeMeAdmin, currency, file);
        Navigation_1.default.navigate(routeToNavigate, { forceReplace: !transitionFromOldDot });
    })
        .then(endSignOnTransition);
}
/**
 * Create a new workspace and delete the draft
 *
 * @param [policyID] the ID of the policy to use
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyOwnerEmail] Optional, the email of the account to make the owner of the policy
 * @param [makeMeAdmin] Optional, leave the calling account as an admin on the policy
 * @param [currency] Optional, selected currency for the workspace
 * @param [file] Optional, avatar file for workspace
 */
function savePolicyDraftByNewWorkspace(policyID, policyName, policyOwnerEmail, makeMeAdmin, currency, file) {
    if (policyOwnerEmail === void 0) { policyOwnerEmail = ''; }
    if (makeMeAdmin === void 0) { makeMeAdmin = false; }
    if (currency === void 0) { currency = ''; }
    (0, Policy_1.createWorkspace)(policyOwnerEmail, makeMeAdmin, policyName, policyID, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM, currency, file);
}
/**
 * This action runs when the Navigator is ready and the current route changes
 *
 * currentPath should be the path as reported by the NavigationContainer
 *
 * The transition link contains an exitTo param that contains the route to
 * navigate to after the user is signed in. A user can transition from OldDot
 * with a different account than the one they are currently signed in with, so
 * we only navigate if they are not signing in as a new user. Once they are
 * signed in as that new user, this action will run again and the navigation
 * will occur.

 * When the exitTo route is 'workspace/new', we create a new
 * workspace and navigate to it
 *
 * We subscribe to the session using withOnyx in the AuthScreens and
 * pass it in as a parameter. withOnyx guarantees that the value has been read
 * from Onyx because it will not render the AuthScreens until that point.
 */
function setUpPoliciesAndNavigate(session) {
    var _a, _b;
    var currentUrl = (0, currentUrl_1.default)();
    if (!session || !(currentUrl === null || currentUrl === void 0 ? void 0 : currentUrl.includes('exitTo'))) {
        endSignOnTransition();
        return;
    }
    var isLoggingInAsNewUser = !!session.email && (0, SessionUtils_1.isLoggingInAsNewUser)(currentUrl, session.email);
    var url = new URL(currentUrl);
    var exitTo = url.searchParams.get('exitTo');
    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    var policyOwnerEmail = (_a = url.searchParams.get('ownerEmail')) !== null && _a !== void 0 ? _a : '';
    var makeMeAdmin = !!url.searchParams.get('makeMeAdmin');
    var policyName = (_b = url.searchParams.get('policyName')) !== null && _b !== void 0 ? _b : '';
    // Sign out the current user if we're transitioning with a different user
    var isTransitioning = expensify_common_1.Str.startsWith(url.pathname, expensify_common_1.Str.normalizeUrl(ROUTES_1.default.TRANSITION_BETWEEN_APPS));
    var shouldCreateFreePolicy = !isLoggingInAsNewUser && isTransitioning && exitTo === ROUTES_1.default.WORKSPACE_NEW;
    if (shouldCreateFreePolicy) {
        createWorkspaceWithPolicyDraftAndNavigateToIt(policyOwnerEmail, policyName, true, makeMeAdmin);
        return;
    }
    if (!isLoggingInAsNewUser && exitTo) {
        Navigation_1.default.waitForProtectedRoutes()
            .then(function () {
            Navigation_1.default.navigate(exitTo);
        })
            .then(endSignOnTransition);
    }
    else {
        endSignOnTransition();
    }
}
function redirectThirdPartyDesktopSignIn() {
    var currentUrl = (0, currentUrl_1.default)();
    if (!currentUrl) {
        return;
    }
    var url = new URL(currentUrl);
    if (url.pathname === "/".concat(ROUTES_1.default.GOOGLE_SIGN_IN) || url.pathname === "/".concat(ROUTES_1.default.APPLE_SIGN_IN)) {
        Navigation_1.default.isNavigationReady().then(function () {
            Navigation_1.default.goBack();
            Navigation_1.default.navigate(ROUTES_1.default.DESKTOP_SIGN_IN_REDIRECT);
        });
    }
}
/**
 * @param shouldAuthenticateWithCurrentAccount Optional, indicates whether default authentication method (shortLivedAuthToken) should be used
 */
function beginDeepLinkRedirect(shouldAuthenticateWithCurrentAccount, isMagicLink, initialRoute) {
    if (shouldAuthenticateWithCurrentAccount === void 0) { shouldAuthenticateWithCurrentAccount = true; }
    // There's no support for anonymous users on desktop
    if ((0, Session_1.isAnonymousUser)()) {
        return;
    }
    // If the route that is being handled is a magic link, email and shortLivedAuthToken should not be attached to the url
    // to prevent signing into the wrong account
    if (!currentUserAccountID || !shouldAuthenticateWithCurrentAccount) {
        Browser.openRouteInDesktopApp();
        return;
    }
    var parameters = { shouldRetry: false };
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK, parameters, {}).then(function (response) {
        if (!response) {
            Log_1.default.alert('Trying to redirect via deep link, but the response is empty. User likely not authenticated.', { response: response, shouldAuthenticateWithCurrentAccount: shouldAuthenticateWithCurrentAccount, currentUserAccountID: currentUserAccountID }, true);
            return;
        }
        Browser.openRouteInDesktopApp(response.shortLivedAuthToken, currentUserEmail, isMagicLink ? '/r' : initialRoute);
    });
}
/**
 * @param shouldAuthenticateWithCurrentAccount Optional, indicates whether default authentication method (shortLivedAuthToken) should be used
 */
function beginDeepLinkRedirectAfterTransition(shouldAuthenticateWithCurrentAccount) {
    if (shouldAuthenticateWithCurrentAccount === void 0) { shouldAuthenticateWithCurrentAccount = true; }
    waitForSignOnTransitionToFinish().then(function () { return beginDeepLinkRedirect(shouldAuthenticateWithCurrentAccount); });
}
function handleRestrictedEvent(eventName) {
    var parameters = { eventName: eventName };
    API.write(types_1.WRITE_COMMANDS.HANDLE_RESTRICTED_EVENT, parameters);
}
function updateLastVisitedPath(path) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.LAST_VISITED_PATH, path);
}
function updateLastRoute(screen) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.LAST_ROUTE, screen);
}
function setIsUsingImportedState(usingImportedState) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_USING_IMPORTED_STATE, usingImportedState);
}
function setPreservedUserSession(session) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.PRESERVED_USER_SESSION, session);
}
function clearOnyxAndResetApp(shouldNavigateToHomepage) {
    // The value of isUsingImportedState will be lost once Onyx is cleared, so we need to store it
    var isStateImported = isUsingImportedState;
    var shouldUseStagingServer = preservedShouldUseStagingServer;
    var sequentialQueue = (0, PersistedRequests_1.getAll)();
    (0, PersistedRequests_1.rollbackOngoingRequest)();
    react_native_onyx_1.default.clear(KEYS_TO_PRESERVE)
        .then(function () {
        // Network key is preserved, so when using imported state, we should stop forcing offline mode so that the app can re-fetch the network
        if (isStateImported) {
            (0, Network_1.setShouldForceOffline)(false);
        }
        if (shouldNavigateToHomepage) {
            Navigation_1.default.navigate(ROUTES_1.default.HOME);
        }
        if (preservedUserSession) {
            react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, preservedUserSession);
            react_native_onyx_1.default.set(ONYXKEYS_1.default.PRESERVED_USER_SESSION, null);
        }
        if (shouldUseStagingServer) {
            react_native_onyx_1.default.set(ONYXKEYS_1.default.ACCOUNT, { shouldUseStagingServer: shouldUseStagingServer });
        }
    })
        .then(function () {
        // Requests in a sequential queue should be called even if the Onyx state is reset, so we do not lose any pending data.
        // However, the OpenApp request must be called before any other request in a queue to ensure data consistency.
        // To do that, sequential queue is cleared together with other keys, and then it's restored once the OpenApp request is resolved.
        openApp().then(function () {
            if (!sequentialQueue || isStateImported) {
                return;
            }
            sequentialQueue.forEach(function (request) {
                (0, PersistedRequests_1.save)(request);
            });
        });
    });
    (0, Sound_1.clearSoundAssetsCache)();
}
