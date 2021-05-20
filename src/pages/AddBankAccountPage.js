import _ from 'underscore';
import React from 'react';
import {
    ActivityIndicator,
    View,
    Text,
    TextInput,
} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import PlaidLink from '../components/PlaidLink';
import {
    addPlaidBankAccount,
    clearPlaidBankAccounts,
    fetchPlaidLinkToken,
    getPlaidBankAccounts,
} from '../libs/actions/BankAccounts';
import ONYXKEYS from '../ONYXKEYS';
import OptionRow from './home/sidebar/OptionRow';
import styles from '../styles/styles';
import canFocusInputOnScreenFocus from '../libs/canFocusInputOnScreenFocus';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Button from '../components/Button';

const propTypes = {
    ...withLocalizePropTypes,

    // Plaid SDK token to use to initialize the widget
    plaidLinkToken: PropTypes.string,

    // Contains list of accounts and loading state while fetching them
    plaidBankAccounts: PropTypes.shape({
        // Whether we are fetching the bank accounts from the API
        loading: PropTypes.bool,

        // List of accounts
        accounts: PropTypes.arrayOf(PropTypes.object),
    }),
};

const defaultProps = {
    plaidLinkToken: '',
    plaidBankAccounts: {
        loading: false,
    },
};

class AddBankAccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.addSelectedAccount = this.addSelectedAccount.bind(this);

        this.state = {
            selectedIndex: undefined,
            password: '',
            isCreatingAccount: false,
        };
    }

    componentDidMount() {
        clearPlaidBankAccounts();
        fetchPlaidLinkToken();
    }

    /**
     * Get list of bank accounts
     *
     * @returns {Object[]}
     */
    getAccounts() {
        return lodashGet(this.props.plaidBankAccounts, 'accounts', []);
    }

    addSelectedAccount() {
        const account = this.getAccounts()[this.state.selectedIndex];
        addPlaidBankAccount(account, this.state.password, this.props.plaidLinkToken);
        this.setState({isCreatingAccount: true});
    }

    render() {
        const accounts = this.getAccounts();
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('addBankAccountPage.addBankAccount')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                {(!this.props.plaidLinkToken || this.props.plaidBankAccounts.loading)
                    && <ActivityIndicator size="large" />}
                {!_.isEmpty(this.props.plaidLinkToken) && (
                    <PlaidLink
                        token={this.props.plaidLinkToken}
                        onSuccess={({publicToken, metadata}) => {
                            getPlaidBankAccounts(publicToken, metadata.institution.name);
                        }}
                        onError={(error) => {
                            console.debug(`Plaid Error: ${error.message}`);
                        }}
                        onExit={() => {
                            // If the user prematurely exits the Plaid flow then let's kick them back to the main app
                            Navigation.dismissModal();
                        }}
                    />
                )}
                {accounts.length > 0 && (
                    <View>
                        <View style={[styles.m5]}>
                            <Text>{this.props.translate('addBankAccountPage.selectAccount')}</Text>
                        </View>
                        {_.map(accounts, (account, index) => (
                            <React.Fragment
                                key={`${account.accountNumber}${account.plaidAccountID}`}
                            >
                                <OptionRow
                                    showSelectedState
                                    optionIsFocused={false}
                                    isSelected={index === this.state.selectedIndex}
                                    option={{
                                        text: account.addressName,
                                        alternateText: account.accountNumber,
                                    }}
                                    isDisabled={account.alreadyExists}
                                    onSelectRow={() => {
                                        if (account.alreadyExists) {
                                            return;
                                        }

                                        this.setState({selectedIndex: index});
                                    }}
                                />
                                {account.alreadyExists && (
                                    <Text style={[styles.ml5]}>
                                        {this.props.translate('addBankAccountPage.alreadyAdded')}
                                    </Text>
                                )}
                            </React.Fragment>
                        ))}
                        <View style={[styles.m5]}>
                            {!_.isUndefined(this.state.selectedIndex) && (
                                <>
                                    <Text style={[styles.formLabel]}>
                                        {this.props.translate('addBankAccountPage.enterPassword')}
                                    </Text>
                                    <TextInput
                                        secureTextEntry
                                        style={[styles.textInput, styles.mb2]}
                                        value={this.state.password}
                                        autoCompleteType="password"
                                        textContentType="password"
                                        autoCapitalize="none"
                                        autoFocus={canFocusInputOnScreenFocus()}
                                        onChangeText={text => this.setState({password: text})}
                                    />
                                </>
                            )}
                            <Button
                                success
                                text={this.props.translate('common.continue')}
                                isLoading={this.state.isCreatingAccount}
                                onPress={this.addSelectedAccount}
                                isDisabled={_.isUndefined(this.state.selectedIndex) || !this.state.password}
                            />
                        </View>
                    </View>
                )}
            </ScreenWrapper>
        );
    }
}

AddBankAccountPage.propTypes = propTypes;
AddBankAccountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,
        },
        plaidBankAccounts: {
            key: ONYXKEYS.PLAID_BANK_ACCOUNTS,
        },
    }),
)(AddBankAccountPage);
