// Issue - https://github.com/Expensify/App/issues/26719
import {getPathFromState} from '@react-navigation/native';
import {Str} from 'expensify-common';
import type {AppStateStatus} from 'react-native';
import {AppState} from 'react-native';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetMissingOnyxMessagesParams, HandleRestrictedEventParams, OpenAppParams, OpenOldDotLinkParams, ReconnectAppParams, UpdatePreferredLocaleParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as Browser from '@libs/Browser';
import DateUtils from '@libs/DateUtils';
import Log from '@libs/Log';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import {isPublicRoom, isValidReport} from '@libs/ReportUtils';
import {isLoggingInAsNewUser as isLoggingInAsNewUserSessionUtils} from '@libs/SessionUtils';
import {clearSoundAssetsCache} from '@libs/Sound';
import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type Locale from '@src/types/onyx/Locale';
import type {OnyxData} from '@src/types/onyx/Request';
import {setShouldForceOffline} from './Network';
import {getAll, rollbackOngoingRequest, save} from './PersistedRequests';
import {createDraftInitialWorkspace, createWorkspace, generatePolicyID} from './Policy/Policy';
import {isAnonymousUser} from './Session';

type PolicyParamsForOpenOrReconnect = {
    policyIDList: string[];
};

// `currentSessionData` is only used in actions, not during render. So `Onyx.connectWithoutView` is appropriate.
// If React components need this value in the future, use `useOnyx` instead.
let currentSessionData: {accountID?: number; email: string} = {
    accountID: undefined,
    email: '',
};
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentSessionData = {
            accountID: val?.accountID,
            email: val?.email ?? '',
        };
    },
});

// `isSidebarLoaded` is only used inside the event handler, not during render.
// `useOnyx` would trigger extra rerenders without affecting the View, so `Onyx.connectWithoutView` is used instead
let isSidebarLoaded: boolean | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_SIDEBAR_LOADED,
    callback: (val) => (isSidebarLoaded = val),
    initWithStoredValues: false,
});

// `isUsingImportedState` is only used in `clearOnyxAndResetApp`, not during render. So `Onyx.connectWithoutView` is appropriate.
// If React components need this value in the future, use `useOnyx` instead.
let isUsingImportedState: boolean | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_USING_IMPORTED_STATE,
    callback: (value) => {
        isUsingImportedState = value ?? false;
    },
});

// hasLoadedAppPromise is used in the "reconnectApp" function and is not directly associated with the View,
// so retrieving it using Onyx.connectWithoutView is correct.
let resolveHasLoadedAppPromise: () => void;
const hasLoadedAppPromise = new Promise<void>((resolve) => {
    resolveHasLoadedAppPromise = resolve;
});

// hasLoadedApp is used in the "reconnectApp" function and is not directly associated with the View,
// so retrieving it using Onyx.connectWithoutView is correct.
// If this variable is ever needed for use in React components, it should be retrieved using useOnyx.
let hasLoadedApp: boolean | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.HAS_LOADED_APP,
    callback: (value) => {
        hasLoadedApp = value;
        resolveHasLoadedAppPromise?.();
    },
});

// allReports is used in the "ForOpenOrReconnect" functions and is not directly associated with the View,
// so retrieving it using Onyx.connectWithoutView is correct.
// If this variable is ever needed for use in React components, it should be retrieved using useOnyx.
let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let preservedUserSession: OnyxTypes.Session | undefined;

// We called `connectWithoutView` here because it is not connected to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.PRESERVED_USER_SESSION,
    callback: (value) => {
        preservedUserSession = value;
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
    ONYXKEYS.PRESERVED_USER_SESSION,
    ONYXKEYS.HYBRID_APP,
    ONYXKEYS.SHOULD_USE_STAGING_SERVER,
    ONYXKEYS.IS_DEBUG_MODE_ENABLED,
];

/*
 * This listener allows you to reset the state stored in Onyx by changing the value under the ONYXKEYS.RESET_REQUIRED key.
 * It is only used in emergencies when the entire state requires clearing.
 *
 * It has no direct impact on the View, making the use of Onyx.connectWithoutView justified in this case.
 */
