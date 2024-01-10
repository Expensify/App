import {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import type {MoneyRequestField} from '@hooks/useViolations';
import useViolations from '@hooks/useViolations';
import ViolationsUtils from '@libs/ViolationsUtils';
import type {TranslationPaths} from '@src/languages/types';
import type {TransactionViolation} from '@src/types/onyx';

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

function useMoneyRequestViewErrors(params: UseMoneyRequestViewErrorsParams) {
    const {transactionViolations, hasErrors, isEmptyMerchant, transactionDate, transactionAmount} = params;

    const {translate} = useLocalize();
    const {canUseViolations} = usePermissions();
    const {getViolationsForField} = useViolations(transactionViolations);

    const getErrorForField = useCallback(
        (field: Exclude<MoneyRequestField, 'receipt'>) => {
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

            if (hasErrors && isError && translationPath) {
                return translate(translationPath);
            }

            if (canUseViolations) {
                const violations = getViolationsForField(field);
                return ViolationsUtils.getViolationTranslation(violations[0], translate);
            }

            return '';
        },
        [canUseViolations, hasErrors, getViolationsForField, translate, transactionAmount, isEmptyMerchant, transactionDate],
    );

    return {getErrorForField};
}

export default useMoneyRequestViewErrors;
