// Issue - https://github.com/Expensify/App/issues/26719
import {Str} from 'expensify-common';
import type {AppStateStatus} from 'react-native';
import {AppState} from 'react-native';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {importEmojiLocale} from '@assets/emojis';
import * as API from '@libs/API';
import type {GetMissingOnyxMessagesParams, HandleRestrictedEventParams, OpenAppParams, OpenOldDotLinkParams, ReconnectAppParams, UpdatePreferredLocaleParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as Browser from '@libs/Browser';
import {buildEmojisTrie} from '@libs/EmojiTrie';
import Log from '@libs/Log';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as SessionUtils from '@libs/SessionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import {setShouldForceOffline} from './Network';
import * as PersistedRequests from './PersistedRequests';
import * as Policy from './Policy/Policy';
import resolveDuplicationConflictAction from './RequestConflictUtils';
import * as Session from './Session';
import Timing from './Timing';

type PolicyParamsForOpenOrReconnect = {
    policyIDList: string[];
};

type Locale = ValueOf<typeof CONST.LOCALES>;

let currentUserAccountID: number | undefined;
let currentUserEmail: string;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = val?.accountID;
        currentUserEmail = val?.email ?? '';
    },
});

let isSidebarLoaded: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.IS_SIDEBAR_LOADED,
    callback: (val) => (isSidebarLoaded = val),
    initWithStoredValues: false,
});

let preferredLocale: string | undefined;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (val) => {
        preferredLocale = val;
        if (preferredLocale) {
            importEmojiLocale(preferredLocale as Locale).then(() => {
                buildEmojisTrie(preferredLocale as Locale);
            });
        }
    },
});

let priorityMode: ValueOf<typeof CONST.PRIORITY_MODE> | undefined;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIORITY_MODE,
    callback: (nextPriorityMode) => {
        // When someone switches their priority mode we need to fetch all their chats because only #focus mode works with a subset of a user's chats. This is only possible via the OpenApp command.
        if (nextPriorityMode === CONST.PRIORITY_MODE.DEFAULT && priorityMode === CONST.PRIORITY_MODE.GSD) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            openApp();
        }
        priorityMode = nextPriorityMode;
    },
});

let isUsingImportedState: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.IS_USING_IMPORTED_STATE,
    callback: (value) => {
        isUsingImportedState = value ?? false;
    },
});

const KEYS_TO_PRESERVE: OnyxKey[] = [
    ONYXKEYS.ACCOUNT,
    ONYXKEYS.IS_CHECKING_PUBLIC_ROOM,
    ONYXKEYS.IS_LOADING_APP,
    ONYXKEYS.IS_SIDEBAR_LOADED,
    ONYXKEYS.MODAL,
    ONYXKEYS.NETWORK,
    ONYXKEYS.SESSION,
    ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.CREDENTIALS,
];

Onyx.connect({
    key: ONYXKEYS.RESET_REQUIRED,
    callback: (isResetRequired) => {
        if (!isResetRequired) {
            return;
        }

        Onyx.clear(KEYS_TO_PRESERVE).then(() => {
            // Set this to false to reset the flag for this client
            Onyx.set(ONYXKEYS.RESET_REQUIRED, false);

            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            openApp();
        });
    },
});

let resolveIsReadyPromise: () => void;
const isReadyToOpenApp = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

function confirmReadyToOpenApp() {
    resolveIsReadyPromise();
}

function getNonOptimisticPolicyIDs(policies: OnyxCollection<OnyxTypes.Policy>): string[] {
    return Object.values(policies ?? {})
        .filter((policy) => policy && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)
        .map((policy) => policy?.id)
        .filter((id): id is string => !!id);
}

function setLocale(locale: Locale) {
    if (locale === preferredLocale) {
        return;
    }

    // If user is not signed in, change just locally.
    if (!currentUserAccountID) {
        Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
        return;
    }

    // Optimistically change preferred locale
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
            value: locale,
        },
    ];

    const parameters: UpdatePreferredLocaleParams = {
        value: locale,
    };

    importEmojiLocale(locale).then(() => {
        buildEmojisTrie(locale);
    });

    API.write(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, parameters, {optimisticData});
}

function setLocaleAndNavigate(locale: Locale) {
    setLocale(locale);
    Navigation.goBack();
}

function setSidebarLoaded() {
    if (isSidebarLoaded) {
        return;
    }

    Onyx.set(ONYXKEYS.IS_SIDEBAR_LOADED, true);
    Performance.markStart(CONST.TIMING.REPORT_INITIAL_RENDER);
}

