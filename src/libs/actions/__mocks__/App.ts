import Onyx from 'react-native-onyx';
import type * as AppImport from '@libs/actions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import createProxyForValue from '@src/utils/createProxyForValue';
import createTriggerPromise from '@src/utils/createTriggerPromise';

const AppImplementation: typeof AppImport = jest.requireActual('@libs/actions/App');
const {
    setLocale,
    setLocaleAndNavigate,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openProfile,
    redirectThirdPartyDesktopSignIn,
    openApp,
    reconnectApp,
    confirmReadyToOpenApp,
    handleRestrictedEvent,
    beginDeepLinkRedirect,
    beginDeepLinkRedirectAfterTransition,
    finalReconnectAppAfterActivatingReliableUpdates,
    savePolicyDraftByNewWorkspace,
    createWorkspaceWithPolicyDraftAndNavigateToIt,
    updateLastVisitedPath,
    KEYS_TO_PRESERVE,
} = AppImplementation;

const shouldGetMissingOnyxUpdatesUpToIdValue = {shouldGetMissingOnyxUpdatesUpToId: 2};
const shouldGetMissingOnyxUpdatesUpToIdProxy = createProxyForValue(shouldGetMissingOnyxUpdatesUpToIdValue, 'shouldGetMissingOnyxUpdatesUpToId');
const {shouldGetMissingOnyxUpdatesUpToId} = shouldGetMissingOnyxUpdatesUpToIdValue;

const {promise: getMissingOnyxUpdatesTriggeredPromise, trigger: getMissingOnyxUpdatesWasTriggered, resetPromise: resetGetMissingOnyxUpdatesTriggeredPromise} = createTriggerPromise();
const {promise: getMissingOnyxUpdatesDonePromise, trigger: getMissingOnyxUpdatesDone, resetPromise: resetGetMissingOnyxUpdatesDonePromise} = createTriggerPromise();

const getMissingOnyxUpdates = jest.fn(() => {
    resetGetMissingOnyxUpdatesDonePromise();
    getMissingOnyxUpdatesWasTriggered();

    const promise = Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, shouldGetMissingOnyxUpdatesUpToId);

    promise.finally(() => {
        getMissingOnyxUpdatesDone();
        resetGetMissingOnyxUpdatesTriggeredPromise();
    });

    return promise;
});

export {
    // Mocks
    shouldGetMissingOnyxUpdatesUpToIdProxy,
    getMissingOnyxUpdatesTriggeredPromise,
    getMissingOnyxUpdatesDonePromise,
    getMissingOnyxUpdates,

    // Actual App implementation
    setLocale,
    setLocaleAndNavigate,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openProfile,
    redirectThirdPartyDesktopSignIn,
    openApp,
    reconnectApp,
    confirmReadyToOpenApp,
    handleRestrictedEvent,
    beginDeepLinkRedirect,
    beginDeepLinkRedirectAfterTransition,
    finalReconnectAppAfterActivatingReliableUpdates,
    savePolicyDraftByNewWorkspace,
    createWorkspaceWithPolicyDraftAndNavigateToIt,
    updateLastVisitedPath,
    KEYS_TO_PRESERVE,
};
