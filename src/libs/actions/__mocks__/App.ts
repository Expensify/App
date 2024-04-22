import Onyx from 'react-native-onyx';
import type * as AppImport from '@libs/actions/App';
import createTriggerPromise from '@src/../tests/utils/createTriggerPromise';
import ONYXKEYS from '@src/ONYXKEYS';
import createProxyForValue from '@src/utils/createProxyForValue';

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

const {
    initialPromises: initialGetMissingOnyxUpdatesTriggeredPromises,
    trigger: getMissingOnyxUpdatesWasTriggered,
    resetPromise: resetGetMissingOnyxUpdatesTriggered,
} = createTriggerPromise();

const mockValues = {
    getMissingOnyxUpdatesTriggered: initialGetMissingOnyxUpdatesTriggeredPromises,
};
const mockValuesProxy = createProxyForValue(mockValues);

const resetGetMissingOnyxUpdatesTriggeredPromise = () => {
    resetGetMissingOnyxUpdatesTriggered((newPromise, index) => {
        mockValuesProxy.getMissingOnyxUpdatesTriggered[index] = newPromise;
    });
};

const getMissingOnyxUpdates = jest.fn((_fromID: number, toID: number) => {
    getMissingOnyxUpdatesWasTriggered();

    const promise = Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, toID);

    promise.finally(() => {
        resetGetMissingOnyxUpdatesTriggeredPromise();
    });

    return promise;
});

export {
    // Mocks
    mockValuesProxy,
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