let appState: AppStateStatus;
AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState.match(/inactive|background/) && appState === 'active') {
        Log.info('Flushing logs as app is going inactive', true, {}, true);
    }
    appState = nextAppState;
});

/**
 * Gets the policy params that are passed to the server in the OpenApp and ReconnectApp API commands. This includes a full list of policy IDs the client knows about as well as when they were last modified.
 */
function getPolicyParamsForOpenOrReconnect(): Promise<PolicyParamsForOpenOrReconnect> {
    return new Promise((resolve) => {
        isReadyToOpenApp.then(() => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.POLICY,
                waitForCollectionCallback: true,
                callback: (policies) => {
                    Onyx.disconnect(connection);
                    resolve({policyIDList: getNonOptimisticPolicyIDs(policies)});
                },
            });
        });
    });
}

/**
 * Returns the Onyx data that is used for both the OpenApp and ReconnectApp API commands.
 */
function getOnyxDataForOpenOrReconnect(isOpenApp = false): OnyxData {
    const defaultData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                value: true,
            },
        ],
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                value: false,
            },
        ],
    };
    if (!isOpenApp) {
        return defaultData;
    }
    return {
        optimisticData: [
            ...defaultData.optimisticData,
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_APP,
                value: true,
            },
        ],
        finallyData: [
            ...defaultData.finallyData,
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_APP,
                value: false,
            },
        ],
    };
}

/**
 * Fetches data needed for app initialization
 */
function openApp() {
    return getPolicyParamsForOpenOrReconnect().then((policyParams: PolicyParamsForOpenOrReconnect) => {
        const params: OpenAppParams = {enablePriorityModeFilter: true, ...policyParams};
        return API.write(WRITE_COMMANDS.OPEN_APP, params, getOnyxDataForOpenOrReconnect(true), {
            checkAndFixConflictingRequest: (persistedRequests) => resolveDuplicationConflictAction(persistedRequests, WRITE_COMMANDS.OPEN_APP),
        });
    });
}

/**
 * Fetches data when the app reconnects to the network
 * @param [updateIDFrom] the ID of the Onyx update that we want to start fetching from
 */
function reconnectApp(updateIDFrom: OnyxEntry<number> = 0) {
    console.debug(`[OnyxUpdates] App reconnecting with updateIDFrom: ${updateIDFrom}`);
    getPolicyParamsForOpenOrReconnect().then((policyParams) => {
        const params: ReconnectAppParams = policyParams;

        // When the app reconnects we do a fast "sync" of the LHN and only return chats that have new messages. We achieve this by sending the most recent reportActionID.
        // we have locally. And then only update the user about chats with messages that have occurred after that reportActionID.
        //
        // - Look through the local report actions and reports to find the most recently modified report action or report.
        // - We send this to the server so that it can compute which new chats the user needs to see and return only those as an optimization.
        Timing.start(CONST.TIMING.CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION);
        params.mostRecentReportActionLastModified = ReportActionsUtils.getMostRecentReportActionLastModified();
        Timing.end(CONST.TIMING.CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION, '', 500);

        // Include the update IDs when reconnecting so that the server can send incremental updates if they are available.
        // Otherwise, a full set of app data will be returned.
        if (updateIDFrom) {
            params.updateIDFrom = updateIDFrom;
        }

        API.write(WRITE_COMMANDS.RECONNECT_APP, params, getOnyxDataForOpenOrReconnect(), {
            checkAndFixConflictingRequest: (persistedRequests) => resolveDuplicationConflictAction(persistedRequests, WRITE_COMMANDS.RECONNECT_APP),
        });
    });
}

/**
 * Fetches data when the app will call reconnectApp without params for the last time. This is a separate function
 * because it will follow patterns that are not recommended so we can be sure we're not putting the app in a unusable
 * state because of race conditions between reconnectApp and other pusher updates being applied at the same time.
 */
