import _ from 'underscore';
import React from 'react';
import {
    ActivityIndicator,
    View,
    TextInput,
} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import PlaidLink from './PlaidLink';
import {
    clearPlaidBankAccountsAndToken,
    fetchPlaidLinkToken,
    getPlaidBankAccounts,
} from '../libs/actions/BankAccounts';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import canFocusInputOnScreenFocus from '../libs/canFocusInputOnScreenFocus';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Button from './Button';
import Picker from './Picker';
import Text from './Text';

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

    /** Fired when the user selects an account and submits the form */
    onSubmit: PropTypes.func,

    /** Additional text to display */
    text: PropTypes.string,
};

const defaultProps = {
    plaidLinkToken: '',
    plaidBankAccounts: {
        loading: false,
    },
    onExitPlaid: () => {},
    onSubmit: () => {},
    text: '',
};

class AddPlaidBankAccount extends React.Component {
    constructor(props) {
        super(props);

        this.selectAccount = this.selectAccount.bind(this);

        this.state = {
            selectedIndex: undefined,
            password: '',
            isCreatingAccount: false,
            institution: {},
        };
    }

    componentDidMount() {
        clearPlaidBankAccountsAndToken();
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
        this.props.onSubmit({
            account, password: this.state.password, plaidLinkToken: this.props.plaidLinkToken,
        });
        this.setState({isCreatingAccount: true});
    }

    render() {
        const accounts = this.getAccounts();
        const options = _.chain(accounts)
            .filter(account => !account.alreadyExists)
            .map((account, index) => ({
                value: index, label: `${account.addressName} ${account.accountNumber}`,
            }))
            .value();

        return (
            <>
                {(!this.props.plaidLinkToken || this.props.plaidBankAccounts.loading)
                    && (
                        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                {!_.isEmpty(this.props.plaidLinkToken) && (
                    <PlaidLink
                        token={this.props.plaidLinkToken}
                        onSuccess={({publicToken, metadata}) => {
                            getPlaidBankAccounts(publicToken, metadata.institution.name);
                            this.setState({institution: metadata.institution});
                        }}
                        onError={(error) => {
                            console.debug(`Plaid Error: ${error.message}`);
                        }}

                        // User prematurely exited the Plaid flow
                        // eslint-disable-next-line react/jsx-props-no-multi-spaces
                        onExit={this.props.onExitPlaid}
                    />
                )}
                {accounts.length > 0 && (
                    <>
                        <View style={[styles.m5, styles.flex1]}>
                            {!_.isEmpty(this.props.text) && (
                                <Text style={[styles.mb5]}>{this.props.text}</Text>
                            )}
                            {/* @TODO there are a bunch of logos to incorporate here to replace this name
                            https://d2k5nsl2zxldvw.cloudfront.net/images/plaid/bg_plaidLogos_12@2x.png */}
                            <Text style={[styles.mb5, styles.h1]}>{this.state.institution.name}</Text>
                            <View style={[styles.mb5]}>
                                <Picker
                                    onChange={(index) => {
                                        this.setState({selectedIndex: Number(index)});
                                    }}
                                    items={options}
                                    placeholder={_.isUndefined(this.state.selectedIndex) ? {
                                        value: '',
                                        label: this.props.translate('bankAccount.chooseAnAccount'),
                                    } : {}}
                                    value={this.state.selectedIndex}
                                />
                            </View>
                            {!_.isUndefined(this.state.selectedIndex) && (
                                <View style={[styles.mb5]}>
                                    <Text style={[styles.formLabel]}>
                                        {this.props.translate('addPersonalBankAccountPage.enterPassword')}
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
                                </View>
                            )}
                        </View>
                        <View style={[styles.m5]}>
                            <Button
                                success
                                text={this.props.translate('common.saveAndContinue')}
                                isLoading={this.state.isCreatingAccount}
                                onPress={this.selectAccount}
                                isDisabled={_.isUndefined(this.state.selectedIndex) || !this.state.password}
                            />
                        </View>
                    </>
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
