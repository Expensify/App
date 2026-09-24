import ErrorMessageRow from '@components/ErrorMessageRow';
import FormProvider from '@components/Form/FormProvider';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues} from '@libs/actions/FormActions';
import {getSubmitParameters} from '@libs/CollectDepositAccountUtils';

import type CustomSubPageProps from '@pages/settings/Wallet/CollectDepositAccount/types';

import {clearPersonalBankAccount, clearPersonalBankAccountErrors, createCollectOnlyDepositAccount} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/CollectDepositAccountForm';

import React, {useCallback, useEffect, useRef} from 'react';

const STEP_INDEXES = CONST.COLLECT_DEPOSIT_ACCOUNT.INDEXES.MAPPING;

function Confirmation({onNext, onMove, formValues, fieldsMap, fieldsType}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);

    // Bank verification warns once about details it cannot confirm, so resubmitting the same ones accepts the warning.
    const lastRejectedDetails = useRef('');
    const submittedDetails = Object.keys(fieldsMap)
        .map((fieldName) => `${fieldName}:${formValues[fieldName] ?? ''}`)
        .join('/');

    const onSubmit = useCallback(() => {
        createCollectOnlyDepositAccount(getSubmitParameters(formValues, fieldsMap, fieldsType, lastRejectedDetails.current === submittedDetails));
    }, [fieldsMap, fieldsType, formValues, submittedDetails]);

    useEffect(() => {
        if (!personalBankAccount?.errors) {
            return;
        }
        lastRejectedDetails.current = submittedDetails;
    }, [personalBankAccount?.errors, submittedDetails]);

    useEffect(() => {
        if (personalBankAccount?.isLoading || !!personalBankAccount?.errors || !personalBankAccount?.shouldShowSuccess) {
            return;
        }
        onNext();
        clearDraftValues(ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM);
        clearPersonalBankAccount();
    }, [onNext, personalBankAccount?.errors, personalBankAccount?.isLoading, personalBankAccount?.shouldShowSuccess]);

    useEffect(() => {
        clearPersonalBankAccountErrors();
        return () => {
            clearPersonalBankAccountErrors();
        };
    }, []);

    const editCountry = useCallback(() => onMove(STEP_INDEXES.COUNTRY_SELECTOR, true), [onMove]);
    const editDetails = useCallback(() => onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS, true), [onMove]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM}
            onSubmit={onSubmit}
            submitButtonText={translate('common.confirm')}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline={false}
            isLoading={personalBankAccount?.isLoading}
            scrollContextEnabled
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('addPersonalBankAccount.confirmationStepHeader')}</Text>
            <Text style={[styles.mutedTextLabel, styles.ph5, styles.mb5]}>{translate('addPersonalBankAccount.confirmationStepSubHeader')}</Text>
            <MenuItemField
                name={translate('common.country')}
                value={formValues[INPUT_IDS.BANK_COUNTRY]}
                onPress={editCountry}
            />
            {Object.entries(fieldsMap).map(([fieldName, field]) => (
                <MenuItemField
                    key={fieldName}
                    name={field.label}
                    value={formValues[fieldName]}
                    onPress={editDetails}
                />
            ))}
            <ErrorMessageRow
                errors={personalBankAccount?.errors}
                errorRowStyles={[styles.mt3, styles.ph5]}
                onDismiss={clearPersonalBankAccountErrors}
            />
        </FormProvider>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
