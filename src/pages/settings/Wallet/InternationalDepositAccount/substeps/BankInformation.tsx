import React, {useCallback} from 'react';
import {View} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import useInternationalBankAccountFormSubmit from '@hooks/useInternationalBankAccountFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {CustomSubStepProps} from '@pages/settings/Wallet/InternationalDepositAccount/types';
import Text from '@src/components/Text';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CorpayFormField} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function getInputComponent(field: CorpayFormField) {
    if ((field.valueSet ?? []).length > 0) {
        return ValuePicker;
    }
    if (CONST.CORPAY_FIELDS.SPECIAL_LIST_REGION_KEYS.includes(field.id)) {
        return ValuePicker;
    }
    if (CONST.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
        return AddressSearch;
    }
    return TextInput;
}

function getItems(field: CorpayFormField) {
    if ((field.valueSet ?? []).length > 0) {
        return (field.valueSet ?? []).map(({id, text}) => ({value: id, label: text}));
    }
    return (field.links?.[0]?.content.regions ?? []).map(({name, code}) => ({value: code, label: name}));
}

function BankInformation({isEditing, onNext, formValues, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSubmit = useInternationalBankAccountFormSubmit({
        fieldIds: Object.keys(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]),
        onNext,
        shouldSaveDraft: true,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> => {
            const errors = {};
            const fields = fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION];
            for (const fieldName in fields) {
                if (!fieldName) {
                    // eslint-disable-next-line no-continue
                    continue;
                }
                if (fields[fieldName].isRequired && values[fieldName] === '') {
                    ErrorUtils.addErrorMessage(errors, fieldName, translate('common.error.fieldRequired'));
                }
                if (!values[fieldName]) {
                    fields[fieldName].validationRules.forEach((rule) => {
                        const regExpCheck = new RegExp(rule.regEx);
                        if (!regExpCheck.test(values[fieldName])) {
                            ErrorUtils.addErrorMessage(errors, fieldName, rule.errorMessage);
                        }
                    });
                }
            }
            return errors;
        },
        [fieldsMap, translate],
    );

    const getStyle = useCallback(
        (field: CorpayFormField) => {
            if ((field.valueSet ?? []).length > 0) {
                return [styles.mhn5, styles.pt2];
            }
            if (CONST.CORPAY_FIELDS.SPECIAL_LIST_REGION_KEYS.includes(field.id)) {
                return [styles.mhn5, styles.pt2];
            }
            if (CONST.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
                return [styles.mt5];
            }
            return [styles.mt5];
        },
        [styles.mhn5, styles.mt5, styles.pt2],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
        >
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('privatePersonalDetails.enterLegalName')}</Text>
                {Object.values(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]).map((field) => (
                    <View
                        style={getStyle(field)}
                        key={field.id}
                    >
                        <InputWrapper
                            InputComponent={getInputComponent(field)}
                            inputID={field.id}
                            defaultValue={formValues[field.id]}
                            label={field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`)}
                            items={getItems(field)}
                            renamedInputKeys={{
                                street: isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]?.bankAddressLine1) ? '' : 'bankAddressLine1',
                                street2: isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]?.bankAddressLine2) ? '' : 'bankAddressLine2',
                                city: isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]?.bankCity) ? '' : 'bankCity',
                                state: '',
                                zipCode: isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]?.bankPostal) ? '' : 'bankPostal',
                                country: '',
                                lat: '',
                                lng: '',
                            }}
                        />
                    </View>
                ))}
            </View>
        </FormProvider>
    );
}

BankInformation.displayName = 'BankInformation';

export default BankInformation;
