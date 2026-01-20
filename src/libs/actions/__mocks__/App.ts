import type * as AppImport from '@libs/actions/App';
import * as OnyxUpdates from '@userActions/OnyxUpdates';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import createProxyForObject from '@src/utils/createProxyForObject';

jest.mock('@libs/actions/OnyxUpdates');
jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates');

const AppImplementation = jest.requireActual<typeof AppImport>('@libs/actions/App');
const {
    setLocale,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openApp,
    reconnectApp,
    confirmReadyToOpenApp,
    handleRestrictedEvent,
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

const getMissingOnyxUpdates = jest.fn((updateIDFrom: number, updateIDTo: number) => {
    const updates = mockValuesProxy.missingOnyxUpdatesToBeApplied ?? [];
    if (updates.length === 0) {
        for (let i = updateIDFrom + 1; i <= updateIDTo; i++) {
            updates.push({
                lastUpdateID: i,
                previousUpdateID: i - 1,
            } as OnyxUpdatesFromServer);
        }
    }

    let chain = Promise.resolve();
    for (const update of updates) {
        chain = chain.then(() => {
            if (!OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID: Number(update.previousUpdateID)})) {
                return OnyxUpdates.apply(update).then(() => undefined);
            }

            OnyxUpdates.saveUpdateInformation(update);
            return Promise.resolve();
        });
    }

    return chain;
});

export {
    // Mocks
    getMissingOnyxUpdates,
    mockValuesProxy as mockValues,

    // Actual App implementation
    setLocale,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openApp,
    reconnectApp,
    confirmReadyToOpenApp,
    handleRestrictedEvent,
    finalReconnectAppAfterActivatingReliableUpdates,
    savePolicyDraftByNewWorkspace,
    createWorkspaceWithPolicyDraftAndNavigateToIt,
    updateLastVisitedPath,
    KEYS_TO_PRESERVE,
};
export type {AppActionsMock};
