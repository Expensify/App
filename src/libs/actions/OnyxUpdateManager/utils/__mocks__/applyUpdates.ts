import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import * as OnyxUpdates from '@userActions/OnyxUpdates';
import createProxyForObject from '@src/utils/createProxyForObject';

jest.mock('@userActions/OnyxUpdates');

type ApplyUpdatesMockValues = {
    beforeApplyUpdates: ((updates: DeferredUpdatesDictionary) => Promise<void>) | undefined;
};

type ApplyUpdatesMock = {
    applyUpdates: jest.Mock<Promise<[]>, [updates: DeferredUpdatesDictionary]>;
    mockValues: ApplyUpdatesMockValues;
};

const mockValues: ApplyUpdatesMockValues = {
    beforeApplyUpdates: undefined,
};
const mockValuesProxy = createProxyForObject(mockValues);

const applyUpdates = jest.fn((updates: DeferredUpdatesDictionary) => {
    const createChain = () => {
        let chain = Promise.resolve();
        for (const update of Object.values(updates)) {
            chain = chain.then(() => {
                return OnyxUpdates.apply(update).then(() => undefined);
            });
        }

        return chain;
    };

    if (mockValuesProxy.beforeApplyUpdates === undefined) {
        return createChain();
    }

    return mockValuesProxy.beforeApplyUpdates(updates).then(() => createChain());
});

export {applyUpdates, mockValuesProxy as mockValues};
export type {ApplyUpdatesMock};
