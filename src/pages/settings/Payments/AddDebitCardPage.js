import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import {
    View,
    ScrollView,
} from 'react-native';
import lodashGet from 'lodash/get';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../components/ScreenWrapper';
import TextInputWithLabel from '../../../components/TextInputWithLabel';
import styles from '../../../styles/styles';
import StatePicker from '../../../components/StatePicker';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import {addBillingCard} from '../../../libs/actions/PaymentMethods';
import Button from '../../../components/Button';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import FixedFooter from '../../../components/FixedFooter';
import _ from 'underscore';
import {
    isValidAddress, isValidExpirationDate, isValidZipCode, isValidDebitCard, isValidSecurityCode,
} from '../../../libs/ValidationUtils';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import ROUTES from '../../../ROUTES';
import ExpensiTextInput from '../../../components/ExpensiTextInput';

const propTypes = {
    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
};

class DebitCardPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nameOnCard: '',
            cardNumber: '',
            expirationDate: '',
            securityCode: '',
            billingAddress: '',
            city: '',
            selectedState: '',
            zipCode: '',
            acceptedTerms: false,
            isAddingCard: false,
            errors: {},
        };

        this.requiredFields = [
            'nameOnCard',
            'cardNumber',
            'expirationDate',
            'securityCode',
            'billingAddress',
            'city',
            'selectedState',
            'zipCode',
            'acceptedTerms',
        ];

        // Map a field to the key of the error's translation
        this.errorTranslationKeys = {
            nameOnCard: 'addDebitCardPage.error.invalidName',
            cardNumber: 'addDebitCardPage.error.debitCardNumber',
            expirationDate: 'addDebitCardPage.error.expirationDate',
            securityCode: 'addDebitCardPage.error.securityCode',
            billingAddress: 'addDebitCardPage.error.address',
            city: 'addDebitCardPage.error.addressCity',
            selectedState: 'addDebitCardPage.error.addressState',
            zipCode: 'addDebitCardPage.error.zipCode',
            acceptedTerms: 'addDebitCardPage.error.acceptedTerms',
        };

        this.toggleTermsOfService = this.toggleTermsOfService.bind(this);
        this.handleExpirationInput = this.handleExpirationInput.bind(this);
        this.handleCardNumberInput = this.handleCardNumberInput.bind(this);
        this.submit = this.submit.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);
        this.getErrorText = this.getErrorText.bind(this);
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
        if (this.state.nameOnCard.length !== 4) {
            errors.nameOnCard = true;
        }

        if (!isValidDebitCard(this.state.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = true;
        }

        if (!isValidExpirationDate(this.state.expirationDate)) {
            errors.expirationDate = true;
        }

        if (!isValidSecurityCode(this.state.securityCode)) {
            errors.securityCode = true;
        }

        if (!isValidAddress(this.state.billingAddress)) {
            errors.billingAddress = true;
        }

        if (this.state.city === '') {
            errors.city = true;
        }

        if (this.state.selectedState === '') {
            errors.selectedState = true;
        }

        if (!isValidZipCode(this.state.zipCode)) {
            errors.zipCode = true;
        }

        if (!this.state.acceptedTerms) {
            errors.acceptedTerms = true;
        }

        this.setState({errors});
        return _.size(errors) === 0;
    }

    submit() {
        if (!this.validate()) {
            return;
        }
        this.setState({isAddingCard: true});
        addBillingCard(this.state);
    }

    toggleTermsOfService() {
        this.setState(prevState => ({acceptedTerms: !prevState.acceptedTerms}));
    }

    handleExpirationInput(expirationDate) {
        let newExpirationDate = expirationDate;
        const isErasing = expirationDate.length < this.state.expirationDate.length;
        if (expirationDate.length === 2 && !isErasing) {
            newExpirationDate = `${expirationDate}/`;
        }
        this.setState({expirationDate: newExpirationDate});
    }

    handleCardNumberInput(newCardNumber) {
        if (/^[0-9]{0,16}$/.test(newCardNumber)) {
            this.setState({cardNumber: newCardNumber});
        }
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        this.setState({[inputKey]: value});
        this.state.errors[inputKey] = false;
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('addDebitCardPage.addADebitCard')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENTS)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <ExpensiTextInput
                            label={this.props.translate('addDebitCardPage.nameOnCard')}
                            onChangeText={nameOnCard => this.clearErrorAndSetValue('nameOnCard', nameOnCard)}
                            value={this.state.nameOnCard}
                            errorText={this.getErrorText('nameOnCard')}
                        />
                        <TextInputWithLabel
                            label={this.props.translate('addDebitCardPage.debitCardNumber')}
                            placeholder={this.props.translate('addDebitCardPage.debitCardNumber')}
                            keyboardType="number-pad"
                            containerStyles={[styles.flex1, styles.mb2]}
                            onChangeText={cardNumber => this.handleCardNumberInput(cardNumber)}
                            value={this.state.cardNumber}
                        />
                        <View style={[styles.flexRow, styles.mb2]}>
                            <TextInputWithLabel
                                label={this.props.translate('addDebitCardPage.expiration')}
                                placeholder={this.props.translate('addDebitCardPage.expirationDate')}
                                keyboardType="number-pad"
                                containerStyles={[styles.flex2, styles.mr4]}
                                onChangeText={expirationDate => this.handleExpirationInput(expirationDate)}
                                value={this.state.expirationDate}
                            />
                            <TextInputWithLabel
                                label={this.props.translate('addDebitCardPage.cvv')}
                                placeholder="123"
                                keyboardType="number-pad"
                                containerStyles={[styles.flex2]}
                                onChangeText={securityCode => this.setState({securityCode})}
                                value={this.state.securityCode}
                            />
                        </View>
                        <TextInputWithLabel
                            label={this.props.translate('addDebitCardPage.billingAddress')}
                            placeholder={this.props.translate('addDebitCardPage.streetAddress')}
                            containerStyles={[styles.flex1, styles.mb2]}
                            onChangeText={billingAddress => this.setState({billingAddress})}
                            value={this.state.billingAddress}
                        />
                        <TextInputWithLabel
                            label={this.props.translate('common.city')}
                            placeholder={this.props.translate('addDebitCardPage.cityName')}
                            containerStyles={[styles.flex1, styles.mb2]}
                            onChangeText={city => this.setState({city})}
                            value={this.state.city}
                        />
                        <View style={[styles.flexRow, styles.mb6]}>
                            <View style={[styles.flex2, styles.mr4]}>
                                <Text style={[styles.mb1, styles.formLabel]}>
                                    {this.props.translate('common.state')}
                                </Text>
                                <StatePicker
                                    onChange={state => this.setState({selectedState: state})}
                                    value={this.state.selectedState}
                                />
                            </View>
                            <TextInputWithLabel
                                label={this.props.translate('common.zip')}
                                placeholder={this.props.translate('common.zip')}
                                containerStyles={[styles.flex2]}
                                onChangeText={zipCode => this.setState({zipCode})}
                                value={this.state.zipCode}
                            />
                        </View>
                        <CheckboxWithLabel
                            isChecked={this.state.acceptedTerms}
                            onPress={this.toggleTermsOfService}
                            LabelComponent={() => (
                                <Text>
                                    {`${this.props.translate('common.iAcceptThe')} `}
                                    <TextLink href="https://use.expensify.com/terms">
                                        {`${this.props.translate('addDebitCardPage.expensifyTermsOfService')}`}
                                    </TextLink>
                                </Text>
                            )}
                        />
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            success
                            onPress={this.submit}
                            style={[styles.w100]}
                            text={this.props.translate('common.save')}
                            isLoading={this.state.isAddingCard}
                            pressOnEnter
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

DebitCardPage.propTypes = propTypes;
DebitCardPage.defaultProps = defaultProps;
DebitCardPage.displayName = 'DebitCardPage';

export default compose(
    withLocalize,
    withOnyx({
    }),
)(DebitCardPage);
