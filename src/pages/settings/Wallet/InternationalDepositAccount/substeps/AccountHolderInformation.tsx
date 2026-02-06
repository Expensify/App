import React, {useCallback} from 'react';
import {View} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import useInternationalBankAccountFormSubmit from '@hooks/useInternationalBankAccountFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type CustomSubStepProps from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {getValidationErrors} from '@pages/settings/Wallet/InternationalDepositAccount/utils';
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
    if (field.id === CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY) {
        return PushRowWithModal;
    }
    return TextInput;
}

function getItems(field: CorpayFormField) {
    if ((field.valueSet ?? []).length > 0) {
        return (field.valueSet ?? []).map(({id, text}) => ({value: id, label: text}));
    }
    return (field.links?.[0]?.content.regions ?? []).map(({name, code}) => ({value: code, label: name}));
}

function AccountHolderInformation({isEditing, onNext, formValues, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSubmit = useInternationalBankAccountFormSubmit({
        fieldIds: Object.keys(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]),
        onNext,
        shouldSaveDraft: isEditing,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> => {
            return getValidationErrors(values, fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION], translate);
        },
        [fieldsMap, translate],
    );

    const getStyle = useCallback(
        (field: CorpayFormField, index: number) => {
            if ((field.valueSet ?? []).length > 0) {
                return [styles.mhn5, index === 0 ? styles.pb1 : styles.pv1];
            }
            if (CONST.CORPAY_FIELDS.SPECIAL_LIST_REGION_KEYS.includes(field.id)) {
                return [styles.mhn5, index === 0 ? styles.pb1 : styles.pv1];
            }
            if (CONST.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
                return [index === 0 ? styles.pb2 : styles.pv2];
            }
            if (field.id === CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY) {
                return [styles.mhn5, index === 0 ? styles.pb1 : styles.pv1];
            }
            return [index === 0 ? styles.pb2 : styles.pv2];
        },
        [styles.mhn5, styles.pb1, styles.pb2, styles.pv1, styles.pv2],
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
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.accountHolderInformationStepHeader')}</Text>
                {Object.values(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION])
                    .sort((a, b) => CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(a.id) - CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(b.id))
                    .map((field, index) => (
                        <View
                            style={getStyle(field, index)}
                            key={field.id}
                        >
                            <InputWrapper
                                InputComponent={getInputComponent(field)}
                                inputID={field.id}
                                defaultValue={formValues[field.id]}
                                label={field.label + (field.isRequired ? '' : ` (${translate('common.optional')})`)}
                                description={field.id === CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? field.label : undefined}
                                items={getItems(field)}
                                shouldAllowChange={field.id === CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? false : undefined}
                                optionsList={field.id === CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? CONST.ALL_COUNTRIES : undefined}
                                value={field.id === CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? formValues.bankCountry : undefined}
                                shouldSaveDraft={!isEditing}
                                renamedInputKeys={{
                                    street: isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]?.accountHolderAddress1) ? '' : 'accountHolderAddress1',
                                    street2: isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]?.accountHolderAddress2) ? '' : 'accountHolderAddress2',
                                    city: isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]?.accountHolderCity) ? '' : 'accountHolderCity',
                                    state: '',
                                    zipCode: isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]?.accountHolderPostal) ? '' : 'accountHolderPostal',
                                    country: '',
                                    lat: '',
                                    lng: '',
                                }}
                                forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                            />
                        </View>
                    ))}
            </View>
        </FormProvider>
    );
}

export default AccountHolderInformation;
