import type {OnyxEntry} from 'react-native-onyx';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import type {Transaction} from '@src/types/onyx';

/**
 * Returns the longest common dependent tag prefix for the provided transactions.
 * If there is no shared parent tag, returns undefined.
 */
function getCommonDependentTag(transactions: Array<OnyxEntry<Transaction> | undefined>): string | undefined {
    if (transactions.length === 0) {
        return;
    }

    const tagArrays = transactions.map((transaction) => getTagArrayFromName(transaction?.tag ?? ''));
    if (tagArrays.some((tagArray) => !tagArray.at(0))) {
        return;
    }

    const commonTags: string[] = [];
    const firstTagArray = tagArrays.at(0) ?? [];

    for (let index = 0; index < firstTagArray.length; index++) {
        const currentTag = firstTagArray.at(index);
        if (!currentTag) {
            break;
        }

        if (tagArrays.every((tagArray) => tagArray.at(index) === currentTag)) {
            commonTags.push(currentTag);
            continue;
        }

        break;
    }

    return commonTags.length > 0 ? commonTags.join(':') : undefined;
}

export default getCommonDependentTag;
