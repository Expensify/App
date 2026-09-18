import {deepEqual} from 'fast-equals';
import {useState} from 'react';

type KeyedItem = {keyForList?: string};

type AreItemsEqual<T> = (previous: T, next: T) => boolean;

/**
 * Builds the next array from `next`, reusing the object `previous` holds under the same `keyForList` whenever the two
 * are deep-equal. Returns `previous` itself when every position ends up with the very same object, so the array
 * reference is preserved too.
 */
function reconcileItemIdentity<T extends KeyedItem>(previous: T[], next: T[], areItemsEqual: AreItemsEqual<T> = deepEqual): T[] {
    const previousByKey = new Map<string, T>();
    for (const item of previous) {
        if (item.keyForList !== undefined) {
            previousByKey.set(item.keyForList, item);
        }
    }

    let isSameAsPrevious = previous.length === next.length;
    const result = next.map((item, index) => {
        const previousItem = item.keyForList === undefined ? undefined : previousByKey.get(item.keyForList);
        const resolved = previousItem !== undefined && (previousItem === item || areItemsEqual(previousItem, item)) ? previousItem : item;
        if (isSameAsPrevious && previous.at(index) !== resolved) {
            isSameAsPrevious = false;
        }
        return resolved;
    });

    return isSameAsPrevious ? previous : result;
}

/**
 * Keeps a row's object identity across rebuilds of the search list as long as the row's data did not change.
 *
 * The list is rebuilt from scratch whenever the snapshot changes, so one changed report hands every row a fresh
 * object, and every FlashList item re-renders even though only one of them has anything new to show. Rows are matched
 * by `keyForList` and compared with `areItemsEqual` (deep equality by default); an unchanged row gets its previous object back, and an array whose every row is
 * unchanged is returned as the previous array.
 *
 * Uses the "storing information from previous renders" pattern
 * (https://react.dev/reference/react/useState#storing-information-from-previous-renders): the conditional set below
 * re-runs the render once, and the reconciled array then reconciles to itself, which ends the loop.
 */
function useStableItemIdentity<T extends KeyedItem>(items: T[], areItemsEqual: AreItemsEqual<T> = deepEqual): T[] {
    const [stableItems, setStableItems] = useState(items);

    if (stableItems === items) {
        return items;
    }

    const reconciledItems = reconcileItemIdentity(stableItems, items, areItemsEqual);
    if (reconciledItems !== stableItems) {
        setStableItems(reconciledItems);
    }

    return reconciledItems;
}

export default useStableItemIdentity;
export {reconcileItemIdentity};
