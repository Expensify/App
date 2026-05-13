import type {AnyDeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import * as OnyxUpdates from '@userActions/OnyxUpdates';
import createProxyForObject from '@src/utils/createProxyForObject';

jest.mock('@userActions/OnyxUpdates');

type ApplyUpdatesMockValues = {
    beforeApplyUpdates: ((updates: AnyDeferredUpdatesDictionary) => Promise<void>) | undefined;
};

type ApplyUpdatesMock = {
    applyUpdates: jest.Mock<Promise<[]>, [updates: AnyDeferredUpdatesDictionary]>;
    mockValues: ApplyUpdatesMockValues;
};

const mockValues: ApplyUpdatesMockValues = {
    beforeApplyUpdates: undefined,
};
const mockValuesProxy = createProxyForObject(mockValues);

const applyUpdates = jest.fn((updates: AnyDeferredUpdatesDictionary) => {
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
