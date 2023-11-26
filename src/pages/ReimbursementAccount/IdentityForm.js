import {subYears} from 'date-fns';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import InputWrapper from '@components/Form/InputWrapper';
import NewDatePicker from '@components/NewDatePicker';
import TextInput from '@components/TextInput';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import AddressForm from './AddressForm';

const propTypes = {
    /** Style for wrapping View */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Callback fired when a field changes. Passes args as {[fieldName]: val} */
    onFieldChange: PropTypes.func,

    /** Form values */
    values: PropTypes.shape({
        /** First name field */
        firstName: PropTypes.string,

        /** Last name field */
        lastName: PropTypes.string,

        /** Address street field */
        street: PropTypes.string,

        /** Address city field */
        city: PropTypes.string,

        /** Address state field */
        state: PropTypes.string,

        /** Address zip code field */
        zipCode: PropTypes.string,

        /** Date of birth field */
        dob: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),

        /** Last 4 digits of SSN */
        ssnLast4: PropTypes.string,
    }),

    /** Default values */
    defaultValues: PropTypes.shape({
        /** First name field */
        firstName: PropTypes.string,

        /** Last name field */
        lastName: PropTypes.string,

        /** Address street field */
        street: PropTypes.string,

        /** Address city field */
        city: PropTypes.string,

        /** Address state field */
        state: PropTypes.string,

        /** Address zip code field */
        zipCode: PropTypes.string,

        /** Date of birth field */
        dob: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),

        /** Last 4 digits of SSN */
        ssnLast4: PropTypes.string,
    }),

    /** Any errors that can arise from form validation */
    errors: PropTypes.objectOf(PropTypes.bool),

    /** The map for inputID of the inputs */
    inputKeys: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        dob: PropTypes.string,
        ssnLast4: PropTypes.string,
        street: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zipCode: PropTypes.string,
    }),

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,
};

const defaultProps = {
    style: {},
    values: {
        firstName: undefined,
        lastName: undefined,
        street: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
        dob: undefined,
        ssnLast4: undefined,
    },
    defaultValues: {
        firstName: undefined,
        lastName: undefined,
        street: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
        dob: undefined,
        ssnLast4: undefined,
    },
    errors: {},
    inputKeys: {
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        dob: '',
        ssnLast4: '',
    },
    shouldSaveDraft: false,
    onFieldChange: () => {},
};

function IdentityForm(props) {
    const styles = useThemeStyles();
    // dob field has multiple validations/errors, we are handling it temporarily like this.
    const dobErrorText = (props.errors.dob ? props.translate('bankAccount.error.dob') : '') || (props.errors.dobAge ? props.translate('bankAccount.error.age') : '');
    const identityFormInputKeys = ['firstName', 'lastName', 'dob', 'ssnLast4'];

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    return (
        <View style={props.style}>
            <View style={[styles.flexRow]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={props.inputKeys.firstName}
                        shouldSaveDraft={props.shouldSaveDraft}
                        label={`${props.translate('common.firstName')}`}
                        aria-label={props.translate('common.firstName')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        value={props.values.firstName}
                        defaultValue={props.defaultValues.firstName}
                        onChangeText={(value) => props.onFieldChange({firstName: value})}
                        errorText={props.errors.firstName ? props.translate('bankAccount.error.firstName') : ''}
                    />
                </View>
                <View style={[styles.flex2]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={props.inputKeys.lastName}
                        shouldSaveDraft={props.shouldSaveDraft}
                        label={`${props.translate('common.lastName')}`}
                        aria-label={props.translate('common.lastName')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        value={props.values.lastName}
                        defaultValue={props.defaultValues.lastName}
                        onChangeText={(value) => props.onFieldChange({lastName: value})}
                        errorText={props.errors.lastName ? props.translate('bankAccount.error.lastName') : ''}
                    />
                </View>
            </View>
            <NewDatePicker
                inputID={props.inputKeys.dob}
                shouldSaveDraft={props.shouldSaveDraft}
                label={`${props.translate('common.dob')}`}
                containerStyles={[styles.mt4]}
                placeholder={props.translate('common.dateFormat')}
                defaultValue={props.values.dob || props.defaultValues.dob}
                onInputChange={(value) => props.onFieldChange({dob: value})}
                errorText={dobErrorText}
                minDate={minDate}
                maxDate={maxDate}
            />
            <InputWrapper
                InputComponent={TextInput}
                inputID={props.inputKeys.ssnLast4}
                shouldSaveDraft={props.shouldSaveDraft}
                label={`${props.translate('common.ssnLast4')}`}
                aria-label={props.translate('common.ssnLast4')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                containerStyles={[styles.mt4]}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                defaultValue={props.defaultValues.ssnLast4}
                onChangeText={(value) => props.onFieldChange({ssnLast4: value})}
                errorText={props.errors.ssnLast4 ? props.translate('bankAccount.error.ssnLast4') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
            />
            <AddressForm
                inputKeys={_.omit(props.inputKeys, identityFormInputKeys)}
                shouldSaveDraft={props.shouldSaveDraft}
                translate={props.translate}
                streetTranslationKey="common.personalAddress"
                values={_.omit(props.values, identityFormInputKeys)}
                defaultValues={_.omit(props.defaultValues, identityFormInputKeys)}
                errors={props.errors}
                onFieldChange={props.onFieldChange}
            />
        </View>
    );
}

IdentityForm.propTypes = propTypes;
IdentityForm.defaultProps = defaultProps;
IdentityForm.displayName = 'IdentityForm';
export default IdentityForm;