function finalReconnectAppAfterActivatingReliableUpdates(): Promise<void | OnyxTypes.Response> {
    console.debug(`[OnyxUpdates] Executing last reconnect app with promise`);
    return getPolicyParamsForOpenOrReconnect().then((policyParams) => {
        const params: ReconnectAppParams = {...policyParams};

        // When the app reconnects we do a fast "sync" of the LHN and only return chats that have new messages. We achieve this by sending the most recent reportActionID.
        // we have locally. And then only update the user about chats with messages that have occurred after that reportActionID.
        //
        // - Look through the local report actions and reports to find the most recently modified report action or report.
        // - We send this to the server so that it can compute which new chats the user needs to see and return only those as an optimization.
        Timing.start(CONST.TIMING.CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION);
        params.mostRecentReportActionLastModified = ReportActionsUtils.getMostRecentReportActionLastModified();
        Timing.end(CONST.TIMING.CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION, '', 500);

        // It is SUPER BAD FORM to return promises from action methods.
        // DO NOT FOLLOW THIS PATTERN!!!!!
        // It was absolutely necessary in order to not break the app while migrating to the new reliable updates pattern. This method will be removed
        // as soon as we have everyone migrated to the reliableUpdate beta.
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP, params, getOnyxDataForOpenOrReconnect());
    });
}

/**
 * Fetches data when the client has discovered it missed some Onyx updates from the server
 * @param [updateIDFrom] the ID of the Onyx update that we want to start fetching from
 * @param [updateIDTo] the ID of the Onyx update that we want to fetch up to
 */
function getMissingOnyxUpdates(updateIDFrom = 0, updateIDTo: number | string = 0): Promise<void | OnyxTypes.Response> {
    console.debug(`[OnyxUpdates] Fetching missing updates updateIDFrom: ${updateIDFrom} and updateIDTo: ${updateIDTo}`);

    const parameters: GetMissingOnyxMessagesParams = {
        updateIDFrom,
        updateIDTo,
    };

    // It is SUPER BAD FORM to return promises from action methods.
    // DO NOT FOLLOW THIS PATTERN!!!!!
    // It was absolutely necessary in order to block OnyxUpdates while fetching the missing updates from the server or else the udpates aren't applied in the proper order.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES, parameters, getOnyxDataForOpenOrReconnect());
}

/**
 * This promise is used so that deeplink component know when a transition is end.
 * This is necessary because we want to begin deeplink redirection after the transition is end.
 */
let resolveSignOnTransitionToFinishPromise: () => void;
const signOnTransitionToFinishPromise = new Promise<void>((resolve) => {
    resolveSignOnTransitionToFinishPromise = resolve;
});

