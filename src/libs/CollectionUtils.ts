import type {OnyxCollectionKey} from '@src/ONYXKEYS';

/**
 * Used to grab the id for a particular collection item's key.
 * e.g. reportActions_1 -> 1
 */
function extractCollectionItemID(key: `${OnyxCollectionKey}${string}`): string {
    return key.split('_').at(1) ?? '';
}

// eslint-disable-next-line import/prefer-default-export -- Utility file with a single named export; other helpers may be added here later.
export {extractCollectionItemID};
