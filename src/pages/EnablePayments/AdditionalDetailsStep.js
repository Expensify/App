import lodashGet from 'lodash/get';
import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {
    View, KeyboardAvoidingView,
} from 'react-native';
import IdologyQuestions from './IdologyQuestions';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import TextLink from '../../components/TextLink';
import TextInput from '../../components/TextInput';
import FormScrollView from '../../components/FormScrollView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import * as Wallet from '../../libs/actions/Wallet';
import * as ValidationUtils from '../../libs/ValidationUtils';
import AddressSearch from '../../components/AddressSearch';
import DatePicker from '../../components/DatePicker';
import FormHelper from '../../libs/FormHelper';
import FailedKYC from './FailedKYC';

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

        /** Questions returned by Idology */
        questions: PropTypes.arrayOf(PropTypes.shape({
            prompt: PropTypes.string,
            type: PropTypes.string,
            answer: PropTypes.arrayOf(PropTypes.string),
        })),

        /** ExpectID ID number related to those questions */
        idNumber: PropTypes.string,

        /** If we should show the FailedKYC view after the user submitted the form with a non fixable error */
        shouldShowFailedKYC: PropTypes.bool,

        /** If we should ask for the full SSN (when LexisNexis failed retrieving the first 5 from the last 4) */
        shouldAskForFullSSN: PropTypes.bool,
    }),
};

