import React from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {validateBankAccount} from '../../libs/actions/BankAccounts';
import {navigateToConciergeChat} from '../../libs/actions/Report';
import Button from '../../components/Button';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import Text from '../../components/Text';
import BankAccount from '../../libs/models/BankAccount';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';

const propTypes = {
    ...withLocalizePropTypes,

    /** Additional data for the account in setup */
    achData: PropTypes.shape({

        /** Bank account ID of the VBA that we are validating is required */
        bankAccountID: PropTypes.number.isRequired,

        /** State of bank account */
        state: PropTypes.string,
    }).isRequired,

    /** Error message to display to user */
    error: PropTypes.string,

    /** Disable validation button if max attempts exceeded */
    maxAttemptsReached: PropTypes.bool,
};

const defaultProps = {
    error: '',
    maxAttemptsReached: false,
};

class ValidationStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.verifyingUrl = `${CONST.CLOUDFRONT_URL}/images/icons/emptystates/emptystate_reviewing.gif`;

        this.state = {
            amount1: '',
            amount2: '',
            amount3: '',
            error: '',
        };

        this.requiredFields = [
            'amount1',
            'amount2',
            'amount3',
        ];
    }

    submit() {
        const amount1 = this.filterInput(this.state.amount1);
        const amount2 = this.filterInput(this.state.amount2);
        const amount3 = this.filterInput(this.state.amount3);

        // If amounts are all non-zeros, submit amounts to API
        if (amount1 && amount2 && amount3) {
            const validateCode = [amount1, amount2, amount3].join(',');

            // Send valid amounts to BankAccountAPI::validateBankAccount in Web-Expensify
            validateBankAccount(this.props.achData.bankAccountID, validateCode);
            return;
        }

        // If any values are falsey, indicate to user that inputs are invalid
        this.setState({error: 'Invalid amounts'});
    }

    /**
     * Filter input for validation amount
     * Anything that isn't a number is returned as an empty string
     * Any dollar amount (e.g. 1.12) will be returned as 112
     *
     * @param {String} amount field input
     *
     * @returns {String}
     */
    filterInput(amount) {
        let value = amount.trim();
        if (value === '' || !Math.abs(Str.fromUSDToNumber(value)) || _.isNaN(Number(value))) {
            return '';
        }

        // If the user enters the values in dollars, convert it to the respective cents amount
        if (_.contains(value, '.')) {
            value = Str.fromUSDToNumber(value);
        }

        return value;
    }

    render() {
        let errorMessage = this.state.error ? this.state.error : this.props.error;
        if (this.props.maxAttemptsReached) {
            errorMessage = this.props.translate('validationStep.maxAttemptError');
        }

        const state = this.props.achData.state;
        const shouldDisableSubmitButton = this.requiredFields
            .reduce((acc, curr) => acc || !this.state[curr].trim(), false) || this.props.maxAttemptsReached;

        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={this.props.translate('validationStep.headerTitle')}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {state === BankAccount.STATE.PENDING && (
                    <View style={[styles.flex1, styles.mt2]}>
                        <View style={[styles.mb2]}>
                            <Text style={[styles.mh5, styles.mb5]}>
                                {this.props.translate('validationStep.description')}
                            </Text>
                            <Text style={[styles.mh5, styles.mb2]}>
                                {this.props.translate('validationStep.descriptionCTA')}
                            </Text>
                        </View>
                        <View style={[styles.m5, styles.flex1]}>
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.52"
                                keyboardType="number-pad"
                                value={this.state.amount1}
                                onChangeText={amount1 => this.setState({amount1})}
                            />
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.53"
                                keyboardType="number-pad"
                                value={this.state.amount2}
                                onChangeText={amount2 => this.setState({amount2})}
                            />
                            <ExpensiTextInput
                                containerStyles={[styles.mb1]}
                                placeholder="1.54"
                                keyboardType="number-pad"
                                value={this.state.amount3}
                                onChangeText={amount3 => this.setState({amount3})}
                            />
                            {Boolean(errorMessage) && (
                                <Text style={[styles.mb5, styles.textDanger]}>
                                    {errorMessage}
                                </Text>
                            )}
                        </View>
                        <Button
                            success
                            text={this.props.translate('validationStep.buttonText')}
                            style={[styles.mh5, styles.mb5]}
                            onPress={this.submit}
                            isDisabled={shouldDisableSubmitButton}
                        />
                    </View>
                )}
                {state === BankAccount.STATE.VERIFYING && (
                    <View style={[styles.flex1]}>
                        <Image
                            source={{uri: this.verifyingUrl}}
                            style={[styles.workspaceInviteWelcome]}
                            resizeMode="center"
                        />
                        <Text style={[styles.mh5, styles.mb5]}>
                            {this.props.translate('validationStep.reviewingInfo')}
                            <TextLink
                                onPress={() => {
                                    // There are two modals that must be dismissed before we can reveal the Concierge
                                    // chat underneath these screens
                                    Navigation.dismissModal();
                                    Navigation.dismissModal();
                                    navigateToConciergeChat();
                                }}
                            >
                                {this.props.translate('common.here')}
                            </TextLink>
                            {this.props.translate('validationStep.forNextSteps')}
                        </Text>
                    </View>
                )}
            </View>
        );
    }
}

ValidationStep.propTypes = propTypes;
ValidationStep.defaultProps = defaultProps;

export default withLocalize(ValidationStep);
