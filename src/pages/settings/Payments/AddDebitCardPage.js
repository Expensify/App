import React, {Component} from 'react';
import {
    View,
    ScrollView,
} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import ExpensifyText from '../../../components/ExpensifyText';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import ExpensiTextInput from '../../../components/ExpensiTextInput';
import CONST from '../../../CONST';
import FormAlertWithSubmitButton from '../../../components/FormAlertWithSubmitButton';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../../libs/compose';
import AddressSearch from '../../../components/AddressSearch';
import StatePicker from '../../../components/StatePicker';

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
            acceptedTerms: 'addDebitCardPage.error.acceptedTerms',
        };

        this.submit = this.submit.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);
        this.getErrorText = this.getErrorText.bind(this);
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
    validate() {
        const errors = {};
        if (_.isEmpty(this.state.nameOnCard.trim())) {
            errors.nameOnCard = true;
        }

        if (!ValidationUtils.isValidDebitCard(this.state.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = true;
        }

        if (!ValidationUtils.isValidExpirationDate(this.state.expirationDate)) {
            errors.expirationDate = true;
        }

        if (!ValidationUtils.isValidSecurityCode(this.state.securityCode)) {
            errors.securityCode = true;
        }

        if (!ValidationUtils.isValidAddress(this.state.addressStreet)
            || !this.state.addressState
            || !ValidationUtils.isValidZipCode(this.state.addressZipCode)) {
            errors.addressStreet = true;
        }

        if (!this.state.acceptedTerms) {
            errors.acceptedTerms = true;
        }

        const hasErrors = _.size(errors) > 0;
        this.setState({
            errors,
            shouldShowAlertPrompt: hasErrors,
        });
        return !hasErrors;
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
                    <ScrollView
                        style={[styles.w100, styles.flex1]}
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="handled"
                        ref={el => this.form = el}
                    >
                        <View style={[styles.mh5, styles.mb5]}>
                            <ExpensiTextInput
                                label={this.props.translate('addDebitCardPage.nameOnCard')}
                                onChangeText={nameOnCard => this.clearErrorAndSetValue('nameOnCard', nameOnCard)}
                                value={this.state.nameOnCard}
                                errorText={this.getErrorText('nameOnCard')}
                            />
                            <ExpensiTextInput
                                label={this.props.translate('addDebitCardPage.debitCardNumber')}
                                containerStyles={[styles.mt4]}
                                onChangeText={cardNumber => this.clearErrorAndSetValue('cardNumber', cardNumber)}
                                value={this.state.cardNumber}
                                errorText={this.getErrorText('cardNumber')}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            />
                            <View style={[styles.flexRow, styles.mt4]}>
                                <View style={[styles.flex1, styles.mr2]}>
                                    <ExpensiTextInput
                                        label={this.props.translate('addDebitCardPage.expiration')}
                                        placeholder={this.props.translate('addDebitCardPage.expirationDate')}
                                        onChangeText={expirationDate => this.clearErrorAndSetValue('expirationDate', expirationDate)}
                                        value={this.state.expirationDate}
                                        errorText={this.getErrorText('expirationDate')}
                                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                                    />
                                </View>
                                <View style={[styles.flex1]}>
                                    <ExpensiTextInput
                                        label={this.props.translate('addDebitCardPage.cvv')}
                                        onChangeText={securityCode => this.clearErrorAndSetValue('securityCode', securityCode)}
                                        value={this.state.securityCode}
                                        errorText={this.getErrorText('securityCode')}
                                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                    />
                                </View>
                            </View>
                            {!this.state.manualAddress && (
                                <>
                                    <AddressSearch
                                        label={this.props.translate('addDebitCardPage.billingAddress')}
                                        containerStyles={[styles.mt4]}
                                        value={this.state.addressStreet}
                                        onChangeText={(fieldName, value) => this.clearErrorAndSetValue(fieldName, value)}
                                        errorText={this.getErrorText('addressStreet')}
                                    />
                                    <ExpensifyText
                                        style={[styles.textMicroSupporting, styles.pt2]}
                                    >
                                        {this.props.translate('common.cantFindAddress')}
                                        <TextLink
                                            style={[styles.textMicro]}
                                            onPress={() => this.setState({manualAddress: true})}
                                        >
                                            {this.props.translate('common.enterManually')}
                                        </TextLink>
                                    </ExpensifyText>
                                </>
                            )}
                            {this.state.manualAddress && (
                                <>
                                    <ExpensiTextInput
                                        label={this.props.translate('addDebitCardPage.billingAddress')}
                                        containerStyles={[styles.mt4]}
                                        onChangeText={value => this.clearErrorAndSetValue('addressStreet', value)}
                                        value={this.state.addressStreet}
                                        errorText={this.getErrorText('addressStreet')}
                                    />
                                    <View style={[styles.flexRow, styles.mt4]}>
                                        <View style={[styles.flex2, styles.mr2]}>
                                            <ExpensiTextInput
                                                label={this.props.translate('common.city')}
                                                onChangeText={value => this.clearErrorAndSetValue('addressCity', value)}
                                                value={this.state.addressCity}
                                                errorText={this.getErrorText('addressCity')}
                                            />
                                        </View>
                                        <View style={[styles.flex1]}>
                                            <StatePicker
                                                onChange={value => this.clearErrorAndSetValue('addressState', value)}
                                                value={this.state.addressState}
                                                hasError={Boolean(this.getErrorText('addressState'))}
                                            />
                                        </View>
                                    </View>
                                    <ExpensiTextInput
                                        label={this.props.translate('common.zip')}
                                        containerStyles={[styles.mt4]}
                                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                                        onChangeText={value => this.clearErrorAndSetValue('addressZipCode', value)}
                                        value={this.state.addressZipCode}
                                        errorText={this.getErrorText('addressZipCode')}
                                    />
                                </>
                            )}
                            <CheckboxWithLabel
                                isChecked={this.state.acceptedTerms}
                                onPress={() => {
                                    this.setState(prevState => ({
                                        acceptedTerms: !prevState.acceptedTerms,
                                        errors: {
                                            ...prevState.errors,
                                            acceptedTerms: false,
                                        },
                                    }));
                                }}
                                LabelComponent={() => (
                                    <>
                                        <ExpensifyText>{`${this.props.translate('common.iAcceptThe')}`}</ExpensifyText>
                                        <TextLink href="https://use.expensify.com/terms">
                                            {`${this.props.translate('addDebitCardPage.expensifyTermsOfService')}`}
                                        </TextLink>
                                    </>
                                )}
                                style={[styles.mt4, styles.mb4]}
                                errorText={this.getErrorText('acceptedTerms')}
                                hasError={Boolean(this.state.errors.acceptedTerms)}
                            />
                        </View>
                        {!_.isEmpty(this.props.addDebitCardForm.error) && (
                            <View style={[styles.mh5, styles.mb5]}>
                                <ExpensifyText style={[styles.formError]}>
                                    {this.props.addDebitCardForm.error}
                                </ExpensifyText>
                            </View>
                        )}
                        <FormAlertWithSubmitButton
                            isAlertVisible={this.state.shouldShowAlertPrompt}
                            buttonText={this.props.translate('common.save')}
                            onSubmit={this.submit}
                            onFixTheErrorsLinkPressed={() => {
                                this.form.scrollTo({y: 0, animated: true});
                            }}
                            isLoading={this.props.addDebitCardForm.submitting}
                        />
                    </ScrollView>
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
