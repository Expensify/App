import React, {useCallback, useEffect} from 'react';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import type CustomSubStepProps from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {clearReimbursementAccountBankCreation, createCorpayBankAccountForWalletFlow, hideBankAccountErrors} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CorpayFormField} from '@src/types/onyx';

const STEP_INDEXES = CONST.CORPAY_FIELDS.INDEXES.MAPPING;

type MenuItemProps = {
    description: string;
    title: string;
    shouldShowRightIcon: boolean;
    onPress: () => void;
    interactive?: boolean;
    disabled?: boolean;
};

function TermsAndConditionsLabel() {
    const {translate} = useLocalize();
    return <RenderHTML html={translate('common.acceptTermsOfService')} />;
}

function Confirmation({onNext, onMove, formValues, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [corpayFields] = useOnyx(ONYXKEYS.CORPAY_FIELDS, {canBeMissing: false});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const {isOffline} = useNetwork();

    const getTitle = (field: CorpayFormField, fieldName: string) => {
        if ((field.valueSet ?? []).length > 0) {
            return field.valueSet?.find((type) => type.id === formValues[fieldName])?.text ?? formValues[fieldName];
        }

        if ((field?.links?.[0]?.content?.regions ?? []).length > 0) {
            return (field?.links?.[0]?.content?.regions ?? [])?.find(({code}) => code === formValues[fieldName])?.name ?? formValues[fieldName];
        }

        return formValues[fieldName];
    };

    const getDataAndGoToNextStep = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>) => {
        createCorpayBankAccountForWalletFlow({...formValues, ...values}, corpayFields?.classification ?? '', corpayFields?.destinationCountry ?? '', corpayFields?.preferredMethod ?? '');
    };

    useEffect(() => {
        if (reimbursementAccount?.isLoading === true || !!reimbursementAccount?.errors) {
            return;
        }

        if (reimbursementAccount?.isSuccess === true) {
            onNext();
            clearReimbursementAccountBankCreation();
        }
    }, [reimbursementAccount?.isLoading, reimbursementAccount?.isSuccess, reimbursementAccount?.errors, onNext]);

    // We want to clear errors every time we leave this page.
    // Therefore, we use useEffect, which clears errors when unmounted.
    // This is necessary so that when we close the BA flow or move on to another step, the error is cleared.
    // Additionally, we add error clearing to useEffect itself so that errors are cleared if this page opens after reloading.
    useEffect(() => {
        hideBankAccountErrors();
        return () => {
            hideBankAccountErrors();
        };
    }, []);

    const summaryItems: MenuItemProps[] = [
        {
            description: translate('common.country'),
            title: translate(`allCountries.${formValues.bankCountry}` as TranslationPaths),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.COUNTRY_SELECTOR);
            },
            disabled: isOffline,
        },
        {
            description: translate('common.currency'),
            title: `${formValues.bankCurrency} - ${getCurrencySymbol(formValues.bankCurrency)}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
            disabled: isOffline,
        },
    ];

    for (const [fieldName, field] of Object.entries(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS] ?? {})) {
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`),
            title: getTitle(field, fieldName),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
        });
    }

    for (const [fieldName, field] of Object.entries(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE] ?? {})) {
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`),
            title: getTitle(field, fieldName),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.ACCOUNT_TYPE);
            },
        });
    }

    for (const [fieldName, field] of Object.entries(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION] ?? {}).sort(
        ([field1], [field2]) => CONST.CORPAY_FIELDS.BANK_INFORMATION_FIELDS.indexOf(field1) - CONST.CORPAY_FIELDS.BANK_INFORMATION_FIELDS.indexOf(field2),
    )) {
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`),
            title: getTitle(field, fieldName),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_INFORMATION);
            },
        });
    }

    for (const [fieldName, field] of Object.entries(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION] ?? {}).sort(
        ([field1], [field2]) => CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(field1) - CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(field2),
    )) {
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`),
            title: fieldName === CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? translate(`allCountries.${formValues.bankCountry}` as TranslationPaths) : getTitle(field, fieldName),
            shouldShowRightIcon: fieldName !== CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY,
            onPress: () => {
                onMove(STEP_INDEXES.ACCOUNT_HOLDER_INFORMATION);
            },
            interactive: fieldName !== CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY,
        });
    }

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> = {};
            if (!values.acceptTerms) {
                errors.acceptTerms = translate('common.error.acceptTerms');
            }
            return errors;
        },
        [translate],
    );

    const errorMessage = getLatestErrorMessage(reimbursementAccount);

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('addPersonalBankAccount.confirmationStepHeader')}</Text>
            <Text style={[styles.mb6, styles.ph5, styles.textSupporting]}>{translate('addPersonalBankAccount.confirmationStepSubHeader')}</Text>
            {summaryItems.map(({description, title, shouldShowRightIcon, interactive, disabled, onPress}) => (
                <MenuItemWithTopDescription
                    key={`${title}_${description}`}
                    description={description}
                    title={title}
                    shouldShowRightIcon={shouldShowRightIcon}
                    onPress={onPress}
                    interactive={interactive}
                    disabled={disabled}
                />
            ))}
            <FormProvider
                formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
                validate={validate}
                onSubmit={getDataAndGoToNextStep}
                scrollContextEnabled
                submitButtonText={translate('common.confirm')}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline={false}
                isLoading={reimbursementAccount?.isLoading}
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    aria-label={`${translate('common.iAcceptThe')} ${translate('common.addCardTermsOfService')}`}
                    inputID="acceptTerms"
                    LabelComponent={TermsAndConditionsLabel}
                    style={[styles.mt3]}
                    shouldSaveDraft
                />
                {!!errorMessage && (
                    <FormHelpMessage
                        style={[styles.mt3, styles.mbn1]}
                        isError
                        message={errorMessage}
                    />
                )}
            </FormProvider>
        </ScrollView>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
