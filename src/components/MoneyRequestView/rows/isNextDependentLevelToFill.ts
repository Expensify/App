import {getTagArrayFromName} from '@libs/TransactionUtils';
import type {PolicyTagLists, Transaction} from '@src/types/onyx';

/**
 * Pure predicate for dependent-tag highlight: returns true iff `index` is the
 * first unfilled level (from left) in the dependent-tag chain. If all configured
 * levels are filled, returns false for every index. A gap (filled, empty, filled)
 * still highlights the first empty level only — never a level past a gap.
 */
function isNextDependentLevelToFill(transaction: Transaction | undefined, index: number, policyTagLists: Array<PolicyTagLists[keyof PolicyTagLists]>): boolean {
    const levelCount = policyTagLists.length;
    if (levelCount === 0 || index < 0 || index >= levelCount) {
        return false;
    }
    const tagParts = getTagArrayFromName(transaction?.tag ?? '');
    for (let i = 0; i < levelCount; i++) {
        const value = tagParts.at(i);
        if (!value) {
            return i === index;
        }
    }
    return false;
}

export default isNextDependentLevelToFill;
