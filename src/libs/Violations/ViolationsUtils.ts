import reject from 'lodash/reject';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {PolicyCategories, PolicyTags, Transaction, TransactionViolation} from '@src/types/onyx';

const ViolationsUtils = {
    /**
     * Checks a transaction for policy violations and returns an object with Onyx method, key and updated transaction violations.
     */
    getViolationsOnyxData(
        transaction: Transaction,
        transactionViolations: TransactionViolation[],
        policyRequiresTags: boolean,
        policyTags: PolicyTags,
        policyRequiresCategories: boolean,
        policyCategories: PolicyCategories,
    ): {
        onyxMethod: string;
        key: string;
        value: TransactionViolation[];
    } {
        let newTransactionViolations = [...transactionViolations];

        if (policyRequiresCategories) {
            const hasCategoryOutOfPolicyViolation = transactionViolations.some((violation) => violation.name === 'categoryOutOfPolicy');
            const hasMissingCategoryViolation = transactionViolations.some((violation) => violation.name === 'missingCategory');
            const isCategoryInPolicy = Boolean(policyCategories[transaction.category]?.enabled);

            // Add 'categoryOutOfPolicy' violation if category is not in policy
            if (!hasCategoryViolation && transaction.category && !isCategoryInPolicy) {
                newTransactionViolations.push({name: 'categoryOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // Remove 'categoryOutOfPolicy' violation if category is in policy
            if (hasCategoryViolation && transaction.category && isCategoryInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'categoryOutOfPolicy'});
            }

            // Remove 'missingCategory' violation if category is valid according to policy
            if (hasMissingCategoryViolation && isCategoryInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'missingCategory'});
            }

            // Add 'missingCategory' violation if category is required and not set
            if (!hasMissingCategoryViolation && policyRequiresCategories && !transaction.category) {
                newTransactionViolations.push({name: 'missingCategory', type: 'violation', userMessage: ''});
            }
        }

        if (policyRequiresTags) {
            const hasTagOutOfPolicyViolation = transactionViolations.some((violation) => violation.name === 'tagOutOfPolicy');
            const isTagInPolicy = Boolean(policyTags[transaction.tag]?.enabled);
            const hasTag = Boolean(transaction.tag);

            // Add 'tagOutOfPolicy' violation if tag is not in policy
            if (!hasTagViolation && hasTag && !isTagInPolicy) {
                newTransactionViolations.push({name: 'tagOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // Remove 'missingTag' violation if tag is valid according to policy
            if (isTagInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'missingTag'});
            }

            // Add missingTag violation if tag is required and not set
            if (!hasTagViolation && !hasTag && policyRequiresTags) {
                newTransactionViolations.push({name: 'missingTag', type: 'violation', userMessage: ''});
            }
        }

        return {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: newTransactionViolations,
        };
    },
};

export default ViolationsUtils;