const defaultProps = {
    walletAdditionalDetails: {
        errorFields: {},
        loading: false,
        additionalErrorMessage: '',
        questions: [],
        idNumber: '',
        shouldShowFailedKYC: false,
        shouldAskForFullSSN: false,
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
            legalLastName: 'additionalDetailsStep.legalLastNameLabel',
            addressStreet: 'common.personalAddress',
            addressCity: 'common.city',
            addressState: 'common.state',
            addressZip: 'common.zip',
            phoneNumber: 'common.phoneNumber',
            dob: 'common.dob',
            ssn: 'common.ssnLast4',
            ssnFull9: 'common.ssnFull9',
        };

        this.state = {
            legalFirstName: lodashGet(props.walletAdditionalDetailsDraft, 'legalFirstName', ''),
            legalLastName: lodashGet(props.walletAdditionalDetailsDraft, 'legalLastName', ''),
            addressStreet: lodashGet(props.walletAdditionalDetailsDraft, 'addressStreet', ''),
            addressCity: lodashGet(props.walletAdditionalDetailsDraft, 'addressCity', ''),
            addressState: lodashGet(props.walletAdditionalDetailsDraft, 'addressState', ''),
            addressZip: lodashGet(props.walletAdditionalDetailsDraft, 'addressZip', ''),
            phoneNumber: lodashGet(props.walletAdditionalDetailsDraft, 'phoneNumber', ''),
            dob: lodashGet(props.walletAdditionalDetailsDraft, 'dob', ''),
            ssn: lodashGet(props.walletAdditionalDetailsDraft, 'ssn', ''),
        };

        this.formHelper = new FormHelper({
            errorPath: 'walletAdditionalDetails.errorFields',
            setErrors: Wallet.setAdditionalDetailsErrors,
        });
    }

    /**
     * @returns {Object}
     */
    getErrors() {
        return this.formHelper.getErrors(this.props);
    }

    /**
     * @param {String} fieldName
     * @returns {String}
     */
    getErrorText(fieldName) {
        if (!this.getErrors()[fieldName]) {
            return '';
        }

        return `${this.props.translate(this.fieldNameTranslationKeys[fieldName])} ${this.props.translate('common.isRequiredField')}.`;
    }

    /**
     * @param {String} path
     */
    clearError(path) {
        this.formHelper.clearError(this.props, path);
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

        if (!ValidationUtils.isValidSSNLastFour(this.state.ssn) && !ValidationUtils.isValidSSNFullNine(this.state.ssn)) {
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
        this.clearError(fieldName);
    }

    render() {
        if (this.props.walletAdditionalDetails.shouldShowFailedKYC) {
            return (
                <ScreenWrapper>
                    <KeyboardAvoidingView style={[styles.flex1]} behavior="height">
                        <HeaderWithCloseButton
                            title={this.props.translate('additionalDetailsStep.headerTitle')}
                            onCloseButtonPress={() => Navigation.dismissModal()}
                        />
                        <FailedKYC />
                    </KeyboardAvoidingView>
                </ScreenWrapper>
            );
        }

        if (!_.isEmpty(this.props.walletAdditionalDetails.questions)) {
            return (
                <ScreenWrapper>
                    <KeyboardAvoidingView style={[styles.flex1]} behavior="height">
                        <HeaderWithCloseButton
                            title={this.props.translate('additionalDetailsStep.headerTitle')}
                            onCloseButtonPress={() => Navigation.dismissModal()}
                            shouldShowBackButton
                            onBackButtonPress={() => Wallet.setAdditionalDetailsQuestions(null)}
                        />
                        <IdologyQuestions
                            questions={this.props.walletAdditionalDetails.questions}
                            idNumber={this.props.walletAdditionalDetails.idNumber}
                        />
                    </KeyboardAvoidingView>
                </ScreenWrapper>
            );
        }

        const isErrorVisible = _.size(this.getErrors()) > 0
            || lodashGet(this.props, 'walletAdditionalDetails.additionalErrorMessage', '').length > 0;
        const shouldAskForFullSSN = this.props.walletAdditionalDetails.shouldAskForFullSSN;

        return (
            <ScreenWrapper>
                <KeyboardAvoidingView style={[styles.flex1]} behavior="height">
                    <HeaderWithCloseButton
                        title={this.props.translate('additionalDetailsStep.headerTitle')}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <View style={[styles.flex1]}>
                        <View style={[styles.ph5]}>
                            <Text style={styles.mb3}>{this.props.translate('additionalDetailsStep.helpText')}</Text>
                            <TextLink
                                style={styles.mb3}
                                href="https://use.expensify.com/usa-patriot-act"
                            >
                                {this.props.translate('additionalDetailsStep.helpLink')}
                            </TextLink>
                        </View>
                        <FormScrollView ref={el => this.form = el}>
                            <View style={[styles.mh5, styles.mb5]}>
                                <TextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalFirstName)}
                                    onChangeText={val => this.clearErrorAndSetValue('legalFirstName', val)}
                                    value={this.state.legalFirstName}
                                    errorText={this.getErrorText('legalFirstName')}
                                />
                                <TextInput
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
                                        onChange={(values) => {
                                            const renamedFields = {
                                                street: 'addressStreet',
                                                state: 'addressState',
                                                zipCode: 'addressZip',
                                                city: 'addressCity',
                                            };
                                            _.each(values, (value, inputKey) => {
                                                const renamedInputKey = lodashGet(renamedFields, inputKey, inputKey);
                                                this.clearErrorAndSetValue(renamedInputKey, value);
                                            });
                                        }}
                                        errorText={this.getErrorText('addressStreet')}
                                    />
                                    <Text style={[styles.mutedTextLabel, styles.mt1]}>
                                        {this.props.translate('common.noPO')}
                                    </Text>

                                    {/** Once the user has started entering his address, show the other address fields (city, state, zip) */}
                                    {/** We'll autofill them when the user selects a full address from the google autocomplete */}
                                    {this.state.addressStreet && (
                                        <TextInput
                                            containerStyles={[styles.mt4]}
                                            label={this.props.translate(this.fieldNameTranslationKeys.addressCity)}
                                            onChangeText={val => this.clearErrorAndSetValue('addressCity', val)}
                                            value={this.state.addressCity}
                                            errorText={this.getErrorText('addressCity')}
                                        />
                                    )}
                                    {this.state.addressStreet && (
                                        <TextInput
                                            containerStyles={[styles.mt4]}
                                            label={this.props.translate(this.fieldNameTranslationKeys.addressState)}
                                            onChangeText={val => this.clearErrorAndSetValue('addressState', val)}
                                            value={this.state.addressState}
                                            errorText={this.getErrorText('addressState')}
                                        />
                                    )}
                                    {this.state.addressStreet && (
                                        <TextInput
                                            containerStyles={[styles.mt4]}
                                            label={this.props.translate(this.fieldNameTranslationKeys.addressZip)}
                                            onChangeText={val => this.clearErrorAndSetValue('addressZip', val)}
                                            value={this.state.addressZip}
                                            errorText={this.getErrorText('addressZip')}
                                        />
                                    )}
                                </View>
                                <TextInput
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
                                <TextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                                    onChangeText={val => this.clearErrorAndSetValue('ssn', val)}
                                    value={this.state.ssn}
                                    errorText={this.getErrorText('ssn')}
                                    maxLength={shouldAskForFullSSN ? 9 : 4}
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
