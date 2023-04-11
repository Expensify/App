import React, {Component} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import compose from '../../../libs/compose';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import CheckboxWithLabel from '../../../components/CheckboxWithLabel';
import StatePicker from '../../../components/StatePicker';
import TextInput from '../../../components/TextInput';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import AddressSearch from '../../../components/AddressSearch';
import * as ComponentUtils from '../../../libs/ComponentUtils';
import Form from '../../../components/Form';
import Permissions from '../../../libs/Permissions';

const propTypes = {
    /* Onyx Props */
    formData: PropTypes.shape({
        setupComplete: PropTypes.bool,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    formData: {
        setupComplete: false,
    },
    betas: [],
};

class DebitCardPage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        PaymentMethods.clearDebitCardFormErrorAndSubmit();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.formData.setupComplete || !this.props.formData.setupComplete) {
            return;
        }

        PaymentMethods.continueSetup();
    }

    /**
     * Make sure we reset the onyx values so old errors don't show if this form is displayed later
     */
    componentWillUnmount() {
        PaymentMethods.clearDebitCardFormErrorAndSubmit();
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    validate(values) {
        const errors = {};

        if (!values.nameOnCard || !ValidationUtils.isValidCardName(values.nameOnCard)) {
            errors.nameOnCard = this.props.translate('addDebitCardPage.error.invalidName');
        }

        if (!values.cardNumber || !ValidationUtils.isValidDebitCard(values.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = this.props.translate('addDebitCardPage.error.debitCardNumber');
        }

        if (!values.expirationDate || !ValidationUtils.isValidExpirationDate(values.expirationDate)) {
            errors.expirationDate = this.props.translate('addDebitCardPage.error.expirationDate');
        }

        if (!values.securityCode || !ValidationUtils.isValidSecurityCode(values.securityCode)) {
            errors.securityCode = this.props.translate('addDebitCardPage.error.securityCode');
        }

        if (!values.addressStreet || !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = this.props.translate('addDebitCardPage.error.addressStreet');
        }

        if (!values.addressZipCode || !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = this.props.translate('addDebitCardPage.error.addressZipCode');
        }

        if (!values.addressState || !values.addressState) {
            errors.addressState = this.props.translate('addDebitCardPage.error.addressState');
        }

        if (!Permissions.canUsePasswordlessLogins(this.props.betas) && (!values.password || _.isEmpty(values.password.trim()))) {
            errors.password = this.props.translate('addDebitCardPage.error.password');
        }

        if (!values.acceptTerms) {
            errors.acceptTerms = this.props.translate('common.error.acceptTerms');
        }

        return errors;
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('addDebitCardPage.addADebitCard')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    formID={ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM}
                    validate={this.validate}
                    onSubmit={PaymentMethods.addPaymentCard}
                    submitButtonText={this.props.translate('common.save')}
                    scrollContextEnabled
                    scrollToOverflowEnabled
                    style={[styles.mh5, styles.flexGrow1]}
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
                                maxLength={4}
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
                    <View>
                        <AddressSearch
                            inputID="addressStreet"
                            label={this.props.translate('addDebitCardPage.billingAddress')}
                            containerStyles={[styles.mt4]}
                        />
                    </View>
                    <TextInput
                        inputID="addressZipCode"
                        label={this.props.translate('common.zip')}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                        hint={this.props.translate('common.zipCodeExample')}
                        containerStyles={[styles.mt4]}
                    />
                    <View style={styles.mt4}>
                        <StatePicker
                            inputID="addressState"
                        />
                    </View>
                    {!Permissions.canUsePasswordlessLogins(this.props.betas) && (
                        <View style={[styles.mt4]}>
                            <TextInput
                                inputID="password"
                                label={this.props.translate('addDebitCardPage.expensifyPassword')}
                                textContentType="password"
                                autoCompleteType={ComponentUtils.PASSWORD_AUTOCOMPLETE_TYPE}
                                secureTextEntry
                            />
                        </View>
                    )}
                    <CheckboxWithLabel
                        inputID="acceptTerms"
                        LabelComponent={() => (
                            <Text>
                                {`${this.props.translate('common.iAcceptThe')}`}
                                <TextLink href="https://use.expensify.com/terms">
                                    {`${this.props.translate('common.expensifyTermsOfService')}`}
                                </TextLink>
                            </Text>
                        )}
                        style={[styles.mt4]}
                    />
                </Form>
            </ScreenWrapper>
        );
    }
}

DebitCardPage.propTypes = propTypes;
DebitCardPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        formData: {
            key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(DebitCardPage);
