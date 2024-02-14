import {subYears} from 'date-fns';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import DatePicker from '@components/DatePicker';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import AddressForm from './AddressForm';

const propTypes = {
    /** Style for wrapping View */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

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
};

function IdentityForm(props) {
    const styles = useThemeStyles();
    // dob field has multiple validations/errors, we are handling it temporarily like this.
    const dobErrorText = (props.errors.dob ? 'bankAccount.error.dob' : '') || (props.errors.dobAge ? 'bankAccount.error.age' : '');
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
                        role={CONST.ROLE.PRESENTATION}
                        value={props.values.firstName}
                        defaultValue={props.defaultValues.firstName}
                        errorText={props.errors.firstName ? 'bankAccount.error.firstName' : ''}
                    />
                </View>
                <View style={[styles.flex2]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={props.inputKeys.lastName}
                        shouldSaveDraft={props.shouldSaveDraft}
                        label={`${props.translate('common.lastName')}`}
                        aria-label={props.translate('common.lastName')}
                        role={CONST.ROLE.PRESENTATION}
                        value={props.values.lastName}
                        defaultValue={props.defaultValues.lastName}
                        errorText={props.errors.lastName ? 'bankAccount.error.lastName' : ''}
                    />
                </View>
            </View>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={props.inputKeys.dob}
                shouldSaveDraft={props.shouldSaveDraft}
                label={`${props.translate('common.dob')}`}
                containerStyles={[styles.mt4]}
                placeholder={props.translate('common.dateFormat')}
                defaultValue={props.values.dob || props.defaultValues.dob}
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
                role={CONST.ROLE.PRESENTATION}
                containerStyles={[styles.mt4]}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                defaultValue={props.defaultValues.ssnLast4}
                errorText={props.errors.ssnLast4 ? 'bankAccount.error.ssnLast4' : ''}
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
            />
        </View>
    );
}

IdentityForm.propTypes = propTypes;
IdentityForm.defaultProps = defaultProps;
IdentityForm.displayName = 'IdentityForm';
export default IdentityForm;
