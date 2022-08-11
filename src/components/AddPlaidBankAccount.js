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
import themeColors from '../styles/themes/default';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Picker from './Picker';
import plaidDataPropTypes from '../pages/ReimbursementAccount/plaidDataPropTypes';
import Text from './Text';
import getBankIcon from './Icon/BankIcons';
import Icon from './Icon';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';

const propTypes = {
    /** Contains plaid data */
    plaidData: plaidDataPropTypes,

    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,

    /** Fired when the user exits the Plaid flow */
    onExitPlaid: PropTypes.func,

    /** Fired when the user selects an account */
    onSelect: PropTypes.func,

    /** Additional text to display */
    text: PropTypes.string,

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,

    /** If we're updating an existing bank account, what's its bank account ID? */
    bankAccountID: PropTypes.number,

    /** Are we adding a withdrawal account? */
    allowDebit: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    plaidData: {
        bankName: '',
        plaidAccessToken: '',
        bankAccounts: [],
        loading: false,
        error: '',
    },
    plaidLinkToken: '',
    onExitPlaid: () => {},
    onSelect: () => {},
    text: '',
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
    allowDebit: false,
    bankAccountID: 0,
};

class AddPlaidBankAccount extends React.Component {
    constructor(props) {
        super(props);

        this.selectAccount = this.selectAccount.bind(this);
        this.getPlaidLinkToken = this.getPlaidLinkToken.bind(this);

        this.state = {
            selectedIndex: undefined,
            institution: {},
        };
    }

    componentDidMount() {
        // If we're coming from Plaid OAuth flow then we need to reuse the existing plaidLinkToken
        // Otherwise, clear the existing token and fetch a new one
        if (this.props.receivedRedirectURI && this.props.plaidLinkOAuthToken) {
            return;
        }

        BankAccounts.clearPlaid();
        BankAccounts.openPlaidBankLogin(this.props.allowDebit, this.props.bankAccountID);
    }

    /**
     * Get list of bank accounts
     *
     * @returns {Object[]}
     */
    getPlaidBankAccounts() {
        return lodashGet(this.props.plaidData, 'bankAccounts', []);
    }

    /**
     * @returns {String}
     */
    getPlaidLinkToken() {
        if (this.props.plaidLinkToken) {
            return this.props.plaidLinkToken;
        }

        if (this.props.receivedRedirectURI && this.props.plaidLinkOAuthToken) {
            return this.props.plaidLinkOAuthToken;
        }
    }

    /**
     * Triggered when user selects a Plaid bank account.
     * @param {String} index
     */
    selectAccount(index) {
        this.setState({selectedIndex: Number(index)}, () => {
            const selectedPlaidBankAccount = this.getPlaidBankAccounts()[this.state.selectedIndex];
            selectedPlaidBankAccount.bankName = this.props.plaidData.bankName;
            selectedPlaidBankAccount.plaidAccessToken = this.props.plaidData.plaidAccessToken;
            this.props.onSelect({selectedPlaidBankAccount});
        });
    }

    render() {
        const plaidBankAccounts = this.getPlaidBankAccounts();
        const token = this.getPlaidLinkToken();
        const options = _.map(plaidBankAccounts, (account, index) => ({
            value: index, label: `${account.addressName} ${account.mask}`,
        }));
        const {icon, iconSize} = getBankIcon(this.state.institution.name);

        // Plaid Link view
        if (!plaidBankAccounts.length) {
            return (
                <FullPageOfflineBlockingView>
                    {(!token || this.props.plaidData.loading)
                    && (
                        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <ActivityIndicator color={themeColors.spinner} size="large" />
                        </View>
                    )}
                    {Boolean(this.props.plaidData.error) && (
                        <Text style={[styles.formError, styles.mh5]}>
                            {this.props.plaidData.error}
                        </Text>
                    )}
                    {Boolean(token) && (
                        <PlaidLink
                            token={token}
                            onSuccess={({publicToken, metadata}) => {
                                Log.info('[PlaidLink] Success!');
                                BankAccounts.openPlaidBankAccountSelector(publicToken, metadata.institution.name, this.props.allowDebit);
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
                </FullPageOfflineBlockingView>
            );
        }

        // Plaid bank accounts view
        return (
            <View>
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
                        onInputChange={this.selectAccount}
                        items={options}
                        placeholder={_.isUndefined(this.state.selectedIndex) ? {
                            value: '',
                            label: this.props.translate('bankAccount.chooseAnAccount'),
                        } : {}}
                        value={this.state.selectedIndex}
                    />
                </View>
            </View>
        );
    }
}

AddPlaidBankAccount.propTypes = propTypes;
AddPlaidBankAccount.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        plaidData: {
            key: ONYXKEYS.PLAID_DATA,
        },
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,
            initWithStoredValues: false,
        },
    }),
)(AddPlaidBankAccount);
