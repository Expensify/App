import type {AnyDeferredUpdatesDictionary, AnyDetectGapAndSplitResult} from '@libs/actions/OnyxUpdateManager/types';
import createProxyForObject from '@src/utils/createProxyForObject';
import type {applyUpdates as applyUpdatesType, detectGapsAndSplit as detectGapsAndSplitType, validateAndApplyDeferredUpdates as validateAndApplyDeferredUpdatesType} from '..';
import {applyUpdates} from './applyUpdates';

type OnyxUpdateManagerUtilsModule = {
    applyUpdates: typeof applyUpdatesType;
    detectGapsAndSplit: typeof detectGapsAndSplitType;
    validateAndApplyDeferredUpdates: typeof validateAndApplyDeferredUpdatesType;
};

const UtilsImplementation = jest.requireActual<OnyxUpdateManagerUtilsModule>('@libs/actions/OnyxUpdateManager/utils');

type OnyxUpdateManagerUtilsMockValues = {
    beforeValidateAndApplyDeferredUpdates: ((clientLastUpdateID?: number) => Promise<void>) | undefined;
};

type OnyxUpdateManagerUtilsMock = typeof UtilsImplementation & {
    detectGapsAndSplit: jest.Mock<Promise<AnyDetectGapAndSplitResult>, [updates: AnyDeferredUpdatesDictionary, clientLastUpdateID?: number]>;
    validateAndApplyDeferredUpdates: jest.Mock<Promise<void>, [clientLastUpdateID?: number]>;
    mockValues: OnyxUpdateManagerUtilsMockValues;
};

const mockValues: OnyxUpdateManagerUtilsMockValues = {
    beforeValidateAndApplyDeferredUpdates: undefined,
};
const mockValuesProxy = createProxyForObject(mockValues);

const detectGapsAndSplit = jest.fn(UtilsImplementation.detectGapsAndSplit);

const validateAndApplyDeferredUpdates = jest.fn((clientLastUpdateID?: number) => {
    if (mockValuesProxy.beforeValidateAndApplyDeferredUpdates === undefined) {
        return UtilsImplementation.validateAndApplyDeferredUpdates(clientLastUpdateID);
    }

    return mockValuesProxy.beforeValidateAndApplyDeferredUpdates(clientLastUpdateID).then(() => UtilsImplementation.validateAndApplyDeferredUpdates(clientLastUpdateID));
});

export {applyUpdates, detectGapsAndSplit, validateAndApplyDeferredUpdates, mockValuesProxy as mockValues};
export type {OnyxUpdateManagerUtilsMock};
