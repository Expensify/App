import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

import {validateBankAccount} from '../../libs/actions/BankAccounts';

import Button from '../../components/Button';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import Text from '../../components/Text';
import BankAccount from '../../libs/models/BankAccount';
import CONST from '../../CONST';
import ImageView from '../../components/ImageView';

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

        this.state = {
            amount1: '',
            amount2: '',
            amount3: '',
            error: '',
        };
    }

    submit() {
        const amount1 = this.filterInput(this.state.amount1);
        const amount2 = this.filterInput(this.state.amount2);
        const amount3 = this.filterInput(this.state.amount3);

        // If amounts are all non-zeros, submit amounts to API
        if (amount1 && amount2 && amount3) {
            const validateCode = [amount1, amount2, amount3].join(',');

            // Make a call to bankAccounts
            validateBankAccount(this.props.achData.bankAccountID, validateCode);
            return;
        }

        // If any values are falsey, indicate to user that inputs are invalid
        this.setState({error: 'Invalid amounts'});
    }

    /**
     *
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
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={this.props.translate('validationStep.headerTitle')}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {state === BankAccount.STATE.PENDING && (
                    <View style={[styles.flex1, styles.mt2]}>
                        <View style={[styles.mb2]}>
                            <Text style={[styles.mh5, styles.mb1]}>
                                {this.props.translate('validationStep.description')}
                            </Text>
                            <Text style={[styles.mh5, styles.mb6, styles.textStrong, styles.alignSelfCenter]}>
                                {this.props.translate('validationStep.expensifyMerchantName')}
                            </Text>

                            <Text style={[styles.mh5, styles.mb2]}>
                                {this.props.translate('validationStep.desriptionCTA')}
                            </Text>
                        </View>
                        <View style={[styles.alignSelfCenter]}>
                            <Text style={[styles.mh5, styles.mb2, styles.textStrong, styles.badge]}>
                                {this.props.translate('validationStep.example')}
                            </Text>
                        </View>
                        <View style={[styles.m5, styles.flex1]}>
                            {errorMessage && (
                                <Text style={[styles.mh5, styles.mb5]}>
                                    {errorMessage}
                                </Text>
                            )}
                            <TextInputWithLabel
                                containerStyles={[styles.mb1]}
                                placeholder="1.52"
                                keyboardType="number-pad"
                                value={this.state.amount1}
                                onChangeText={amount1 => this.setState({amount1})}
                            />
                            <TextInputWithLabel
                                containerStyles={[styles.mb1]}
                                placeholder="1.53"
                                keyboardType="number-pad"
                                value={this.state.amount2}
                                onChangeText={amount2 => this.setState({amount2})}
                            />
                            <TextInputWithLabel
                                containerStyles={[styles.mb1]}
                                placeholder="1.54"
                                keyboardType="number-pad"
                                value={this.state.amount3}
                                onChangeText={amount3 => this.setState({amount3})}
                            />
                        </View>
                        <Button
                            success
                            text={this.props.translate('validationStep.buttonText')}
                            style={[styles.m5]}
                            onPress={this.submit}
                            isDisabled={this.props.maxAttemptsReached}
                        />
                    </View>
                )}
                {state === BankAccount.STATE.VERIFYING && (
                    <View style={[styles.m5, styles.flex1]}>
                        <ImageView
                            resizeMode="contain"
                            style={[
                                styles.mh5,
                                styles.mb5,
                            ]}
                            url={`${CONST.CLOUDFRONT_URL}/images/icons/emptystates/emptystate_reviewing.gif`}
                        />
                        <Text style={[styles.mh5, styles.mb5]}>
                            {this.props.translate('validationStep.verifyingDescription')}
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
