import React, {useCallback, useState} from 'react';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomSubStepProps} from '@pages/settings/Wallet/InternationalDepositAccount/types';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const STEP_INDEXES = CONST.CORPAY_FIELDS.INDEXES.MAPPING;

function TermsAndConditionsLabel() {
    const {translate} = useLocalize();
    return (
        <Text>
            {translate('common.iAcceptThe')}
            <TextLink href={CONST.TERMS_URL}>{`${translate('common.addCardTermsOfService')}`}</TextLink>
        </Text>
    );
}

function Confirmation({onNext, onMove, formValues, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getDataAndGoToNextStep = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>) => {
        setIsSubmitting(true);
        BankAccounts.createCorpayBankAccount(values).then((response) => {
            setIsSubmitting(false);
            if (response?.jsonCode) {
                if (response.jsonCode === CONST.JSON_CODE.SUCCESS) {
                    onNext();
                }
            }
        });
    };

    const summaryItems = [
        {
            description: translate('common.country'),
            title: formValues.bankCountry,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.COUNTRY_SELECTOR);
            },
        },
        {
            description: translate('common.currency'),
            title: formValues.bankCurrency,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
        },
    ];

    // eslint-disable-next-line guard-for-in
    for (const fieldName in fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS]) {
        summaryItems.push({
            description:
                fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS][fieldName].label +
                (fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS][fieldName].isRequired ? '' : ` (${translate('common.optional')})`),
            title: formValues[fieldName],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
        });
    }

    // eslint-disable-next-line guard-for-in
    for (const fieldName in fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]) {
        summaryItems.push({
            description:
                fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE][fieldName].label +
                (fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE][fieldName].isRequired ? '' : ` (${translate('common.optional')})`),
            title: formValues[fieldName],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.ACCOUNT_TYPE);
            },
        });
    }

    // eslint-disable-next-line guard-for-in
    for (const fieldName in fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]) {
        summaryItems.push({
            description:
                fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION][fieldName].label +
                (fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION][fieldName].isRequired ? '' : ` (${translate('common.optional')})`),
            title: formValues[fieldName],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_INFORMATION);
            },
        });
    }

    // eslint-disable-next-line guard-for-in
    for (const fieldName in fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]) {
        summaryItems.push({
            description:
                fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION][fieldName].label +
                (fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION][fieldName].isRequired ? '' : ` (${translate('common.optional')})`),
            title: formValues[fieldName],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.ACCOUNT_HOLDER_INFORMATION);
            },
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

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('personalInfoStep.letsDoubleCheck')}</Text>
            {summaryItems.map(({description, title, shouldShowRightIcon, onPress}) => (
                <MenuItemWithTopDescription
                    key={`${title}_${description}`}
                    description={description}
                    title={title}
                    shouldShowRightIcon={shouldShowRightIcon}
                    onPress={onPress}
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
                isSubmitDisabled={isSubmitting}
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    aria-label={`${translate('common.iAcceptThe')} ${translate('common.addCardTermsOfService')}`}
                    inputID="acceptTerms"
                    LabelComponent={TermsAndConditionsLabel}
                    style={[styles.mt3]}
                />
            </FormProvider>
        </ScrollView>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
