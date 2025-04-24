import type {OnyxCollectionKey} from '@src/ONYXKEYS';

/**
 * Return the highest item in a numbered collection
 *
 * e.g. {1: '1', 2: '2', 3: '3'} -> '3'
 *
 * Use this only for collections that are numbered in other cases it will return the last item in the object not the highest
 */
function lastItem<T>(object: Record<string, T> = {}): T | undefined {
    const lastKey = Object.keys(object).pop() ?? 0;
    return object[lastKey];
}

/**
 * Used to grab the id for a particular collection item's key.
 * e.g. reportActions_1 -> 1
 */
function extractCollectionItemID(key: `${OnyxCollectionKey}${string}`): string {
    return key.split('_').at(1) ?? '';
}

export {lastItem, extractCollectionItemID};
