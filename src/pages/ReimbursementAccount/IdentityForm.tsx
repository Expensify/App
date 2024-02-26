import {subYears} from 'date-fns';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import AddressForm from './AddressForm';

type IdentityFormProps = {
    /** Style for wrapping View */
    style?: StyleProp<ViewStyle>;

    /** Form values */
    values: any;

    /** Default values */
    defaultValues: any;

    /** Any errors that can arise from form validation */
    errors: Record<string, string>;

    /** The map for inputID of the inputs */
    inputKeys: any;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;
};

function IdentityForm({shouldSaveDraft = false, errors, values, inputKeys, defaultValues, style}: IdentityFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // dob field has multiple validations/errors, we are handling it temporarily like this.
    const dobErrorText = (errors?.dob ? 'bankAccount.error.dob' : '') || (errors?.dobAge ? 'bankAccount.error.age' : '');
    const identityFormInputKeys = ['firstName', 'lastName', 'dob', 'ssnLast4'];

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    return (
        <View style={style}>
            <View style={[styles.flexRow]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={inputKeys.firstName}
                        shouldSaveDraft={shouldSaveDraft}
                        label={`${translate('common.firstName')}`}
                        aria-label={translate('common.firstName')}
                        role={CONST.ROLE.PRESENTATION}
                        value={values.firstName}
                        defaultValue={defaultValues.firstName}
                        errorText={errors.firstName ? 'bankAccount.error.firstName' : ''}
                    />
                </View>
                <View style={[styles.flex2]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={inputKeys.lastName}
                        shouldSaveDraft={shouldSaveDraft}
                        label={`${translate('common.lastName')}`}
                        aria-label={translate('common.lastName')}
                        role={CONST.ROLE.PRESENTATION}
                        value={values.lastName}
                        defaultValue={defaultValues.lastName}
                        errorText={errors.lastName ? 'bankAccount.error.lastName' : ''}
                    />
                </View>
            </View>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={inputKeys.dob}
                shouldSaveDraft={shouldSaveDraft}
                label={`${translate('common.dob')}`}
                containerStyles={[styles.mt4]}
                placeholder={translate('common.dateFormat')}
                defaultValue={values.dob || defaultValues.dob}
                errorText={dobErrorText}
                minDate={minDate}
                maxDate={maxDate}
            />
            <InputWrapper
                InputComponent={TextInput}
                inputID={inputKeys.ssnLast4}
                shouldSaveDraft={shouldSaveDraft}
                label={`${translate('common.ssnLast4')}`}
                aria-label={translate('common.ssnLast4')}
                role={CONST.ROLE.PRESENTATION}
                containerStyles={[styles.mt4]}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                defaultValue={defaultValues.ssnLast4}
                errorText={errors.ssnLast4 ? 'bankAccount.error.ssnLast4' : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
            />
            <AddressForm
                inputKeys={_.omit(inputKeys, identityFormInputKeys)}
                shouldSaveDraft={shouldSaveDraft}
                translate={translate}
                streetTranslationKey="common.personalAddress"
                values={_.omit(values, identityFormInputKeys)}
                defaultValues={_.omit(defaultValues, identityFormInputKeys)}
                errors={errors}
            />
        </View>
    );
}

IdentityForm.displayName = 'IdentityForm';
export default IdentityForm;
