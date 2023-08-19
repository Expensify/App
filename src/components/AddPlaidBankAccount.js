import _ from 'underscore';
import React, {useEffect, useRef, useCallback} from 'react';
import {ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Log from '../libs/Log';
import PlaidLink from './PlaidLink';
import * as BankAccounts from '../libs/actions/BankAccounts';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import Picker from './Picker';
import {plaidDataPropTypes} from '../pages/ReimbursementAccount/plaidDataPropTypes';
import Text from './Text';
import getBankIcon from './Icon/BankIcons';
import Icon from './Icon';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import CONST from '../CONST';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import useLocalize from '../hooks/useLocalize';
import useNetwork from '../hooks/useNetwork';

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

function AddPlaidBankAccount({plaidData, selectedPlaidAccountID, plaidLinkToken, onExitPlaid, onSelect, text, receivedRedirectURI, plaidLinkOAuthToken, bankAccountID, allowDebit}) {
    const subscribedKeyboardShortcuts = useRef([]);
    const previousNetworkState = useRef();

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    /**
     * @returns {String}
     */
    const getPlaidLinkToken = () => {
        if (plaidLinkToken) {
            return plaidLinkToken;
        }

        if (receivedRedirectURI && plaidLinkOAuthToken) {
            return plaidLinkOAuthToken;
        }
    };

    /**
     * @returns {Boolean}
     * I'm using useCallback so the useEffect which uses this function doesn't run on every render.
     */
    const isAuthenticatedWithPlaid = useCallback(
        () => (receivedRedirectURI && plaidLinkOAuthToken) || !_.isEmpty(lodashGet(plaidData, 'bankAccounts')) || !_.isEmpty(lodashGet(plaidData, 'errors')),
        [plaidData, plaidLinkOAuthToken, receivedRedirectURI],
    );

    /**
     * Blocks the keyboard shortcuts that can navigate
     */
    const subscribeToNavigationShortcuts = () => {
        // find and block the shortcuts
        const shortcutsToBlock = _.filter(CONST.KEYBOARD_SHORTCUTS, (x) => x.type === CONST.KEYBOARD_SHORTCUTS_TYPES.NAVIGATION_SHORTCUT);
        subscribedKeyboardShortcuts.current = _.map(shortcutsToBlock, (shortcut) =>
            KeyboardShortcut.subscribe(
                shortcut.shortcutKey,
                () => {}, // do nothing
                shortcut.descriptionKey,
                shortcut.modifiers,
                false,
                () => lodashGet(plaidData, 'bankAccounts', []).length > 0, // start bubbling when there are bank accounts
            ),
        );
    };

    /**
     * Unblocks the keyboard shortcuts that can navigate
     */
    const unsubscribeToNavigationShortcuts = () => {
        _.each(subscribedKeyboardShortcuts.current, (unsubscribe) => unsubscribe());
        subscribedKeyboardShortcuts.current = [];
    };

    useEffect(() => {
        subscribeToNavigationShortcuts();

        // If we're coming from Plaid OAuth flow then we need to reuse the existing plaidLinkToken
        if (isAuthenticatedWithPlaid()) {
            return unsubscribeToNavigationShortcuts;
        }
        BankAccounts.openPlaidBankLogin(allowDebit, bankAccountID);
        return unsubscribeToNavigationShortcuts;

        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // If we are coming back from offline and we haven't authenticated with Plaid yet, we need to re-run our call to kick off Plaid
        // previousNetworkState.current also makes sure that this doesn't run on the first render.
        if (previousNetworkState.current && !isOffline && !isAuthenticatedWithPlaid()) {
            BankAccounts.openPlaidBankLogin(allowDebit, bankAccountID);
        }
        previousNetworkState.current = isOffline;
    }, [allowDebit, bankAccountID, isAuthenticatedWithPlaid, isOffline]);

    const plaidBankAccounts = lodashGet(plaidData, 'bankAccounts') || [];
    const token = getPlaidLinkToken();
    const options = _.map(plaidBankAccounts, (account) => ({
        value: account.plaidAccountID,
        label: `${account.addressName} ${account.mask}`,
    }));
    const {icon, iconSize} = getBankIcon();
    const plaidErrors = lodashGet(plaidData, 'errors');
    const plaidDataErrorMessage = !_.isEmpty(plaidErrors) ? _.chain(plaidErrors).values().first().value() : '';
    const bankName = lodashGet(plaidData, 'bankName');

    // Plaid Link view
    if (!plaidBankAccounts.length) {
        return (
            <FullPageOfflineBlockingView>
                {lodashGet(plaidData, 'isLoading') && (
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <ActivityIndicator
                            color={themeColors.spinner}
                            size="large"
                        />
                    </View>
                )}
                {Boolean(plaidDataErrorMessage) && <Text style={[styles.formError, styles.mh5]}>{plaidDataErrorMessage}</Text>}
                {Boolean(token) && !bankName && (
                    <PlaidLink
                        token={token}
                        onSuccess={({publicToken, metadata}) => {
                            Log.info('[PlaidLink] Success!');
                            BankAccounts.openPlaidBankAccountSelector(publicToken, metadata.institution.name, allowDebit, bankAccountID);
                        }}
                        onError={(error) => {
                            Log.hmmm('[PlaidLink] Error: ', error.message);
                        }}
                        // User prematurely exited the Plaid flow
                        // eslint-disable-next-line react/jsx-props-no-multi-spaces
                        onExit={onExitPlaid}
                        receivedRedirectURI={receivedRedirectURI}
                    />
                )}
            </FullPageOfflineBlockingView>
        );
    }

    // Plaid bank accounts view
    return (
        <FullPageOfflineBlockingView>
            {!_.isEmpty(text) && <Text style={[styles.mb5]}>{text}</Text>}
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
                    label={translate('addPersonalBankAccountPage.chooseAccountLabel')}
                    onInputChange={onSelect}
                    items={options}
                    placeholder={{
                        value: '',
                        label: translate('bankAccount.chooseAnAccount'),
                    }}
                    value={selectedPlaidAccountID}
                />
            </View>
        </FullPageOfflineBlockingView>
    );
}

AddPlaidBankAccount.propTypes = propTypes;
AddPlaidBankAccount.defaultProps = defaultProps;
AddPlaidBankAccount.displayName = 'AddPlaidBankAccount';

export default withOnyx({
    plaidLinkToken: {
        key: ONYXKEYS.PLAID_LINK_TOKEN,
        initWithStoredValues: false,
    },
})(AddPlaidBankAccount);
