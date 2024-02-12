import reject from 'lodash/reject';
import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {Phrase, PhraseParameters} from '@libs/Localize';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories, PolicyTagList, Transaction, TransactionViolation} from '@src/types/onyx';

const ViolationsUtils = {
    /**
     * Checks a transaction for policy violations and returns an object with Onyx method, key and updated transaction
     * violations.
     */
    getViolationsOnyxData(
        updatedTransaction: Transaction,
        transactionViolations: TransactionViolation[],
        policyRequiresTags: boolean,
        policyTagList: PolicyTagList,
        policyRequiresCategories: boolean,
        policyCategories: PolicyCategories,
    ): OnyxUpdate {
        let newTransactionViolations = [...transactionViolations];

        if (policyRequiresCategories) {
            const hasCategoryOutOfPolicyViolation = transactionViolations.some((violation) => violation.name === 'categoryOutOfPolicy');
            const hasMissingCategoryViolation = transactionViolations.some((violation) => violation.name === 'missingCategory');
            const categoryKey = updatedTransaction.category;
            const isCategoryInPolicy = categoryKey ? policyCategories?.[categoryKey]?.enabled : false;

            // Add 'categoryOutOfPolicy' violation if category is not in policy
            if (!hasCategoryOutOfPolicyViolation && categoryKey && !isCategoryInPolicy) {
                newTransactionViolations.push({name: 'categoryOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // Remove 'categoryOutOfPolicy' violation if category is in policy
            if (hasCategoryOutOfPolicyViolation && updatedTransaction.category && isCategoryInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'categoryOutOfPolicy'});
            }

            // Remove 'missingCategory' violation if category is valid according to policy
            if (hasMissingCategoryViolation && isCategoryInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'missingCategory'});
            }

            // Add 'missingCategory' violation if category is required and not set
            if (!hasMissingCategoryViolation && policyRequiresCategories && !categoryKey) {
                newTransactionViolations.push({name: 'missingCategory', type: 'violation', userMessage: ''});
            }
        }

        if (policyRequiresTags) {
            const selectedTags = updatedTransaction.tag?.split(CONST.COLON) ?? [];
            const policyTagKeys = Object.keys(policyTagList);

            if (policyTagKeys.length === 0) {
                newTransactionViolations.push({
                    name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                    type: 'violation',
                    userMessage: '',
                });
            }

            policyTagKeys.forEach((key, index) => {
                const hasTagOutOfPolicyViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.TAG_OUT_OF_POLICY && violation.data?.tagName === key);
                const hasMissingTagViolation = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.MISSING_TAG && violation.data?.tagName === key);
                const selectedTag = selectedTags[index];
                const isTagInPolicy = Boolean(policyTagList[key]?.tags[selectedTag]?.enabled);

                // Add 'tagOutOfPolicy' violation if tag is not in policy
                if (!hasTagOutOfPolicyViolation && selectedTag && !isTagInPolicy) {
                    newTransactionViolations.push({
                        name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                        type: 'violation',
                        userMessage: '',
                        data: {
                            tagName: key,
                        },
                    });
                }

                // Remove 'tagOutOfPolicy' violation if tag is in policy
                if (hasTagOutOfPolicyViolation && selectedTag && isTagInPolicy) {
                    newTransactionViolations = reject(newTransactionViolations, {
                        name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                        data: {
                            tagName: key,
                        },
                    });
                }

                // Remove 'missingTag' violation if tag is valid according to policy
                if (hasMissingTagViolation && isTagInPolicy) {
                    newTransactionViolations = reject(newTransactionViolations, {
                        name: CONST.VIOLATIONS.MISSING_TAG,
                        data: {
                            tagName: key,
                        },
                    });
                }

                // Add 'missingTag violation' if tag is required and not set
                if (!hasMissingTagViolation && !selectedTag && policyRequiresTags) {
                    newTransactionViolations.push({
                        name: CONST.VIOLATIONS.MISSING_TAG,
                        type: 'violation',
                        userMessage: '',
                        data: {
                            tagName: key,
                        },
                    });
                }
            });
        }

        return {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${updatedTransaction.transactionID}`,
            value: newTransactionViolations,
        };
    },

    /**
     * Gets the translated message for each violation type.
     *
     * Necessary because `translate` throws a type error if you attempt to pass it a template strings, when the
     * possible values could be either translation keys that resolve to  strings or translation keys that resolve to
     * functions.
     */
    getViolationTranslation(
        violation: TransactionViolation,
        translate: <TKey extends TranslationPaths>(phraseKey: TKey, ...phraseParameters: PhraseParameters<Phrase<TKey>>) => string,
    ): string {
        switch (violation.name) {
            case 'allTagLevelsRequired':
                return translate('violations.allTagLevelsRequired');
            case 'autoReportedRejectedExpense':
                return translate('violations.autoReportedRejectedExpense', {
                    rejectedBy: violation.data?.rejectedBy ?? '',
                    rejectReason: violation.data?.rejectReason ?? '',
                });
            case 'billableExpense':
                return translate('violations.billableExpense');
            case 'cashExpenseWithNoReceipt':
                return translate('violations.cashExpenseWithNoReceipt', {amount: violation.data?.amount ?? ''});
            case 'categoryOutOfPolicy':
                return translate('violations.categoryOutOfPolicy');
            case 'conversionSurcharge':
                return translate('violations.conversionSurcharge', {surcharge: violation.data?.surcharge});
            case 'customUnitOutOfPolicy':
                return translate('violations.customUnitOutOfPolicy');
            case 'duplicatedTransaction':
                return translate('violations.duplicatedTransaction');
            case 'fieldRequired':
                return translate('violations.fieldRequired');
            case 'futureDate':
                return translate('violations.futureDate');
            case 'invoiceMarkup':
                return translate('violations.invoiceMarkup', {invoiceMarkup: violation.data?.invoiceMarkup});
            case 'maxAge':
                return translate('violations.maxAge', {maxAge: violation.data?.maxAge ?? 0});
            case 'missingCategory':
                return translate('violations.missingCategory');
            case 'missingComment':
                return translate('violations.missingComment');
            case 'missingTag':
                return translate('violations.missingTag', {tagName: violation.data?.tagName});
            case 'modifiedAmount':
                return translate('violations.modifiedAmount');
            case 'modifiedDate':
                return translate('violations.modifiedDate');
            case 'nonExpensiworksExpense':
                return translate('violations.nonExpensiworksExpense');
            case 'overAutoApprovalLimit':
                return translate('violations.overAutoApprovalLimit', {formattedLimitAmount: violation.data?.formattedLimitAmount ?? ''});
            case 'overCategoryLimit':
                return translate('violations.overCategoryLimit', {categoryLimit: violation.data?.categoryLimit ?? ''});
            case 'overLimit':
                return translate('violations.overLimit', {amount: violation.data?.amount ?? ''});
            case 'overLimitAttendee':
                return translate('violations.overLimitAttendee', {amount: violation.data?.amount ?? ''});
            case 'perDayLimit':
                return translate('violations.perDayLimit', {limit: violation.data?.limit ?? ''});
            case 'receiptNotSmartScanned':
                return translate('violations.receiptNotSmartScanned');
            case 'receiptRequired':
                return translate('violations.receiptRequired', {
                    amount: violation.data?.amount ?? '0',
                    category: violation.data?.category ?? '',
                });
            case 'rter':
                return translate('violations.rter', {
                    brokenBankConnection: violation.data?.brokenBankConnection ?? false,
                    isAdmin: violation.data?.isAdmin ?? false,
                    email: violation.data?.email,
                    isTransactionOlderThan7Days: !!violation.data?.isTransactionOlderThan7Days,
                    member: violation.data?.member,
                });
            case 'smartscanFailed':
                return translate('violations.smartscanFailed');
            case 'someTagLevelsRequired':
                return translate('violations.someTagLevelsRequired');
            case 'tagOutOfPolicy':
                return translate('violations.tagOutOfPolicy', {tagName: violation.data?.tagName});
            case 'taxAmountChanged':
                return translate('violations.taxAmountChanged');
            case 'taxOutOfPolicy':
                return translate('violations.taxOutOfPolicy', {taxName: violation.data?.taxName});
            case 'taxRateChanged':
                return translate('violations.taxRateChanged');
            case 'taxRequired':
                return translate('violations.taxRequired');
            default:
                // The interpreter should never get here because the switch cases should be exhaustive.
                // If typescript is showing an error on the assertion below it means the switch statement is out of
                // sync with the `ViolationNames` type, and one or the other needs to be updated.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                return violation.name as never;
        }
    },
};

export default ViolationsUtils;
