import lodashGet from 'lodash/get';
import lodashUnset from 'lodash/unset';
import lodashCloneDeep from 'lodash/cloneDeep';
import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {
    View, KeyboardAvoidingView,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import ExpensifyText from '../../components/ExpensifyText';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import TextLink from '../../components/TextLink';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import FormScrollView from '../../components/FormScrollView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import * as Wallet from '../../libs/actions/Wallet';
import * as ValidationUtils from '../../libs/ValidationUtils';
import AddressSearch from '../../components/AddressSearch';
import DatePicker from '../../components/DatePicker';

const propTypes = {
    ...withLocalizePropTypes,

    /** Stores additional information about the additional details step e.g. loading state and errors with fields */
    walletAdditionalDetails: PropTypes.shape({
        /** Are we waiting for a response? */
        loading: PropTypes.bool,

        /** Which field needs attention? */
        errorFields: PropTypes.objectOf(PropTypes.bool),

        /** Any additional error message to show */
        additionalErrorMessage: PropTypes.string,
    }),
};

const defaultProps = {
    walletAdditionalDetails: {
        errorFields: [],
        loading: false,
        additionalErrorMessage: '',
    },
};

class AdditionalDetailsStep extends React.Component {
    constructor(props) {
        super(props);

        this.activateWallet = this.activateWallet.bind(this);

        this.requiredFields = [
            'legalFirstName',
            'legalLastName',
            'addressStreet',
            'addressCity',
            'addressState',
            'addressZip',
            'phoneNumber',
            'dob',
            'ssn',
        ];

        this.fieldNameTranslationKeys = {
            legalFirstName: 'additionalDetailsStep.legalFirstNameLabel',
            legalMiddleName: 'additionalDetailsStep.legalMiddleNameLabel',
            legalLastName: 'additionalDetailsStep.legalLastNameLabel',
            addressStreet: 'common.personalAddress',
            addressCity: 'common.city',
            addressState: 'common.state',
            addressZip: 'common.zip',
            phoneNumber: 'common.phoneNumber',
            dob: 'common.dob',
            ssn: 'common.ssnLast4',
        };

        this.state = {
            legalFirstName: lodashGet(props.walletAdditionalDetailsDraft, 'legalFirstName', ''),
            legalMiddleName: lodashGet(props.walletAdditionalDetailsDraft, 'legalMiddleName', ''),
            legalLastName: lodashGet(props.walletAdditionalDetailsDraft, 'legalLastName', ''),
            addressStreet: lodashGet(props.walletAdditionalDetailsDraft, 'addressStreet', ''),
            addressCity: lodashGet(props.walletAdditionalDetailsDraft, 'addressCity', ''),
            addressState: lodashGet(props.walletAdditionalDetailsDraft, 'addressState', ''),
            addressZip: lodashGet(props.walletAdditionalDetailsDraft, 'addressZip', ''),
            phoneNumber: lodashGet(props.walletAdditionalDetailsDraft, 'phoneNumber', ''),
            dob: lodashGet(props.walletAdditionalDetailsDraft, 'dob', ''),
            ssn: lodashGet(props.walletAdditionalDetailsDraft, 'ssn', ''),
        };
    }

    /**
     * @param {String} fieldName
     * @returns {String}
     */
    getErrorText(fieldName) {
        const errors = lodashGet(this.props.walletAdditionalDetails, 'errorFields', {});
        if (!errors[fieldName]) {
            return '';
        }

        return `${this.props.translate(this.fieldNameTranslationKeys[fieldName])} ${this.props.translate('common.isRequiredField')}.`;
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        // Reset server error messages when resubmitting form
        Wallet.setAdditionalDetailsErrorMessage('');

        const errors = {};

        if (!ValidationUtils.isValidPastDate(this.state.dob)) {
            errors.dob = true;
        }

        if (!ValidationUtils.isValidAddress(this.state.addressStreet)) {
            errors.addressStreet = true;
        }

        if (!ValidationUtils.isValidSSNLastFour(this.state.ssn)) {
            errors.ssn = true;
        }

        _.each(this.requiredFields, (requiredField) => {
            if (ValidationUtils.isRequiredFulfilled(this.state[requiredField])) {
                return;
            }

            errors[requiredField] = true;
        });

        Wallet.setAdditionalDetailsErrors(errors);
        return _.size(errors) === 0;
    }

    activateWallet() {
        if (!this.validate()) {
            return;
        }

        BankAccounts.activateWallet(CONST.WALLET.STEP.ADDITIONAL_DETAILS, {
            personalDetails: this.state,
        });
    }

    /**
     * @param {String} fieldName
     * @param {String} value
     */
    clearErrorAndSetValue(fieldName, value) {
        this.setState({[fieldName]: value});
        Wallet.updateAdditionalDetailsDraft({[fieldName]: value});
        const errors = lodashGet(this.props, 'walletAdditionalDetails.errorFields', {});
        if (!lodashGet(errors, fieldName, false)) {
            return;
        }

        const newErrors = lodashCloneDeep(errors);
        lodashUnset(newErrors, fieldName);
        Wallet.setAdditionalDetailsErrors(newErrors);
    }

    render() {
        const isErrorVisible = _.size(lodashGet(this.props, 'walletAdditionalDetails.errorFields', {})) > 0
            || lodashGet(this.props, 'walletAdditionalDetails.additionalErrorMessage', '').length > 0;
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView style={[styles.flex1]} behavior="height">
                    <HeaderWithCloseButton
                        title={this.props.translate('additionalDetailsStep.headerTitle')}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <View style={[styles.flex1]}>
                        <View style={[styles.ph5]}>
                            <ExpensifyText style={styles.mb3}>{this.props.translate('additionalDetailsStep.helpText')}</ExpensifyText>
                            <TextLink
                                style={styles.mb3}
                                href="https://use.expensify.com/usa-patriot-act"
                            >
                                {this.props.translate('additionalDetailsStep.helpLink')}
                            </TextLink>
                        </View>
                        <FormScrollView ref={el => this.form = el}>
                            <View style={[styles.mh5, styles.mb5]}>
                                <ExpensiTextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalFirstName)}
                                    onChangeText={val => this.clearErrorAndSetValue('legalFirstName', val)}
                                    value={this.state.legalFirstName}
                                    errorText={this.getErrorText('legalFirstName')}
                                />
                                <ExpensiTextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalMiddleName)}
                                    onChangeText={val => this.clearErrorAndSetValue('legalMiddleName', val)}
                                    value={this.state.legalMiddleName}
                                />
                                <ExpensiTextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalLastName)}
                                    onChangeText={val => this.clearErrorAndSetValue('legalLastName', val)}
                                    value={this.state.legalLastName}
                                    errorText={this.getErrorText('legalLastName')}
                                />
                                <View style={styles.mt4}>
                                    <AddressSearch
                                        label={this.props.translate(this.fieldNameTranslationKeys.addressStreet)}
                                        value={this.state.addressStreet}
                                        onChangeText={(fieldName, value) => {
                                            if (fieldName === 'addressZipCode') {
                                                this.clearErrorAndSetValue('addressZip', value);
                                                return;
                                            }

                                            this.clearErrorAndSetValue(fieldName, value);
                                        }}
                                        errorText={this.getErrorText('addressStreet')}
                                    />
                                    <ExpensifyText style={[styles.mutedTextLabel, styles.mt1]}>
                                        {this.props.translate('common.noPO')}
                                    </ExpensifyText>
                                </View>
                                <ExpensiTextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.phoneNumber)}
                                    onChangeText={val => this.clearErrorAndSetValue('phoneNumber', val)}
                                    value={this.state.phoneNumber}
                                    errorText={this.getErrorText('phoneNumber')}
                                />
                                <DatePicker
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.dob)}
                                    onChange={val => this.clearErrorAndSetValue('dob', val)}
                                    value={this.state.dob}
                                    placeholder={this.props.translate('common.dob')}
                                    errorText={this.getErrorText('dob')}
                                    maximumDate={new Date()}
                                />
                                <ExpensiTextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.ssn)}
                                    onChangeText={val => this.clearErrorAndSetValue('ssn', val)}
                                    value={this.state.ssn}
                                    errorText={this.getErrorText('ssn')}
                                    maxLength={4}
                                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                />
                            </View>
                            <FormAlertWithSubmitButton
                                isAlertVisible={isErrorVisible}
                                onSubmit={this.activateWallet}
                                onFixTheErrorsLinkPressed={() => {
                                    this.form.scrollTo({y: 0, animated: true});
                                }}
                                message={this.props.walletAdditionalDetails.additionalErrorMessage}
                                isLoading={this.props.walletAdditionalDetails.loading}
                                buttonText={this.props.translate('common.saveAndContinue')}
                            />
                        </FormScrollView>
                    </View>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

AdditionalDetailsStep.propTypes = propTypes;
AdditionalDetailsStep.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        walletAdditionalDetails: {
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
            initWithStoredValues: false,
        },
        walletAdditionalDetailsDraft: {
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS_DRAFT,
        },
    }),
)(AdditionalDetailsStep);
