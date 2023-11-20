import reject from 'lodash/reject';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {PolicyCategories, PolicyTags, Transaction, TransactionViolation} from '@src/types/onyx';
import possibleViolationsByField, {ViolationField} from './possibleViolationsByField';

const ViolationsUtils = {
    getViolationForField(transactionViolations: TransactionViolation[], field: ViolationField, translate: (key: string) => string): string[] {
        return transactionViolations.filter((violation) => possibleViolationsByField[field]?.includes(violation.name)).map((violation) => translate(violation.name));
    },

    getViolationsOnyxData(
        /** The transaction to check for policy violations. */
        transaction: Transaction,
        /** An array of existing transaction violations. */
        transactionViolations: TransactionViolation[],
        /** Indicates if the policy requires tags. */
        policyRequiresTags: boolean,
        /** Collection of policy tags and their enabled states. */
        policyTags: PolicyTags,
        /** Indicates if the policy requires categories. */
        policyRequiresCategories: boolean,
        /** Collection of policy categories and their enabled states. */
        policyCategories: PolicyCategories,
    ): {
        onyxMethod: string;
        key: string;
        value: TransactionViolation[];
    } {
        let newTransactionViolations = [...transactionViolations];

        if (policyRequiresCategories) {
            const categoryViolationExists = transactionViolations.some((violation) => violation.name === 'categoryOutOfPolicy');
            const categoryIsInPolicy = policyCategories[transaction.category]?.enabled;

            // Add 'categoryOutOfPolicy' violation if category is not in policy
            if (!categoryViolationExists && transaction.category && !categoryIsInPolicy) {
                newTransactionViolations.push({name: 'categoryOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // Remove 'missingCategory' violation if category is valid according to policy
            if (categoryIsInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'missingCategory'});
            }
        }

        if (policyRequiresTags) {
            // Add 'tagOutOfPolicy' violation if tag is not in policy
            const tagViolationExists = transactionViolations.some((violation) => violation.name === 'tagOutOfPolicy');
            const tagInPolicy = policyTags[transaction.tag]?.enabled;
            if (!tagViolationExists && transaction.tag && !tagInPolicy) {
                newTransactionViolations.push({name: 'tagOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // Remove 'missingTag' violation if tag is valid according to policy
            if (tagInPolicy) {
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