Onyx.connectWithoutView({
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

function setLocale(locale: Locale, currentPreferredLocale: Locale | undefined) {
    if (locale === currentPreferredLocale) {
        return;
    }

    // If user is not signed in, change just locally.
    if (!currentSessionData.accountID) {
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

    API.write(WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE, parameters, {optimisticData});
}

function setSidebarLoaded() {
    if (isSidebarLoaded) {
        return;
    }

    Onyx.set(ONYXKEYS.IS_SIDEBAR_LOADED, true);
    Performance.markEnd(CONST.TIMING.SIDEBAR_LOADED);
}

function setAppLoading(isLoading: boolean) {
    Onyx.set(ONYXKEYS.IS_LOADING_APP, isLoading);
}

/**
 * Saves the current navigation path to lastVisitedPath before app goes to background
 */
function saveCurrentPathBeforeBackground() {
    try {
        if (!navigationRef.isReady()) {
            return;
        }

        const currentState = navigationRef.getRootState();
        if (!currentState) {
            return;
        }

        const currentPath = getPathFromState(currentState, linkingConfig.config);

        if (currentPath) {
            Log.info('Saving current path before background', false, {currentPath});
            updateLastVisitedPath(currentPath);
        }
    } catch (error) {
        Log.warn('Failed to save current path before background', {error});
    }
}

let appState: AppStateStatus;
AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState.match(/inactive|background/) && appState === 'active') {
        Log.info('Flushing logs as app is going inactive', true, {}, true);
        saveCurrentPathBeforeBackground();
    }
    appState = nextAppState;
});

/**
 * Gets the policy params that are passed to the server in the OpenApp and ReconnectApp API commands. This includes a full list of policy IDs the client knows about as well as when they were last modified.
 */
function getPolicyParamsForOpenOrReconnect(): Promise<PolicyParamsForOpenOrReconnect> {
    return new Promise((resolve) => {
        isReadyToOpenApp.then(() => {
            // Using Onyx.connectWithoutView is appropriate here because the data retrieved is not directly bound to the View
            // and each time the getPolicyParamsForOpenOrReconnect function is called,
            // connectWithoutView will fetch the latest data from Onyx.
            const connection = Onyx.connectWithoutView({
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
function getOnyxDataForOpenOrReconnect(
    isOpenApp = false,
    isFullReconnect = false,
    shouldKeepPublicRooms = false,
    allReportsWithDraftComments?: Record<string, string | undefined>,
): OnyxData {
    const result: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                value: true,
            },
        ],
        successData: [],
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                value: false,
            },
        ],
        queueFlushedData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.HAS_LOADED_APP,
                value: true,
            },
        ],
    };

    if (isOpenApp) {
        result.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_APP,
            value: true,
        });

        result.finallyData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_APP,
            value: false,
        });
    }

    if (isOpenApp || isFullReconnect) {
        result.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
            value: DateUtils.getDBTime(),
        });
    }

    if (shouldKeepPublicRooms) {
        const publicReports = Object.values(allReports ?? {}).filter((report) => isPublicRoom(report) && isValidReport(report));
        publicReports?.forEach((report) => {
            result.successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
                value: {
                    ...report,
                },
            });
        });
    }

    // Find all reports that have a non-null draft comment and map them to their corresponding report objects from allReports
    // This ensures that any report with a draft comment is preserved in Onyx even if it doesn’t contain chat history
    const reportsWithDraftComments = Object.entries(allReportsWithDraftComments ?? {})
        .filter(([, value]) => value !== null)
        .map(([key]) => key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, ''))
        .map((reportID) => allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]);

    reportsWithDraftComments?.forEach((report) => {
        result.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                ...report,
            },
        });
    });

    return result;
}

/**
 * Fetches data needed for app initialization
 */
function openApp(shouldKeepPublicRooms = false, allReportsWithDraftComments?: Record<string, string | undefined>) {
    return getPolicyParamsForOpenOrReconnect().then((policyParams: PolicyParamsForOpenOrReconnect) => {
        const params: OpenAppParams = {enablePriorityModeFilter: true, ...policyParams};
        return API.writeWithNoDuplicatesConflictAction(WRITE_COMMANDS.OPEN_APP, params, getOnyxDataForOpenOrReconnect(true, undefined, shouldKeepPublicRooms, allReportsWithDraftComments));
    });
}

