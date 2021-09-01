import _ from 'underscore';
import React from 'react';
import {
    ActivityIndicator,
    View,
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
import themeColors from '../styles/themes/default';
import canFocusInputOnScreenFocus from '../libs/canFocusInputOnScreenFocus';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Button from './Button';
import ExpensiPicker from './ExpensiPicker';
import Text from './Text';
import ExpensiTextInput from './ExpensiTextInput';

const propTypes = {
    ...withLocalizePropTypes,

    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,

    /** Contains list of accounts and loading state while fetching them */
    plaidBankAccounts: PropTypes.shape({
        /** Whether we are fetching the bank accounts from the API */
        loading: PropTypes.bool,

        /** Error object */
        error: PropTypes.shape({
            /** Error message */
            message: PropTypes.string,

            /** Error title */
            title: PropTypes.string,
        }),

        /** List of accounts */
        accounts: PropTypes.arrayOf(PropTypes.shape({
            /** Masked account number */
            accountNumber: PropTypes.string,

            /** Name of account */
            addressName: PropTypes.string,

            /** Has this account has already been added? */
            alreadyExists: PropTypes.bool,

            /** Is the account a savings account? */
            isSavings: PropTypes.bool,

            /** Unique identifier for this account in Plaid */
            plaidAccountID: PropTypes.string,

            /** Routing number for the account */
            routingNumber: PropTypes.string,
        })),
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
        const options = _.map(accounts, (account, index) => ({
            value: index, label: `${account.addressName} ${account.accountNumber}`,
        }));
        return (
            <>
                {(!this.props.plaidLinkToken || this.props.plaidBankAccounts.loading)
                    && (
                        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <ActivityIndicator color={themeColors.spinner} size="large" />
                        </View>
                    )}
                {!_.isEmpty(this.props.plaidLinkToken) && _.isEmpty(this.state.institution) && (
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
                                <ExpensiPicker
                                    label={this.props.translate('addPersonalBankAccountPage.chooseAccountLabel')}
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
                                    <ExpensiTextInput
                                        label={this.props.translate('addPersonalBankAccountPage.enterPassword')}
                                        secureTextEntry
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

            // We always fetch a new token to call Plaid. If we don't then it's possible to open multiple Plaid Link instances. In particular, this can cause issues for Android e.g. very
            // slow loading of the Plaid UI and inability to hand off to React Native once the bank connection is made. This is because an old stashed token will mount the PlaidLink
            // component then it gets set again which will mount another PlaidLink component.
            initWithStoredValues: false,
        },
        plaidBankAccounts: {
            key: ONYXKEYS.PLAID_BANK_ACCOUNTS,
        },
    }),
)(AddPlaidBankAccount);
