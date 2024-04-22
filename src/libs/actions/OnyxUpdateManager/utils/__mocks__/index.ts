import type * as UtilsImport from '..';

const UtilsImplementation: typeof UtilsImport = jest.requireActual('@libs/actions/OnyxUpdateManager/utils');

const detectGapsAndSplit = jest.fn(UtilsImplementation.detectGapsAndSplit);
const validateAndApplyDeferredUpdates = jest.fn(UtilsImplementation.validateAndApplyDeferredUpdates);

export {
    // Mocks
    detectGapsAndSplit,
    validateAndApplyDeferredUpdates,
};
