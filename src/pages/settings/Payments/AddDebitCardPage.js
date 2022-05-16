import React, {Component} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import lodashEndsWith from 'lodash/endsWith';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import StatePicker from '../../../components/StatePicker';
import TextInput from '../../../components/TextInput';
import CONST from '../../../CONST';
import FormAlertWithSubmitButton from '../../../components/FormAlertWithSubmitButton';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../../libs/compose';
import AddressSearch from '../../../components/AddressSearch';
import * as ComponentUtils from '../../../libs/ComponentUtils';
import Form from '../../../components/Form';

const propTypes = {
    addDebitCardForm: PropTypes.shape({
        /** Error message from API call */
        error: PropTypes.string,

        /** Whether or not the form is submitting */
        submitting: PropTypes.bool,
    }),

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    addDebitCardForm: {
        error: '',
        submitting: false,
    },
};

class DebitCardPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nameOnCard: '',
            cardNumber: '',
            expirationDate: '',
            securityCode: '',
            addressStreet: '',
            addressState: '',
            addressZipCode: '',
            acceptedTerms: false,
            password: '',
            errors: {},
            shouldShowAlertPrompt: false,
        };

        this.requiredFields = [
            'nameOnCard',
            'cardNumber',
            'expirationDate',
            'securityCode',
            'addressStreet',
            'addressState',
            'addressZipCode',
            'password',
            'acceptedTerms',
        ];

        // Map a field to the key of the error's translation
        this.errorTranslationKeys = {
            nameOnCard: 'addDebitCardPage.error.invalidName',
            cardNumber: 'addDebitCardPage.error.debitCardNumber',
            expirationDate: 'addDebitCardPage.error.expirationDate',
            securityCode: 'addDebitCardPage.error.securityCode',
            addressStreet: 'addDebitCardPage.error.addressStreet',
            addressState: 'addDebitCardPage.error.addressState',
            addressZipCode: 'addDebitCardPage.error.addressZipCode',
            acceptedTerms: 'common.error.acceptedTerms',
            password: 'addDebitCardPage.error.password',
        };

        this.submit = this.submit.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);
        this.getErrorText = this.getErrorText.bind(this);
        this.addOrRemoveSlashToExpiryDate = this.addOrRemoveSlashToExpiryDate.bind(this);
    }

    /**
     * Make sure we reset the onyx values so old errors don't show if this form is displayed later
     */
    componentWillUnmount() {
        PaymentMethods.clearDebitCardFormErrorAndSubmit();
    }

    /**
     * @param {String} inputKey
     * @returns {String}
     */
    getErrorText(inputKey) {
        if (!lodashGet(this.state.errors, inputKey, false)) {
            return '';
        }

        return this.props.translate(this.errorTranslationKeys[inputKey]);
    }

    /**
     * @returns {Boolean}
     */
    validate(values) {
        const errors = {};

        if (!ValidationUtils.isValidCardName(values.nameOnCard)) {
            errors.nameOnCard = this.props.translate('addDebitCardPage.error.invalidName');
        }

        if (!ValidationUtils.isValidDebitCard(values.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = this.props.translate('addDebitCardPage.error.debitCardNumber');
        }

        if (!ValidationUtils.isValidExpirationDate(values.expirationDate)) {
            errors.expirationDate = this.props.translate('addDebitCardPage.error.expirationDate');
        }

        if (!ValidationUtils.isValidSecurityCode(values.securityCode)) {
            errors.securityCode = this.props.translate('addDebitCardPage.error.securityCode');
        }

        // if (!ValidationUtils.isValidAddress(this.state.addressStreet)) {
        //     errors.addressStreet = this.props.translate('addDebitCardPage.error.invalidName');
        // }

        // if (!ValidationUtils.isValidZipCode(this.state.addressZipCode)) {
        //     errors.addressZipCode = this.props.translate('addDebitCardPage.error.invalidName');
        // }

        // if (!this.state.addressState) {
        //     errors.addressState = this.props.translate('addDebitCardPage.error.invalidName');
        // }

        // if (_.isEmpty(this.state.password.trim())) {
        //     errors.password = this.props.translate('addDebitCardPage.error.invalidName');
        // }

        // if (!this.state.acceptedTerms) {
        //     errors.acceptedTerms = this.props.translate('addDebitCardPage.error.invalidName');
        // }

        return errors;
    }

    submit() {
        if (!this.validate()) {
            return;
        }
        PaymentMethods.addBillingCard(this.state);
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        this.setState(prevState => ({
            [inputKey]: value,
            errors: {
                ...prevState.errors,
                [inputKey]: false,
            },
        }));
    }

    /**
     * @param {String} inputExpiryDate
     */
    addOrRemoveSlashToExpiryDate(inputExpiryDate) {
        this.setState((prevState) => {
            let expiryDate = inputExpiryDate;

            // Remove the digit and '/' when backspace is pressed with expiry date ending with '/'
            if (inputExpiryDate.length < prevState.expirationDate.length
                && (((inputExpiryDate.length === 3 && lodashEndsWith(inputExpiryDate, '/'))
                  || (inputExpiryDate.length === 2 && lodashEndsWith(prevState.expirationDate, '/'))))) {
                expiryDate = inputExpiryDate.substring(0, inputExpiryDate.length - 1);
            } else if (inputExpiryDate.length === 2 && _.indexOf(inputExpiryDate, '/') === -1) {
                // An Expiry Date was added, so we should append a slash '/'
                expiryDate = `${inputExpiryDate}/`;
            } else if (inputExpiryDate.length > 2 && _.indexOf(inputExpiryDate, '/') === -1) {
                // Expiry Date with MM and YY without slash, hence adding slash(/)
                expiryDate = `${inputExpiryDate.slice(0, 2)}/${inputExpiryDate.slice(2)}`;
            }
            return {
                expirationDate: expiryDate,
                errors: {
                    ...prevState.errors,
                    expirationDate: false,
                },
            };
        });
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('addDebitCardPage.addADebitCard')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <Form
                       formID="test"
                       validate={this.validate}
                       onSubmit={() => {}}
                       submitButtonText="Save"
                       style={[styles.mh5, styles.mb5]}
                    >
                        <TextInput
                            inputID="nameOnCard"
                            label={this.props.translate('addDebitCardPage.nameOnCard')}
                        />
                        <TextInput
                            inputID="cardNumber"
                            label={this.props.translate('addDebitCardPage.debitCardNumber')}
                            containerStyles={[styles.mt4]}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        />
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex1, styles.mr2]}>
                                <TextInput
                                    inputID="expirationDate"
                                    label={this.props.translate('addDebitCardPage.expiration')}
                                    placeholder={this.props.translate('addDebitCardPage.expirationDate')}
                                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <TextInput
                                    inputID="securityCode"
                                    label={this.props.translate('addDebitCardPage.cvv')}
                                    maxLength={4}
                                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                />
                            </View>
                        </View>
                        <AddressSearch
                            inputID="address"
                            label={this.props.translate('addDebitCardPage.billingAddress')}
                            containerStyles={[styles.mt4]}
                            onInputChange={(values) => {
                                const renamedFields = {
                                    street: 'addressStreet',
                                    state: 'addressState',
                                    zipCode: 'addressZipCode',
                                };
                                _.each(values, (value, inputKey) => {
                                    if (inputKey === 'city') {
                                        return;
                                    }
                                    const renamedInputKey = lodashGet(renamedFields, inputKey, inputKey);
                                    this.clearErrorAndSetValue(renamedInputKey, value);
                                });
                            }}
                            errorText={this.getErrorText('addressStreet')}
                        />
                        <View style={[styles.flexRow, styles.mt4]}>
                            <View style={[styles.flex2, styles.mr2]}>
                                <TextInput
                                    label={this.props.translate('common.zip')}
                                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                    onChangeText={value => this.clearErrorAndSetValue('addressZipCode', value)}
                                    value={this.state.addressZipCode}
                                    errorText={this.getErrorText('addressZipCode')}
                                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <StatePicker
                                    onInputChange={value => this.clearErrorAndSetValue('addressState', value)}
                                    value={this.state.addressState}
                                    errorText={this.getErrorText('addressState')}
                                />
                            </View>
                        </View>
                        <View style={[styles.mt4]}>
                            <TextInput
                                label={this.props.translate('addDebitCardPage.expensifyPassword')}
                                onChangeText={password => this.clearErrorAndSetValue('password', password)}
                                value={this.state.password}
                                errorText={this.getErrorText('password')}
                                textContentType="password"
                                autoCompleteType={ComponentUtils.PASSWORD_AUTOCOMPLETE_TYPE}
                                secureTextEntry
                            />
                        </View>
                        <CheckboxWithLabel
                            inputID="acceptedTerms"
                            LabelComponent={() => (
                                <>
                                    <Text>{`${this.props.translate('common.iAcceptThe')}`}</Text>
                                    <TextLink href="https://use.expensify.com/terms">
                                        {`${this.props.translate('addDebitCardPage.expensifyTermsOfService')}`}
                                    </TextLink>
                                </>
                            )}
                            style={[styles.mt4, styles.mb5]}
                        />
                    </Form>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

DebitCardPage.propTypes = propTypes;
DebitCardPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        addDebitCardForm: {
            key: ONYXKEYS.ADD_DEBIT_CARD_FORM,
        },
    }),
    withLocalize,
)(DebitCardPage);
