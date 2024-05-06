import Onyx from 'react-native-onyx';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import ONYXKEYS from '@src/ONYXKEYS';
import createProxyForObject from '@src/utils/createProxyForObject';

let lastUpdateIDAppliedToClient = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (value) => (lastUpdateIDAppliedToClient = value ?? 0),
});

type ApplyUpdatesMockValues = {
    onApplyUpdates: ((updates: DeferredUpdatesDictionary) => Promise<void>) | undefined;
};

type ApplyUpdatesMock = {
    applyUpdates: jest.Mock<Promise<[]>, [updates: DeferredUpdatesDictionary]>;
    mockValues: ApplyUpdatesMockValues;
};

const mockValues: ApplyUpdatesMockValues = {
    onApplyUpdates: undefined,
};
const mockValuesProxy = createProxyForObject(mockValues);

const applyUpdates = jest.fn((updates: DeferredUpdatesDictionary) => {
    const lastUpdateIdFromUpdates = Math.max(...Object.keys(updates).map(Number));
    return (mockValuesProxy.onApplyUpdates === undefined ? Promise.resolve() : mockValuesProxy.onApplyUpdates(updates)).then(() =>
        Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, Math.max(lastUpdateIDAppliedToClient, lastUpdateIdFromUpdates)),
    );
});

export {applyUpdates, mockValuesProxy as mockValues};
export type {ApplyUpdatesMock};
