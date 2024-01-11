import {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import type {MoneyRequestField} from '@hooks/useViolations';
import useViolations from '@hooks/useViolations';
import ViolationsUtils from '@libs/ViolationsUtils';
import type {TranslationPaths} from '@src/languages/types';
import type {TransactionViolation} from '@src/types/onyx';

// receipt can display more than one violation so we can't use the error prop
// so we exclude it from this type so it will throw an error if someone tries to
// use it
type FieldsWithErrors = Exclude<MoneyRequestField, 'receipt'>;

type FieldCheck = {
    isError: boolean;
    translationPath: TranslationPaths;
};

type FieldChecks = Partial<Record<FieldsWithErrors, FieldCheck>>;

type UseMoneyRequestViewErrorsParams = {
    transactionViolations: TransactionViolation[];
    hasErrors: boolean;
    isEmptyMerchant: boolean;
    transactionDate: string;
    transactionAmount: number;
};

function useMoneyRequestViewErrors({transactionViolations, hasErrors, isEmptyMerchant, transactionDate, transactionAmount}: UseMoneyRequestViewErrorsParams) {
    const {translate} = useLocalize();
    const {canUseViolations} = usePermissions();
    const {getViolationsForField} = useViolations(transactionViolations);
    const hasViolations = useCallback((field: MoneyRequestField) => canUseViolations && getViolationsForField(field).length > 0, [canUseViolations, getViolationsForField]);

    const getErrorForField = useCallback(
        (field: Exclude<MoneyRequestField, 'receipt'>) => {
            // Checks applied when creating a new money request
            const fieldChecks: FieldChecks = {
                amount: {
                    isError: transactionAmount === 0,
                    translationPath: 'common.error.enterAmount',
                },
                merchant: {
                    isError: isEmptyMerchant,
                    translationPath: 'common.error.enterMerchant',
                },
                date: {
                    isError: transactionDate === '',
                    translationPath: 'common.error.enterDate',
                },
            };

            const {isError, translationPath} = fieldChecks[field] ?? {};

            // Display form errors when first creating the money request
            if (hasErrors && isError && translationPath) {
                return translate(translationPath);
            }

            // Show violations if there are any
            if (canUseViolations && hasViolations(field)) {
                const violations = getViolationsForField(field);
                return ViolationsUtils.getViolationTranslation(violations[0], translate);
            }

            return '';
        },
        [transactionAmount, isEmptyMerchant, transactionDate, hasErrors, canUseViolations, hasViolations, translate, getViolationsForField],
    );

    return {getErrorForField};
}

export default useMoneyRequestViewErrors;
