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
import PlaidLink from './PlaidLink';
import {
    clearPlaidBankAccounts,
    fetchPlaidLinkToken,
    getPlaidBankAccounts,
} from '../libs/actions/BankAccounts';
import ONYXKEYS from '../ONYXKEYS';
import OptionRow from '../pages/home/sidebar/OptionRow';
import styles from '../styles/styles';
import canFocusInputOnScreenFocus from '../libs/canFocusInputOnScreenFocus';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Button from './Button';

const propTypes = {
    ...withLocalizePropTypes,

    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,

    /** Contains list of accounts and loading state while fetching them */
    plaidBankAccounts: PropTypes.shape({
        /** Whether we are fetching the bank accounts from the API */
        loading: PropTypes.bool,

        /** List of accounts */
        accounts: PropTypes.arrayOf(PropTypes.object),
    }),

    /** Fired when the user exits the Plaid flow */
    onExitPlaid: PropTypes.func,
};

const defaultProps = {
    plaidLinkToken: '',
    plaidBankAccounts: {
        loading: false,
    },
    onExitPlaid: () => {},
};

class AddPlaidBankAccount extends React.Component {
    constructor(props) {
        super(props);

        this.selectAccount = this.selectAccount.bind(this);

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

    selectAccount() {
        const account = this.getAccounts()[this.state.selectedIndex];
        this.props.onSelectAccount({
            account, password: this.state.password, plaidLinkToken: this.props.plaidLinkToken,
        });
        this.setState({isCreatingAccount: true});
    }

    render() {
        const accounts = this.getAccounts();
        return (
            <>
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
                            // User prematurely exited the Plaid flow
                            this.props.onExitPlaid();
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
                                onPress={this.selectAccount}
                                isDisabled={_.isUndefined(this.state.selectedIndex) || !this.state.password}
                            />
                        </View>
                    </View>
                )}
            </>
        );
    }
}

AddPlaidBankAccount.propTypes = propTypes;
AddPlaidBankAccount.defaultProps = defaultProps;

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
)(AddPlaidBankAccount);
