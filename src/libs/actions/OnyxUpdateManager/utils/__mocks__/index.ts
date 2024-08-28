import type {DeferredUpdatesDictionary, DetectGapAndSplitResult} from '@libs/actions/OnyxUpdateManager/types';
import createProxyForObject from '@src/utils/createProxyForObject';
import type * as OnyxUpdateManagerUtilsImport from '..';
import {applyUpdates} from './applyUpdates';

const UtilsImplementation = jest.requireActual<typeof OnyxUpdateManagerUtilsImport>('@libs/actions/OnyxUpdateManager/utils');

type OnyxUpdateManagerUtilsMockValues = {
    onValidateAndApplyDeferredUpdates: ((clientLastUpdateID?: number) => Promise<void>) | undefined;
};

type OnyxUpdateManagerUtilsMock = typeof UtilsImplementation & {
    detectGapsAndSplit: jest.Mock<Promise<DetectGapAndSplitResult>, [updates: DeferredUpdatesDictionary, clientLastUpdateID?: number]>;
    validateAndApplyDeferredUpdates: jest.Mock<Promise<void>, [clientLastUpdateID?: number]>;
    mockValues: OnyxUpdateManagerUtilsMockValues;
};

const mockValues: OnyxUpdateManagerUtilsMockValues = {
    onValidateAndApplyDeferredUpdates: undefined,
};
const mockValuesProxy = createProxyForObject(mockValues);

const detectGapsAndSplit = jest.fn(UtilsImplementation.detectGapsAndSplit);

const validateAndApplyDeferredUpdates = jest.fn((clientLastUpdateID?: number) =>
    (mockValuesProxy.onValidateAndApplyDeferredUpdates === undefined ? Promise.resolve() : mockValuesProxy.onValidateAndApplyDeferredUpdates(clientLastUpdateID)).then(() =>
        UtilsImplementation.validateAndApplyDeferredUpdates(clientLastUpdateID),
    ),
);

export {applyUpdates, detectGapsAndSplit, validateAndApplyDeferredUpdates, mockValuesProxy as mockValues};
export type {OnyxUpdateManagerUtilsMock};
