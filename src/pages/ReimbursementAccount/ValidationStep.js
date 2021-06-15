import React from 'react';
import {View} from 'react-native';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

import {validateBankAccount} from '../../libs/actions/BankAccounts';

import Button from '../../components/Button';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import TextInputWithLabel from '../../components/TextInputWithLabel';

const propTypes = {
    ...withLocalizePropTypes,
};

class ValidationStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            amount1: 0,
            amount2: 0,
            amount3: 0,
        };
    }

    submit() {
        const validationAmounts = [this.state.amount1, this.state.amount2, this.state.amount3].join(',');
        console.log(validationAmounts);

        // Make a call to bankAccounts
        validateBankAccount(1234, validationAmounts);
    }

    render() {
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title="Validation Step"
                    onCloseButtonPress={Navigation.dismissModal}
                />
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
                <Button
                    success
                    text={this.props.translate('common.saveAndContinue')}
                    style={[styles.m5]}
                    onPress={this.submit}
                />
            </View>
        );
    }
}

ValidationStep.propTypes = propTypes;

export default withLocalize(ValidationStep);
