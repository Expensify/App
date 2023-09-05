/* eslint-disable */
import {OnyxCollectionKey} from '../ONYXKEYS';

/**
 * Return the highest item in a numbered collection
 *
 * e.g. {1: '1', 2: '2', 3: '3'} -> '3'
 */
function lastItem<T>(object: Record<number, T> = {}): T | undefined {
    const lastKey = +(Object.keys(object).pop() ?? 0);
    return object[lastKey];
}

/**
 * Used to grab the id for a particular collection item's key.
 * e.g. reportActions_1 -> 1
 */
function extractCollectionItemID(key: `${OnyxCollectionKey}${string}`) {
    return key.split('_')[1];
}

export {lastItem, extractCollectionItemID};
