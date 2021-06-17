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

const propTypes = {
    ...withLocalizePropTypes,

    achData: PropTypes.shape({
        bankAccountID: PropTypes.number.isRequired,
        state: PropTypes.string,
    }),

    maxAttemptsReached: PropTypes.bool,
};

const defaultProps = {
    achData: {},
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
        } else {
            // If any values are falsey, indicate to user that inputs are invalid
            this.setState({error: 'Invalid amounts'});
        }
    }

    // Anything that isn't a number is returned as 0. Any dollar amount (e.g. 1.01 will be turned into 101)
    filterInput(amount) {
        let value = amount.trim();
        if (value === '' || !Math.abs(Str.fromUSDToNumber(value)) || _.isNaN(Number(value))) {
            return 0;
        }

        // If the user enters the values in dollars, convert it to the respective cents amount
        if (_.contains(value, '.')) {
            value = Str.fromUSDToNumber(value);
        }

        return value;
    }

    render() {
        const errorMessage = this.state.error;
        const state = this.props.achData.state;
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title="Validation Step"
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {state === BankAccount.STATE.PENDING && (
                    <View style={[styles.m5, styles.flex1]}>
                        <Text style={[styles.mh5, styles.mb5]}>
                            A day or two after you add your account to Expensify
                            we send three (3) transactions to your account. They have a merchant line like
                            &quot;Expensify, Inc. Validation&quot;.
                        </Text>
                        <View style={[styles.m5, styles.flex1]}>
                            {errorMessage && (
                                <Text style={[styles.mh5, styles.mb5]}>
                                    {errorMessage}
                                </Text>
                            )}
                            <TextInputWithLabel
                                placeholder="1.01"
                                keyboardType="number-pad"
                                value={this.state.amount1}
                                onChangeText={amount1 => this.setState({amount1})}
                            />
                            <TextInputWithLabel
                                placeholder="1.01"
                                keyboardType="number-pad"
                                value={this.state.amount2}
                                onChangeText={amount2 => this.setState({amount2})}
                            />
                            <TextInputWithLabel
                                placeholder="1.01"
                                keyboardType="number-pad"
                                value={this.state.amount3}
                                onChangeText={amount3 => this.setState({amount3})}
                            />
                        </View>
                        <Button
                            success
                            text={this.props.translate('common.saveAndContinue')}
                            style={[styles.m5]}
                            onPress={this.submit}
                            isDisabled={this.props.maxAttemptsReached}
                        />
                    </View>
                )}
                {state === BankAccount.STATE.VERIFYING && (
                    <View style={[styles.m5, styles.flex1]}>
                        <Text style={[styles.mh5, styles.mb5]}>
                            POOP
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
