import _ from 'underscore';
import React from 'react';
import {
    ActivityIndicator,
    View,
} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import Log from '../../libs/Log';
import PlaidLink from '../PlaidLink/index';
import {
    clearPlaidBankAccountsAndToken,
    fetchPlaidLinkToken,
    getPlaidBankAccounts,
    setBankAccountFormValidationErrors,
    showBankAccountErrorModal,
} from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import ExpensiPicker from '../ExpensiPicker';
import Text from '../Text';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import ReimbursementAccountForm from '../../pages/ReimbursementAccount/ReimbursementAccountForm';
import getBankIcon from '../Icon/BankIcons';
import Icon from '../Icon';
import {propTypes, defaultProps} from './plaidBankPropTypes';

const plaidBankPropTypes = {
    ...withLocalizePropTypes,
    ...propTypes,
};

class AddPlaidBankAccount extends React.Component {
    constructor(props) {
        super(props);

        this.selectAccount = this.selectAccount.bind(this);

        this.state = {
            selectedIndex: undefined,
            institution: {},
        };

        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
    }

    componentDidMount() {
        // If we're coming from Plaid OAuth flow then we need to reuse the existing plaidLinkToken
        // Otherwise, clear the existing token and fetch a new one
        if (!this.props.receivedRedirectURI || !this.props.plaidLinkToken) {
            const redirectURI = this.props.isBusinessBankAccount ?
                `http://localhost:8080/partners/plaid/oauth_web/${CONST.BANK_ACCOUNT.BUSINESS}` :
                `http://localhost:8080/partners/plaid/oauth_web/${CONST.BANK_ACCOUNT.PERSONAL}`;
            clearPlaidBankAccountsAndToken();
            fetchPlaidLinkToken(redirectURI);
        }
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
     * @returns {Boolean}
     */
    validate() {
        const errors = {};
        if (_.isUndefined(this.state.selectedIndex)) {
            errors.selectedBank = true;
        }
        setBankAccountFormValidationErrors(errors);
        return _.size(errors) === 0;
    }

    selectAccount() {
        if (!this.validate()) {
            showBankAccountErrorModal();
            return;
        }

        const account = this.getAccounts()[this.state.selectedIndex];
        const bankName = lodashGet(this.props.plaidBankAccounts, 'bankName');
        this.props.onSubmit({
            bankName,
            account,
            plaidLinkToken: this.props.plaidLinkToken,
        });
    }

    render() {
        const accounts = this.getAccounts();
        const options = _.map(accounts, (account, index) => ({
            value: index, label: `${account.addressName} ${account.accountNumber}`,
        }));
        const {icon, iconSize} = getBankIcon(this.state.institution.name);
        return (
            <>
                {(!this.props.plaidLinkToken || this.props.plaidBankAccounts.loading)
                    && (
                        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <ActivityIndicator color={themeColors.spinner} size="large" />
                        </View>
                    )}
                {!_.isEmpty(this.props.plaidLinkToken) && (
                    <PlaidLink
                        token={this.props.plaidLinkToken}
                        onSuccess={({publicToken, metadata}) => {
                            Log.info('[PlaidLink] Success!');
                            getPlaidBankAccounts(publicToken, metadata.institution.name);
                            this.setState({institution: metadata.institution});
                        }}
                        onError={(error) => {
                            Log.hmmm('[PlaidLink] Error: ', error.message);
                        }}

                        // User prematurely exited the Plaid flow
                        // eslint-disable-next-line react/jsx-props-no-multi-spaces
                        onExit={this.props.onExitPlaid}
                        receivedRedirectUri={this.props.receivedRedirectURI}
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
                            <ExpensiPicker
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
                    </ReimbursementAccountForm>
                )}
            </>
        );
    }
}

AddPlaidBankAccount.propTypes = plaidBankPropTypes;
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
