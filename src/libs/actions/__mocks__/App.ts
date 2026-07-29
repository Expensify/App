import type * as AppImport from '@libs/actions/App';

import * as OnyxUpdates from '@userActions/OnyxUpdates';

import type {OnyxUpdatesFromServer, Response as OnyxResponse} from '@src/types/onyx';
import createProxyForObject from '@src/utils/createProxyForObject';

import type {OnyxKey} from 'react-native-onyx';

jest.mock('@libs/actions/OnyxUpdates');
jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates');

const AppImplementation = jest.requireActual<typeof AppImport>('@libs/actions/App');
const {
    setLocale,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openApp,
    handleRestrictedEvent,
    finalReconnectAppAfterActivatingReliableUpdates,
    createWorkspaceWithPolicyDraftAndNavigateToIt,
    updateLastVisitedPath,
    KEYS_TO_PRESERVE,
} = AppImplementation;

type AppMockValues<TKey extends OnyxKey = never> = {
    missingOnyxUpdatesToBeApplied: Array<OnyxUpdatesFromServer<TKey>> | undefined;
    missingOnyxUpdatesResponse: OnyxResponse<never> | undefined;
};

type AppActionsMock<TKey extends OnyxKey = never> = typeof AppImport & {
    getMissingOnyxUpdates: jest.Mock<Promise<OnyxResponse<never> | undefined | void>, [updateIDFrom?: number, updateIDTo?: number | string]>;
    reconnectApp: jest.Mock<void, [number?]>;
    mockValues: AppMockValues<TKey>;
};

const mockValues: AppMockValues = {
    missingOnyxUpdatesToBeApplied: undefined,
    missingOnyxUpdatesResponse: undefined,
};
const mockValuesProxy = createProxyForObject(mockValues);

const reconnectApp = jest.fn();

const getMissingOnyxUpdates = jest.fn((updateIDFrom: number, updateIDTo: number) => {
    // When a response is set, the server answers without serving the requested range: nothing is applied.
    if (mockValuesProxy.missingOnyxUpdatesResponse !== undefined) {
        return Promise.resolve(mockValuesProxy.missingOnyxUpdatesResponse);
    }

    const updates = mockValuesProxy.missingOnyxUpdatesToBeApplied ?? [];
    if (updates.length === 0) {
        for (let i = updateIDFrom + 1; i <= updateIDTo; i++) {
            updates.push({
                lastUpdateID: i,
                previousUpdateID: i - 1,
            } as OnyxUpdatesFromServer<never>);
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
    reconnectApp,
    mockValuesProxy as mockValues,

    // Actual App implementation
    setLocale,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openApp,
    handleRestrictedEvent,
    finalReconnectAppAfterActivatingReliableUpdates,
    createWorkspaceWithPolicyDraftAndNavigateToIt,
    updateLastVisitedPath,
    KEYS_TO_PRESERVE,
};
export type {AppActionsMock};
