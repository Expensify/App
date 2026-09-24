import CurrencyPicker from '@components/CurrencyPicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import StatePicker from '@components/StatePicker';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import {useCurrencyListState} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useStepFormSubmit from '@hooks/useStepFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLocalCurrencies} from '@libs/BankAccountFields';
import {getValidationErrors} from '@libs/CollectDepositAccountUtils';
import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import type CustomSubPageProps from '@pages/settings/Wallet/CollectDepositAccount/types';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/CollectDepositAccountForm';

import React, {useCallback} from 'react';
import {View} from 'react-native';

function BankAccountDetails({isEditing, onNext, formValues, fieldsMap, fieldsType}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const bankCountry = formValues[INPUT_IDS.BANK_COUNTRY] ?? '';

    const localCurrencies = getLocalCurrencies(bankCountry);
    const isLocal = fieldsType === CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL;

    // Locally the country decides the options, so the choice only matters when it holds more than one. A wire has no
    // default to fall back on - countries with no mapping would otherwise submit an empty currency, which the API rejects.
    const hasCurrencyChoice = isLocal ? localCurrencies.length > 1 : true;

    // The picker only offers an exclude list, so locally everything the country has no mapping for is excluded.
    const {currencyList} = useCurrencyListState();
    const excludedCurrencies = isLocal ? Object.keys(currencyList).filter((currencyCode) => !localCurrencies.includes(currencyCode)) : [];

    // Editing holds the new values back until submit, so the draft is written here rather than on every keystroke.
    const handleSubmit = useStepFormSubmit<typeof ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM>({
        formId: ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM,
        fieldIds: Object.keys(fieldsMap),
        onNext,
        shouldSaveDraft: true,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM> =>
            getValidationErrors(values, fieldsMap, translate),
        [fieldsMap, translate],
    );

    const currencyHeaderContent = (
        <View style={styles.ph5}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('addPersonalBankAccount.currencyHeader')}</Text>
        </View>
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
        >
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.accountDetailsStepHeader')}</Text>
                {!!hasCurrencyChoice && (
                    <View style={[styles.mhn5]}>
                        <CurrencyPicker
                            label={translate('common.currency')}
                            value={formValues[INPUT_IDS.BANK_CURRENCY]}
                            onInputChange={(value: string) => {
                                setDraftValues(ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM, {[INPUT_IDS.BANK_CURRENCY]: value});
                            }}
                            headerContent={currencyHeaderContent}
                            excludeCurrencies={excludedCurrencies}
                            shouldShowFullPageOfflineView
                        />
                    </View>
                )}
                {Object.entries(fieldsMap).map(([fieldName, field]) => {
                    const isUSState = fieldName === INPUT_IDS.ADDRESS_STATE && bankCountry === CONST.COUNTRY.US;

                    return (
                        <View
                            style={isUSState ? [styles.mhn5, styles.pv1] : [styles.pv2]}
                            key={fieldName}
                        >
                            {isUSState ? (
                                <InputWrapper
                                    InputComponent={StatePicker}
                                    inputID={fieldName}
                                    shouldSaveDraft={!isEditing}
                                />
                            ) : (
                                <InputWrapper
                                    InputComponent={TextInput}
                                    inputID={fieldName}
                                    defaultValue={formValues[fieldName]}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    shouldSaveDraft={!isEditing}
                                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                                    {...getTextInputAutocorrectProps()}
                                />
                            )}
                        </View>
                    );
                })}
            </View>
        </FormProvider>
    );
}

BankAccountDetails.displayName = 'BankAccountDetails';

export default BankAccountDetails;
