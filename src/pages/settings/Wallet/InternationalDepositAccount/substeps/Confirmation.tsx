import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import type {CustomSubStepProps} from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {createCorpayBankAccountForWalletFlow} from '@userActions/BankAccounts';
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
    return (
        <Text>
            {translate('common.iAcceptThe')}
            <TextLink href={CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>{`${translate('common.addCardTermsOfService')}`}</TextLink>
        </Text>
    );
}

function Confirmation({onNext, onMove, formValues, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [corpayFields] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
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
        setError('');
        setIsSubmitting(true);
        createCorpayBankAccountForWalletFlow(
            {...formValues, ...values},
            corpayFields?.classification ?? '',
            corpayFields?.destinationCountry ?? '',
            corpayFields?.preferredMethod ?? '',
        ).then((response) => {
            setIsSubmitting(false);
            if (response?.jsonCode) {
                if (response.jsonCode === CONST.JSON_CODE.SUCCESS) {
                    onNext();
                } else {
                    setError(response.message ?? '');
                }
            }
        });
    };

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

    Object.entries(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS] ?? {}).forEach(([fieldName, field]) => {
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`),
            title: getTitle(field, fieldName),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
        });
    });

    Object.entries(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE] ?? {}).forEach(([fieldName, field]) => {
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`),
            title: getTitle(field, fieldName),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.ACCOUNT_TYPE);
            },
        });
    });

    Object.entries(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION] ?? {})
        .sort(([field1], [field2]) => CONST.CORPAY_FIELDS.BANK_INFORMATION_FIELDS.indexOf(field1) - CONST.CORPAY_FIELDS.BANK_INFORMATION_FIELDS.indexOf(field2))
        .forEach(([fieldName, field]) => {
            summaryItems.push({
                description: field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`),
                title: getTitle(field, fieldName),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(STEP_INDEXES.BANK_INFORMATION);
                },
            });
        });

    Object.entries(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION] ?? {})
        .sort(([field1], [field2]) => CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(field1) - CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(field2))
        .forEach(([fieldName, field]) => {
            summaryItems.push({
                description: field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`),
                title: fieldName === CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? translate(`allCountries.${formValues.bankCountry}` as TranslationPaths) : getTitle(field, fieldName),
                shouldShowRightIcon: fieldName !== CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY,
                onPress: () => {
                    onMove(STEP_INDEXES.ACCOUNT_HOLDER_INFORMATION);
                },
                interactive: fieldName !== CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY,
            });
        });

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
                isLoading={isSubmitting}
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
                <FormHelpMessage
                    style={[styles.mt3, styles.mbn1]}
                    isError
                    message={error}
                />
            </FormProvider>
        </ScrollView>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