/**
 * Fetches data when the app reconnects to the network
 * @param [updateIDFrom] the ID of the Onyx update that we want to start fetching from
 */
function reconnectApp(updateIDFrom: OnyxEntry<number> = 0) {
    hasLoadedAppPromise.then(() => {
        if (!hasLoadedApp) {
            openApp();
            return;
        }
        console.debug(`[OnyxUpdates] App reconnecting with updateIDFrom: ${updateIDFrom}`);
        getPolicyParamsForOpenOrReconnect().then((policyParams) => {
            const params: ReconnectAppParams = policyParams;

            // Include the update IDs when reconnecting so that the server can send incremental updates if they are available.
            // Otherwise, a full set of app data will be returned.
            if (updateIDFrom) {
                params.updateIDFrom = updateIDFrom;
            }

            const isFullReconnect = !updateIDFrom;
            API.writeWithNoDuplicatesConflictAction(WRITE_COMMANDS.RECONNECT_APP, params, getOnyxDataForOpenOrReconnect(false, isFullReconnect, isSidebarLoaded));
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

        // It is SUPER BAD FORM to return promises from action methods.
        // DO NOT FOLLOW THIS PATTERN!!!!!
        // It was absolutely necessary in order to not break the app while migrating to the new reliable updates pattern. This method will be removed
        // as soon as we have everyone migrated to the reliableUpdate beta.
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP, params, getOnyxDataForOpenOrReconnect(false, true));
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
    // It was absolutely necessary in order to block OnyxUpdates while fetching the missing updates from the server or else the updates aren't applied in the proper order.
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

type CreateWorkspaceWithPolicyDraftParams = {
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    policyOwnerEmail?: string;
    policyName?: string;
    transitionFromOldDot?: boolean;
    makeMeAdmin?: boolean;
    backTo?: string;
    policyID?: string;
    currency?: string;
    file?: File;
    routeToNavigateAfterCreate?: Route;
    lastUsedPaymentMethod?: OnyxTypes.LastPaymentMethodType;
};

/**
 * Create a new draft workspace and navigate to it
 */
function createWorkspaceWithPolicyDraftAndNavigateToIt(params: CreateWorkspaceWithPolicyDraftParams) {
    const {
        introSelected,
        policyOwnerEmail = '',
        policyName = '',
        transitionFromOldDot = false,
        makeMeAdmin = false,
        backTo = '',
        policyID = '',
        currency,
        file,
        routeToNavigateAfterCreate,
        lastUsedPaymentMethod,
    } = params;

    const policyIDWithDefault = policyID || generatePolicyID();
    createDraftInitialWorkspace(introSelected, policyOwnerEmail, policyName, policyIDWithDefault, makeMeAdmin, currency, file);
    Navigation.isNavigationReady()
        .then(() => {
            if (transitionFromOldDot) {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
            }
            const routeToNavigate = routeToNavigateAfterCreate ?? ROUTES.WORKSPACE_INITIAL.getRoute(policyIDWithDefault, backTo);
            savePolicyDraftByNewWorkspace(policyIDWithDefault, policyName, policyOwnerEmail, makeMeAdmin, currency, file, lastUsedPaymentMethod);
            Navigation.navigate(routeToNavigate, {forceReplace: !transitionFromOldDot});
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
function savePolicyDraftByNewWorkspace(
    policyID?: string,
    policyName?: string,
    policyOwnerEmail = '',
    makeMeAdmin = false,
    currency = '',
    file?: File,
    lastUsedPaymentMethod?: OnyxTypes.LastPaymentMethodType,
) {
    createWorkspace({
        policyOwnerEmail,
        makeMeAdmin,
        policyName,
        policyID,
        engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
        currency,
        file,
        lastUsedPaymentMethod,
    });
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
 */
function setUpPoliciesAndNavigate(session: OnyxEntry<OnyxTypes.Session>, introSelected: OnyxEntry<OnyxTypes.IntroSelected>) {
    const currentUrl = getCurrentUrl();
    if (!session || !currentUrl?.includes('exitTo')) {
        endSignOnTransition();
        return;
    }

    const isLoggingInAsNewUser = !!session.email && isLoggingInAsNewUserSessionUtils(currentUrl, session.email);
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
        createWorkspaceWithPolicyDraftAndNavigateToIt({
            introSelected,
            policyOwnerEmail,
            policyName,
            transitionFromOldDot: true,
            makeMeAdmin,
        });
        return;
    }
    if (!isLoggingInAsNewUser && exitTo) {
        Navigation.waitForProtectedRoutes()
            .then(() => {
                Navigation.navigate(exitTo);
            })
            .then(endSignOnTransition);
    } else {
        endSignOnTransition();
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
function beginDeepLinkRedirect(shouldAuthenticateWithCurrentAccount = true, isMagicLink?: boolean, initialRoute?: string) {
    // There's no support for anonymous users on desktop
    if (isAnonymousUser()) {
        return;
    }

    // If the route that is being handled is a magic link, email and shortLivedAuthToken should not be attached to the url
    // to prevent signing into the wrong account
    if (!currentSessionData.accountID || !shouldAuthenticateWithCurrentAccount) {
        Browser.openRouteInDesktopApp();
        return;
    }

    const parameters: OpenOldDotLinkParams = {shouldRetry: false};

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK, parameters, {}).then((response) => {
        if (!response) {
            Log.alert(
                'Trying to redirect via deep link, but the response is empty. User likely not authenticated.',
                {response, shouldAuthenticateWithCurrentAccount, currentUserAccountID: currentSessionData.accountID},
                true,
            );
            return;
        }

        Browser.openRouteInDesktopApp(response.shortLivedAuthToken, currentSessionData.email, isMagicLink ? '/r' : initialRoute);
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

function setPreservedUserSession(session: OnyxTypes.Session) {
    Onyx.set(ONYXKEYS.PRESERVED_USER_SESSION, session);
}

function clearOnyxAndResetApp(shouldNavigateToHomepage?: boolean) {
    // The value of isUsingImportedState will be lost once Onyx is cleared, so we need to store it
    const isStateImported = isUsingImportedState;
    const sequentialQueue = getAll();

    rollbackOngoingRequest();
    Navigation.clearPreloadedRoutes();
    Onyx.clear(KEYS_TO_PRESERVE)
        .then(() => {
            // Network key is preserved, so when using imported state, we should stop forcing offline mode so that the app can re-fetch the network
            if (isStateImported) {
                setShouldForceOffline(false);
            }

            if (shouldNavigateToHomepage) {
                Navigation.navigate(ROUTES.HOME);
            }

            if (preservedUserSession) {
                Onyx.set(ONYXKEYS.SESSION, preservedUserSession);
                Onyx.set(ONYXKEYS.PRESERVED_USER_SESSION, null);
            }
        })
        .then(() => {
            // Requests in a sequential queue should be called even if the Onyx state is reset, so we do not lose any pending data.
            // However, the OpenApp request must be called before any other request in a queue to ensure data consistency.
            // To do that, sequential queue is cleared together with other keys, and then it's restored once the OpenApp request is resolved.
            openApp().then(() => {
                if (!sequentialQueue || isStateImported) {
                    return;
                }

                sequentialQueue.forEach((request) => {
                    save(request);
                });
            });
        });
    clearSoundAssetsCache();
}

/**
 * Clears a top-level Onyx value key by setting it to null.
 * This is used for ephemeral flags so they do not persist across reloads.
 */
function clearSupportalPermissionDenied() {
    // We intentionally set to null to keep key present but empty
    Onyx.set(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED, null);
}

/**
 * Shows a top-level modal informing that a supportal-auth user attempted an unauthorized command.
 */
function showSupportalPermissionDenied(payload: OnyxTypes.SupportalPermissionDenied) {
    Onyx.set(ONYXKEYS.SUPPORTAL_PERMISSION_DENIED, payload);
}

export {
    setLocale,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    redirectThirdPartyDesktopSignIn,
    openApp,
    setAppLoading,
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
    clearSupportalPermissionDenied,
    showSupportalPermissionDenied,
    setPreservedUserSession,
    KEYS_TO_PRESERVE,
};
