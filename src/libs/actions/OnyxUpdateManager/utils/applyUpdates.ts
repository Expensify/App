// We need to keep this in a separate file, so that we can mock this function in tests.
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import * as OnyxUpdates from '@userActions/OnyxUpdates';

// This function applies a list of updates to Onyx in order and resolves when all updates have been applied
const applyUpdates = (updates: DeferredUpdatesDictionary) => Promise.all(Object.values(updates).map((update) => OnyxUpdates.apply(update)));

// eslint-disable-next-line import/prefer-default-export
export {applyUpdates};
