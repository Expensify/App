import Onyx from 'react-native-onyx';
import type * as AppImport from '@libs/actions/App';
import type * as ApplyUpdatesImport from '@libs/actions/OnyxUpdateManager/utils/applyUpdates';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import createProxyForObject from '@src/utils/createProxyForObject';

const AppImplementation = jest.requireActual<typeof AppImport>('@libs/actions/App');
const {
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
    finalReconnectAppAfterActivatingReliableUpdates,
    savePolicyDraftByNewWorkspace,
    createWorkspaceWithPolicyDraftAndNavigateToIt,
    updateLastVisitedPath,
    KEYS_TO_PRESERVE,
} = AppImplementation;

type AppMockValues = {
    missingOnyxUpdatesToBeApplied: OnyxUpdatesFromServer[] | undefined;
};

type AppActionsMock = typeof AppImport & {
    getMissingOnyxUpdates: jest.Mock<Promise<Response[] | void[]>>;
    mockValues: AppMockValues;
};

const mockValues: AppMockValues = {
    missingOnyxUpdatesToBeApplied: undefined,
};
const mockValuesProxy = createProxyForObject(mockValues);

const ApplyUpdatesImplementation = jest.requireActual<typeof ApplyUpdatesImport>('@libs/actions/OnyxUpdateManager/utils/applyUpdates');
const getMissingOnyxUpdates = jest.fn((_fromID: number, toID: number) => {
    if (mockValuesProxy.missingOnyxUpdatesToBeApplied === undefined) {
        return Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, toID);
    }

    return ApplyUpdatesImplementation.applyUpdates(mockValuesProxy.missingOnyxUpdatesToBeApplied);
});

export {
    // Mocks
    getMissingOnyxUpdates,
    mockValuesProxy as mockValues,

    // Actual App implementation
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
    finalReconnectAppAfterActivatingReliableUpdates,
    savePolicyDraftByNewWorkspace,
    createWorkspaceWithPolicyDraftAndNavigateToIt,
    updateLastVisitedPath,
    KEYS_TO_PRESERVE,
};
export type {AppActionsMock};
