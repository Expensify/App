import _ from 'underscore';
import React from 'react';
import {
    ActivityIndicator,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import Log from '../libs/Log';
import PlaidLink from './PlaidLink';
import * as BankAccounts from '../libs/actions/BankAccounts';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import canFocusInputOnScreenFocus from '../libs/canFocusInputOnScreenFocus';
import themeColors from '../styles/themes/default';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Picker from './Picker';
import Text from './Text';
import * as ReimbursementAccountUtils from '../libs/ReimbursementAccountUtils';
import ReimbursementAccountForm from '../pages/ReimbursementAccount/ReimbursementAccountForm';
import getBankIcon from './Icon/BankIcons';
import Icon from './Icon';
import TextInput from './TextInput';

const propTypes = {
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

            /** last 4 digits of the account number */
            mask: PropTypes.string,
        })),
    }),

    /** Fired when the user exits the Plaid flow */
    onExitPlaid: PropTypes.func,

    /** Fired when the user selects an account and submits the form */
    onSubmit: PropTypes.func,

    /** Additional text to display */
    text: PropTypes.string,

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,

    /** Should we require a password to create a bank account? */
    isPasswordRequired: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    plaidLinkToken: '',
    plaidBankAccounts: {
        loading: false,
    },
    onExitPlaid: () => {},
    onSubmit: () => {},
    text: '',
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
    isPasswordRequired: false,
};

class AddPlaidBankAccount extends React.Component {
    constructor(props) {
        super(props);

        this.selectAccount = this.selectAccount.bind(this);
        this.getPlaidLinkToken = this.getPlaidLinkToken.bind(this);

        this.state = {
            selectedIndex: undefined,
            institution: {},
            password: '',
        };

        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, {
            password: 'passwordForm.error.incorrectPassword',
        }, inputKey);
    }

    componentDidMount() {
        // If we're coming from Plaid OAuth flow then we need to reuse the existing plaidLinkToken
        // Otherwise, clear the existing token and fetch a new one
        if (this.props.receivedRedirectURI && this.props.plaidLinkOAuthToken) {
            return;
        }

        BankAccounts.clearPlaidBankAccountsAndToken();
        BankAccounts.fetchPlaidLinkToken();
    }

    componentWillUnmount() {
        BankAccounts.setBankAccountFormValidationErrors({});
    }

    /**
     * Get list of bank accounts
     *
     * @returns {Object[]}
     */
    getAccounts() {
        return lodashGet(this.props.plaidBankAccounts, 'accounts', []);
    }

    /**
     * @returns {String}
     */
    getPlaidLinkToken() {
        if (!_.isEmpty(this.props.plaidLinkToken)) {
            return this.props.plaidLinkToken;
        }

        if (this.props.receivedRedirectURI && this.props.plaidLinkOAuthToken) {
            return this.props.plaidLinkOAuthToken;
        }
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};
        if (_.isUndefined(this.state.selectedIndex)) {
            errors.selectedBank = true;
        }

        if (this.props.isPasswordRequired && _.isEmpty(this.state.password)) {
            errors.password = true;
        }

        BankAccounts.setBankAccountFormValidationErrors(errors);
        return _.size(errors) === 0;
    }

    selectAccount() {
        if (!this.validate()) {
            BankAccounts.showBankAccountErrorModal();
            return;
        }

        const account = this.getAccounts()[this.state.selectedIndex];
        const bankName = lodashGet(this.props.plaidBankAccounts, 'bankName');
        this.props.onSubmit({
            bankName,
            account,
            plaidLinkToken: this.getPlaidLinkToken(),
            password: this.state.password,
        });
    }

    render() {
        const accounts = this.getAccounts();
        const token = this.getPlaidLinkToken();
        const options = _.map(accounts, (account, index) => ({
            value: index, label: `${account.addressName} ${account.mask}`,
        }));
        const {icon, iconSize} = getBankIcon(this.state.institution.name);

        return (
            <>
                {(!token || this.props.plaidBankAccounts.loading)
                && (
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <ActivityIndicator color={themeColors.spinner} size="large" />
                    </View>
                )}
                {token && (
                    <PlaidLink
                        token={token}
                        onSuccess={({publicToken, metadata}) => {
                            Log.info('[PlaidLink] Success!');
                            BankAccounts.fetchPlaidBankAccounts(publicToken, metadata.institution.name);
                            this.setState({institution: metadata.institution});
                        }}
                        onError={(error) => {
                            Log.hmmm('[PlaidLink] Error: ', error.message);
                        }}

                        // User prematurely exited the Plaid flow
                        // eslint-disable-next-line react/jsx-props-no-multi-spaces
                        onExit={this.props.onExitPlaid}
                        receivedRedirectURI={this.props.receivedRedirectURI}
                    />
                )}
                {accounts.length > 0 && (
                    <ReimbursementAccountForm
                        onSubmit={this.selectAccount}
                    >
                        {!_.isEmpty(this.props.text) && (
                            <Text style={[styles.mb5]}>{this.props.text}</Text>
                        )}
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                            <Icon
                                src={icon}
                                height={iconSize}
                                width={iconSize}
                            />
                            <Text style={[styles.ml3, styles.textStrong]}>{this.state.institution.name}</Text>
                        </View>
                        <View style={[styles.mb5]}>
                            <Picker
                                label={this.props.translate('addPersonalBankAccountPage.chooseAccountLabel')}
                                onChange={(index) => {
                                    this.setState({selectedIndex: Number(index)});
                                    this.clearError('selectedBank');
                                }}
                                items={options}
                                placeholder={_.isUndefined(this.state.selectedIndex) ? {
                                    value: '',
                                    label: this.props.translate('bankAccount.chooseAnAccount'),
                                } : {}}
                                value={this.state.selectedIndex}
                                hasError={this.getErrors().selectedBank}
                            />
                        </View>
                        {!_.isUndefined(this.state.selectedIndex) && this.props.isPasswordRequired && (
                            <View style={[styles.mb5]}>
                                <TextInput
                                    label={this.props.translate('addPersonalBankAccountPage.enterPassword')}
                                    secureTextEntry
                                    value={this.state.password}
                                    autoCompleteType="password"
                                    textContentType="password"
                                    autoCapitalize="none"
                                    autoFocus={canFocusInputOnScreenFocus()}
                                    onChangeText={text => this.setState({password: text})}
                                    errorText={this.getErrorText('password')}
                                    hasError={this.getErrors().password}
                                />
                            </View>
                        )}
                    </ReimbursementAccountForm>
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

            // We always fetch a new token to call Plaid. If we don't then it's possible to open multiple Plaid Link instances. In particular, this can cause issues for Android e.g.
            // inability to hand off to React Native once the bank connection is made. This is because an old stashed token will mount the PlaidLink component then it gets set again
            // which will mount another PlaidLink component.
            initWithStoredValues: false,
        },
        plaidBankAccounts: {
            key: ONYXKEYS.PLAID_BANK_ACCOUNTS,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(AddPlaidBankAccount);
