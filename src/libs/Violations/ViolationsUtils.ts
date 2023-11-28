import reject from 'lodash/reject';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {PolicyCategories, PolicyTags, Transaction, TransactionViolation} from '@src/types/onyx';
const ViolationsUtils = {
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
            const hasCategoryViolation = Boolean(transactionViolations.some((violation) => Boolean(violation.name === 'categoryOutOfPolicy')));
            const hasMissingCategoryViolation = Boolean(transactionViolations.some((violation) => Boolean(violation.name === 'missingCategory')));

            const isCategoryInPolicy = Boolean(policyCategories[transaction.category]?.enabled);

            // Add 'categoryOutOfPolicy' violation if category is not in policy
            if (!hasCategoryViolation && transaction.category && !isCategoryInPolicy) {
                newTransactionViolations.push({name: 'categoryOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // remove 'categoryOutOfPolicy' violation if category is in policy
            if (hasCategoryViolation && transaction.category && isCategoryInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'categoryOutOfPolicy'});
            }

            // Remove 'missingCategory' violation if category is valid according to policy
            if (isCategoryInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'missingCategory'});
            }

            // Add missingCategory violation if category is required and not set
            if (!hasMissingCategoryViolation && isCategoryInPolicy && !transaction.category) {
                newTransactionViolations.push({name: 'missingCategory', type: 'violation', userMessage: ''});
            }
        }

        if (policyRequiresTags) {
            const hasTagViolation = Boolean(transactionViolations.some((violation) => violation.name === 'tagOutOfPolicy'));
            const isTagInPolicy = Boolean(policyTags[transaction.tag]?.enabled);
          
            // Add 'tagOutOfPolicy' violation if tag is not in policy
            if (!hasTagViolation && transaction.tag && !isTagInPolicy) {
                newTransactionViolations.push({name: 'tagOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // Remove 'missingTag' violation if tag is valid according to policy
            if (isTagInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'missingTag'});
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