function waitForSignOnTransitionToFinish(): Promise<void> {
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
 */
function createWorkspaceWithPolicyDraftAndNavigateToIt(policyOwnerEmail = '', policyName = '', transitionFromOldDot = false, makeMeAdmin = false, backTo = '') {
    const policyID = Policy.generatePolicyID();
    Policy.createDraftInitialWorkspace(policyOwnerEmail, policyName, policyID, makeMeAdmin);

    Navigation.isNavigationReady()
        .then(() => {
            if (transitionFromOldDot) {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
            }
            savePolicyDraftByNewWorkspace(policyID, policyName, policyOwnerEmail, makeMeAdmin);
            Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policyID, backTo));
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
 */
function savePolicyDraftByNewWorkspace(policyID?: string, policyName?: string, policyOwnerEmail = '', makeMeAdmin = false) {
    Policy.createWorkspace(policyOwnerEmail, makeMeAdmin, policyName, policyID);
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
function setUpPoliciesAndNavigate(session: OnyxEntry<OnyxTypes.Session>) {
    const currentUrl = getCurrentUrl();
    if (!session || !currentUrl?.includes('exitTo')) {
        return;
    }

    const isLoggingInAsNewUser = !!session.email && SessionUtils.isLoggingInAsNewUser(currentUrl, session.email);
    const url = new URL(currentUrl);
    const exitTo = url.searchParams.get('exitTo') as Route | null;

    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const policyOwnerEmail = url.searchParams.get('ownerEmail') ?? '';
    const makeMeAdmin = !!url.searchParams.get('makeMeAdmin');
    const policyName = url.searchParams.get('policyName') ?? '';

    // Sign out the current user if we're transitioning with a different user
    const isTransitioning = Str.startsWith(url.pathname, Str.normalizeUrl(ROUTES.TRANSITION_BETWEEN_APPS));

    const shouldCreateFreePolicy = !isLoggingInAsNewUser && isTransitioning && exitTo === ROUTES.WORKSPACE_NEW;
    if (shouldCreateFreePolicy) {
        createWorkspaceWithPolicyDraftAndNavigateToIt(policyOwnerEmail, policyName, true, makeMeAdmin);
        return;
    }
    if (!isLoggingInAsNewUser && exitTo) {
        Navigation.waitForProtectedRoutes()
            .then(() => {
                Navigation.navigate(exitTo);
            })
            .then(endSignOnTransition);
    }
}

function redirectThirdPartyDesktopSignIn() {
    const currentUrl = getCurrentUrl();
    if (!currentUrl) {
        return;
    }
    const url = new URL(currentUrl);

    if (url.pathname === `/${ROUTES.GOOGLE_SIGN_IN}` || url.pathname === `/${ROUTES.APPLE_SIGN_IN}`) {
        Navigation.isNavigationReady().then(() => {
            Navigation.goBack();
            Navigation.navigate(ROUTES.DESKTOP_SIGN_IN_REDIRECT);
        });
    }
}

/**
 * @param shouldAuthenticateWithCurrentAccount Optional, indicates whether default authentication method (shortLivedAuthToken) should be used
 */
function beginDeepLinkRedirect(shouldAuthenticateWithCurrentAccount = true, initialRoute?: string) {
    // There's no support for anonymous users on desktop
    if (Session.isAnonymousUser()) {
        return;
    }

    // If the route that is being handled is a magic link, email and shortLivedAuthToken should not be attached to the url
    // to prevent signing into the wrong account
    if (!currentUserAccountID || !shouldAuthenticateWithCurrentAccount) {
        Browser.openRouteInDesktopApp();
        return;
    }

    const parameters: OpenOldDotLinkParams = {shouldRetry: false};

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK, parameters, {}).then((response) => {
        if (!response) {
            Log.alert(
                'Trying to redirect via deep link, but the response is empty. User likely not authenticated.',
                {response, shouldAuthenticateWithCurrentAccount, currentUserAccountID},
                true,
            );
            return;
        }

        Browser.openRouteInDesktopApp(response.shortLivedAuthToken, currentUserEmail, initialRoute);
    });
}

/**
 * @param shouldAuthenticateWithCurrentAccount Optional, indicates whether default authentication method (shortLivedAuthToken) should be used
 */
function beginDeepLinkRedirectAfterTransition(shouldAuthenticateWithCurrentAccount = true) {
    waitForSignOnTransitionToFinish().then(() => beginDeepLinkRedirect(shouldAuthenticateWithCurrentAccount));
}

function handleRestrictedEvent(eventName: string) {
    const parameters: HandleRestrictedEventParams = {eventName};

    API.write(WRITE_COMMANDS.HANDLE_RESTRICTED_EVENT, parameters);
}

function updateLastVisitedPath(path: string) {
    Onyx.merge(ONYXKEYS.LAST_VISITED_PATH, path);
}

function updateLastRoute(screen: string) {
    Onyx.set(ONYXKEYS.LAST_ROUTE, screen);
}

function setIsUsingImportedState(usingImportedState: boolean) {
    Onyx.set(ONYXKEYS.IS_USING_IMPORTED_STATE, usingImportedState);
}

function clearOnyxAndResetApp(shouldNavigateToHomepage?: boolean) {
    // The value of isUsingImportedState will be lost once Onyx is cleared, so we need to store it
    const isStateImported = isUsingImportedState;
    const sequentialQueue = PersistedRequests.getAll();
    Onyx.clear(KEYS_TO_PRESERVE).then(() => {
        // Network key is preserved, so when using imported state, we should stop forcing offline mode so that the app can re-fetch the network
        if (isStateImported) {
            setShouldForceOffline(false);
        }

        if (shouldNavigateToHomepage) {
            Navigation.navigate(ROUTES.HOME);
        }

        // Requests in a sequential queue should be called even if the Onyx state is reset, so we do not lose any pending data.
        // However, the OpenApp request must be called before any other request in a queue to ensure data consistency.
        // To do that, sequential queue is cleared together with other keys, and then it's restored once the OpenApp request is resolved.
        openApp().then(() => {
            if (!sequentialQueue || isStateImported) {
                return;
            }

            sequentialQueue.forEach((request) => {
                PersistedRequests.save(request);
            });
        });
    });
}

export {
    setLocale,
    setLocaleAndNavigate,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    redirectThirdPartyDesktopSignIn,
    openApp,
    reconnectApp,
    confirmReadyToOpenApp,
    handleRestrictedEvent,
    beginDeepLinkRedirect,
    beginDeepLinkRedirectAfterTransition,
    getMissingOnyxUpdates,
    finalReconnectAppAfterActivatingReliableUpdates,
    savePolicyDraftByNewWorkspace,
    createWorkspaceWithPolicyDraftAndNavigateToIt,
    updateLastVisitedPath,
    updateLastRoute,
    setIsUsingImportedState,
    clearOnyxAndResetApp,
    KEYS_TO_PRESERVE,
};
