import reject from 'lodash/reject';
import Onyx from 'react-native-onyx';
import {Phrase, PhraseParameters} from '@libs/Localize';
import {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {PolicyCategories, PolicyTags, Transaction, TransactionViolation} from '@src/types/onyx';

const ViolationsUtils = {
    /**
     * Checks a transaction for policy violations and returns an object with Onyx method, key and updated transaction
     * violations.
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
            if (!hasCategoryOutOfPolicyViolation && transaction.category && !isCategoryInPolicy) {
                newTransactionViolations.push({name: 'categoryOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // Remove 'categoryOutOfPolicy' violation if category is in policy
            if (hasCategoryOutOfPolicyViolation && transaction.category && isCategoryInPolicy) {
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
            const hasMissingTagViolation = transactionViolations.some((violation) => violation.name === 'missingTag');
            const isTagInPolicy = Boolean(policyTags[transaction.tag]?.enabled);

            // Add 'tagOutOfPolicy' violation if tag is not in policy
            if (!hasTagOutOfPolicyViolation && transaction.tag && !isTagInPolicy) {
                newTransactionViolations.push({name: 'tagOutOfPolicy', type: 'violation', userMessage: ''});
            }

            // Remove 'tagOutOfPolicy' violation if tag is in policy
            if (hasTagOutOfPolicyViolation && transaction.tag && isTagInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'tagOutOfPolicy'});
            }

            // Remove 'missingTag' violation if tag is valid according to policy
            if (hasMissingTagViolation && isTagInPolicy) {
                newTransactionViolations = reject(newTransactionViolations, {name: 'missingTag'});
            }

            // Add 'missingTag violation' if tag is required and not set
            if (!hasMissingTagViolation && !transaction.tag && policyRequiresTags) {
                newTransactionViolations.push({name: 'missingTag', type: 'violation', userMessage: ''});
            }
        }

        return {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: newTransactionViolations,
        };
    },
    /**
     * Gets the translated message for each violation type. Necessary because `translate` throws a type error if you
     * attempt to pass it template strings, or members of a string literal union that contains both function and string
     * members.
     *
     * The issue is with the type of {@link PhraseParameters} which is defined as
     *   `type PhraseParameters<T> = T extends (...args: infer A) => string ? A : never[];`
     *
     *  When a templated key is passed that _may_ include a translation key that resolves to  a `string` but could also
     * include  a translation key that resolves to  a `function`, the type returns `never`.
     *
     *  For instance:
     *   `translate('violations.missingCategory')` resolves to the  string 'Missing category',
     *   `translate('violations.overLimit') resolves to the function `({amount}: ViolationsOverLimitParams) => `Amount
     * over ${amount}/person limit`,
     *
     *  So then:
     *  ```
     *  const missingCategory = {key: 'missingCategory' as ViolationName , params:undefined};
     *  const overLimit = {key: }'overLimit' as ViolationName, params: {amount: 1};
     *
     *  //this works fine
     *  const missingCategoryTranslation = translate(`violations.${missingCategory.key}`)
     *  // this too
     *  const overLimitsTranslation = translate(`violations.${overLimit.key}`, overLimit.params)
     *
     * // but this will throw an error on the params arg  because the type checker can't sufficiently resolve the type.
     *  [missingCategory, overLimit].map({key, params}}=>params ? translate(`violations.${key}`, params) :
     * translate(`violations.$key}`)
     *
     * ```
     *  If you have only switch cases with params, and use a default case to catch the strings, it will throw an error.
     *
     * @param violation
     * @param translate
     */
    getViolationTranslation(violation: TransactionViolation, translate: <TKey extends TranslationPaths>(phraseKey: TKey, ...phraseParameters: PhraseParameters<Phrase<TKey>>) => string) {
        switch (violation.name) {
            case 'missingCategory':
                return translate('violations.missingCategory');
            case 'fieldRequired':
                return translate('violations.fieldRequired');
            case 'tagOutOfPolicy':
                return translate('violations.tagOutOfPolicy', {tagName: violation.data?.tagName});
            case 'missingTag':
                return translate('violations.missingTag', {tagName: violation.data?.tagName});
            case 'rter':
                return translate('violations.rter', {
                    brokenBankConnection: Boolean(violation.data?.brokenBankConnection),
                    isAdmin: Boolean(violation.data?.isAdmin),
                    email: violation.data?.email,
                    isTransactionOlderThan7Days: Boolean(violation.data?.isTransactionOlderThan7Days),
                    member: violation.data?.member,
                });
            case 'maxAge':
                return translate('violations.maxAge', {maxAge: violation.data?.maxAge ?? 0});
            case 'taxOutOfPolicy':
                return translate('violations.taxOutOfPolicy', {taxName: violation.data?.taxName});
            case 'billableExpense':
                return translate('violations.billableExpense');
            case 'futureDate':
                return translate('violations.futureDate');
            case 'modifiedAmount':
                return translate('violations.modifiedAmount');
            case 'conversionSurcharge':
                return translate('violations.conversionSurcharge', {surcharge: violation.data?.surcharge});
            case 'invoiceMarkup':
                return translate('violations.invoiceMarkup', {invoiceMarkup: violation.data?.invoiceMarkup});
            case 'autoReportedRejectedExpense':
                return translate('violations.autoReportedRejectedExpense', {
                    rejectedBy: violation.data?.rejectedBy ?? '',
                    rejectReason: violation.data?.rejectReason ?? '',
                });
            case 'missingComment':
                return translate('violations.missingComment');
            case 'taxRequired':
                return translate('violations.taxRequired');
            case 'smartscanFailed':
                return translate('violations.smartscanFailed');
            case 'taxAmountChanged':
                return translate('violations.taxAmountChanged');
            case 'receiptRequired':
                return translate('violations.receiptRequired', {
                    amount: violation.data?.amount ?? '0',
                    category: violation.data?.category ?? '',
                });
            case 'cashExpenseWithNoReceipt':
                return translate('violations.cashExpenseWithNoReceipt', {amount: violation.data?.amount ?? ''});
            case 'categoryOutOfPolicy':
                return translate('violations.categoryOutOfPolicy');
            case 'modifiedDate':
                return translate('violations.modifiedDate');
            case 'taxRateChanged':
                return translate('violations.taxRateChanged');
            case 'customUnitOutOfPolicy':
                return translate('violations.customUnitOutOfPolicy');
            case 'overLimit':
                return translate('violations.overLimit', {amount: violation.data?.amount ?? ''});
            case 'overLimitAttendee':
                return translate('violations.overLimitAttendee', {amount: violation.data?.amount ?? ''});
            case 'receiptNotSmartScanned':
                return translate('violations.receiptNotSmartScanned');
            case 'allTagLevelsRequired':
                return translate('violations.allTagLevelsRequired');
            case 'nonExpensiworksExpense':
                return translate('violations.nonExpensiworksExpense');
            case 'overAutoApprovalLimit':
                return translate('violations.overAutoApprovalLimit', {formattedLimitAmount: violation.data?.formattedLimitAmount ?? ''});
            case 'duplicatedTransaction':
                return translate('violations.duplicatedTransaction');
            case 'someTagLevelsRequired':
                return translate('violations.someTagLevelsRequired');
            case 'overCategoryLimit':
                return translate('violations.overCategoryLimit', {categoryLimit: violation.data?.categoryLimit ?? ''});
            case 'perDayLimit':
                return translate('violations.perDayLimit', {limit: violation.data?.limit ?? ''});
            default:
                // The interpreter should never get here because the switch cases should be exhaustive.
                //
                // If typescript is showing an error on the assertion below it means the switch statement is out of
                // sync with the `ViolationNames` type, and one or the other needs to be updated.
                //
                // The 'unnecessary' type assertion below is the guarantee of type safety for these translations.
                //
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                return violation.name as never;
        }
    },
};

export default ViolationsUtils;
