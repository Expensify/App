import _ from 'underscore';
import React from 'react';
import {
    ActivityIndicator,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Log from '../libs/Log';
import PlaidLink from './PlaidLink';
import * as BankAccounts from '../libs/actions/BankAccounts';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Picker from './Picker';
import {plaidDataPropTypes} from '../pages/ReimbursementAccount/plaidDataPropTypes';
import Text from './Text';
import getBankIcon from './Icon/BankIcons';
import Icon from './Icon';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import {withNetwork} from './OnyxProvider';

const propTypes = {
    /** Contains plaid data */
    plaidData: plaidDataPropTypes.isRequired,

    /** Selected account ID from the Picker associated with the end of the Plaid flow */
    selectedPlaidAccountID: PropTypes.string,

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
    selectedPlaidAccountID: '',
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

        this.getPlaidLinkToken = this.getPlaidLinkToken.bind(this);
    }

    componentDidMount() {
        // If we're coming from Plaid OAuth flow then we need to reuse the existing plaidLinkToken
        if ((this.props.receivedRedirectURI && this.props.plaidLinkOAuthToken)
            || !_.isEmpty(lodashGet(this.props.plaidData, 'bankAccounts'))
            || !_.isEmpty(lodashGet(this.props.plaidData, 'errors'))) {
            return;
        }

        BankAccounts.openPlaidBankLogin(this.props.allowDebit, this.props.bankAccountID);
    }

    componentDidUpdate(prevProps) {
        // If we are coming back from offline, we need to re-run our call to kick off Plaid
        if (prevProps.network.isOffline && !this.props.network.isOffline) {
            BankAccounts.openPlaidBankLogin(this.props.allowDebit, this.props.bankAccountID);
        }
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

    render() {
        const plaidBankAccounts = lodashGet(this.props.plaidData, 'bankAccounts') || [];
        const token = this.getPlaidLinkToken();
        const options = _.map(plaidBankAccounts, account => ({
            value: account.plaidAccountID,
            label: `${account.addressName} ${account.mask}`,
        }));
        const {icon, iconSize} = getBankIcon();
        const plaidErrors = lodashGet(this.props.plaidData, 'errors');
        const plaidDataErrorMessage = !_.isEmpty(plaidErrors) ? _.chain(plaidErrors).values().first().value() : '';
        const bankName = lodashGet(this.props.plaidData, 'bankName');

        // Plaid Link view
        if (!plaidBankAccounts.length) {
            return (
                <FullPageOfflineBlockingView>
                    {lodashGet(this.props.plaidData, 'isLoading') && (
                        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <ActivityIndicator color={themeColors.spinner} size="large" />
                        </View>
                    )}
                    {Boolean(plaidDataErrorMessage) && (
                        <Text style={[styles.formError, styles.mh5]}>
                            {plaidDataErrorMessage}
                        </Text>
                    )}
                    {Boolean(token) && !bankName && (
                        <PlaidLink
                            token={token}
                            onSuccess={({publicToken, metadata}) => {
                                Log.info('[PlaidLink] Success!');
                                BankAccounts.openPlaidBankAccountSelector(publicToken, metadata.institution.name, this.props.allowDebit);
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
                    <Text style={[styles.ml3, styles.textStrong]}>{bankName}</Text>
                </View>
                <View style={[styles.mb5]}>
                    <Picker
                        label={this.props.translate('addPersonalBankAccountPage.chooseAccountLabel')}
                        onInputChange={this.props.onSelect}
                        items={options}
                        placeholder={{
                            value: '',
                            label: this.props.translate('bankAccount.chooseAnAccount'),
                        }}
                        value={this.props.selectedPlaidAccountID}
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
    withNetwork(),
    withOnyx({
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,
            initWithStoredValues: false,
        },
    }),
)(AddPlaidBankAccount);
