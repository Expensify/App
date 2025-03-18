import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Log from '@libs/Log';
import * as App from '@userActions/App';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PlaidData} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import FormHelpMessage from './FormHelpMessage';
import Icon from './Icon';
import getBankIcon from './Icon/BankIcons';
import PlaidLink from './PlaidLink';
import RadioButtons from './RadioButtons';
import Text from './Text';

type AddPlaidBankAccountOnyxProps = {
    /** If the user has been throttled from Plaid */
    isPlaidDisabled: OnyxEntry<boolean>;

    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: OnyxEntry<string>;
};

type AddPlaidBankAccountProps = AddPlaidBankAccountOnyxProps & {
    /** Contains plaid data */
    plaidData: OnyxEntry<PlaidData>;

    /** Selected account ID from the Picker associated with the end of the Plaid flow */
    selectedPlaidAccountID?: string;

    /** Fired when the user exits the Plaid flow */
    onExitPlaid?: () => void;

    /** Fired when the user selects an account */
    onSelect?: (plaidAccountID: string) => void;

    /** Additional text to display */
    text?: string;

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI?: string;

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken?: string;

    /** If we're updating an existing bank account, what's its bank account ID? */
    bankAccountID?: number;

    /** Are we adding a withdrawal account? */
    allowDebit?: boolean;

    /** Is displayed in new enable wallet flow */
    isDisplayedInWalletFlow?: boolean;

    /** Text to display on error message */
    errorText?: string;

    /** Function called whenever radio button value changes */
    onInputChange?: (plaidAccountID: string) => void;
};

function AddPlaidBankAccount({
    plaidData,
    selectedPlaidAccountID = '',
    plaidLinkToken,
    onExitPlaid = () => {},
    onSelect = () => {},
    text = '',
    receivedRedirectURI,
    plaidLinkOAuthToken = '',
    bankAccountID = 0,
    allowDebit = false,
    isPlaidDisabled,
    errorText = '',
    onInputChange = () => {},
    isDisplayedInWalletFlow = false,
}: AddPlaidBankAccountProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const plaidBankAccounts = plaidData?.bankAccounts ?? [];
    const defaultSelectedPlaidAccount = plaidBankAccounts.find((account) => account.plaidAccountID === selectedPlaidAccountID);
    const defaultSelectedPlaidAccountID = defaultSelectedPlaidAccount?.plaidAccountID ?? '-1';
    const defaultSelectedPlaidAccountMask = plaidBankAccounts.find((account) => account.plaidAccountID === selectedPlaidAccountID)?.mask ?? '';
    const subscribedKeyboardShortcuts = useRef<Array<() => void>>([]);
    const previousNetworkState = useRef<boolean | undefined>();
    const [selectedPlaidAccountMask, setSelectedPlaidAccountMask] = useState(defaultSelectedPlaidAccountMask);

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const getPlaidLinkToken = (): string | undefined => {
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
        () => (!!receivedRedirectURI && !!plaidLinkOAuthToken) || !!plaidData?.bankAccounts?.length || !isEmptyObject(plaidData?.errors),
        [plaidData, plaidLinkOAuthToken, receivedRedirectURI],
    );

    /**
     * Blocks the keyboard shortcuts that can navigate
     */
    const subscribeToNavigationShortcuts = () => {
        // find and block the shortcuts
        const shortcutsToBlock = Object.values(CONST.KEYBOARD_SHORTCUTS).filter((shortcut) => 'type' in shortcut && shortcut.type === CONST.KEYBOARD_SHORTCUTS_TYPES.NAVIGATION_SHORTCUT);
        subscribedKeyboardShortcuts.current = shortcutsToBlock.map((shortcut) =>
            KeyboardShortcut.subscribe(
                shortcut.shortcutKey,
                () => {}, // do nothing
                shortcut.descriptionKey,
                shortcut.modifiers,
                false,
                () => (plaidData?.bankAccounts ?? []).length > 0, // start bubbling when there are bank accounts
            ),
        );
    };

    /**
     * Unblocks the keyboard shortcuts that can navigate
     */
    const unsubscribeToNavigationShortcuts = () => {
        subscribedKeyboardShortcuts.current.forEach((unsubscribe) => unsubscribe());
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // If we are coming back from offline and we haven't authenticated with Plaid yet, we need to re-run our call to kick off Plaid
        // previousNetworkState.current also makes sure that this doesn't run on the first render.
        if (previousNetworkState.current && !isOffline && !isAuthenticatedWithPlaid()) {
            BankAccounts.openPlaidBankLogin(allowDebit, bankAccountID);
        }
        previousNetworkState.current = isOffline;
    }, [allowDebit, bankAccountID, isAuthenticatedWithPlaid, isOffline]);

    const token = getPlaidLinkToken();
    const options = plaidBankAccounts.map((account) => ({
        value: account.plaidAccountID,
        label: account.addressName ?? '',
    }));
    const {icon, iconSize, iconStyles} = getBankIcon({styles});
    const plaidErrors = plaidData?.errors;
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const plaidDataErrorMessage = !isEmptyObject(plaidErrors) ? (Object.values(plaidErrors).at(0) as string) : '';
    const bankName = plaidData?.bankName;

    /**
     *
     * When user selects one of plaid accounts we need to set the mask in order to display it on UI
     */
    const handleSelectingPlaidAccount = (plaidAccountID: string) => {
        const mask = plaidBankAccounts.find((account) => account.plaidAccountID === plaidAccountID)?.mask ?? '';
        setSelectedPlaidAccountMask(mask);
        onSelect(plaidAccountID);
        onInputChange(plaidAccountID);
    };

    const handlePlaidError = useCallback((error: ErrorEvent | null) => {
        Log.hmmm('[PlaidLink] Error: ', error?.message);
    }, []);

    if (isPlaidDisabled) {
        return (
            <View>
                <Text style={[styles.formError]}>{translate('bankAccount.error.tooManyAttempts')}</Text>
            </View>
        );
    }

    const renderPlaidLink = () => {
        if (!!token && !bankName) {
            return (
                <PlaidLink
                    token={token}
                    onSuccess={({publicToken, metadata}) => {
                        Log.info('[PlaidLink] Success!');
                        BankAccounts.openPlaidBankAccountSelector(publicToken, metadata?.institution?.name ?? '', allowDebit, bankAccountID);
                    }}
                    onError={handlePlaidError}
                    onEvent={(event, metadata) => {
                        BankAccounts.setPlaidEvent(event);
                        // Handle Plaid login errors (will potentially reset plaid token and item depending on the error)
                        if (event === 'ERROR') {
                            Log.hmmm('[PlaidLink] Error: ', {...metadata});
                            if (bankAccountID && metadata && 'error_code' in metadata) {
                                BankAccounts.handlePlaidError(bankAccountID, metadata.error_code ?? '', metadata.error_message ?? '', metadata.request_id);
                            }
                        }

                        // Limit the number of times a user can submit Plaid credentials
                        if (event === 'SUBMIT_CREDENTIALS') {
                            App.handleRestrictedEvent(event);
                        }
                    }}
                    // User prematurely exited the Plaid flow
                    // eslint-disable-next-line react/jsx-props-no-multi-spaces
                    onExit={onExitPlaid}
                    receivedRedirectURI={receivedRedirectURI}
                />
            );
        }

        if (plaidDataErrorMessage) {
            return <Text style={[styles.formError, styles.mh5]}>{plaidDataErrorMessage}</Text>;
        }

        if (plaidData?.isLoading) {
            return (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <ActivityIndicator
                        color={theme.spinner}
                        size="large"
                    />
                </View>
            );
        }

        return <View />;
    };

    // Plaid Link view
    if (!plaidBankAccounts.length) {
        return <FullPageOfflineBlockingView>{renderPlaidLink()}</FullPageOfflineBlockingView>;
    }

    return (
        <FullPageOfflineBlockingView>
            <Text style={[styles.mb3, styles.textHeadlineLineHeightXXL]}>{translate(isDisplayedInWalletFlow ? 'walletPage.chooseYourBankAccount' : 'bankAccount.chooseAnAccount')}</Text>
            {!!text && <Text style={[styles.mb6, styles.textSupporting]}>{text}</Text>}
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb6]}>
                <Icon
                    src={icon}
                    height={iconSize}
                    width={iconSize}
                    additionalStyles={iconStyles}
                />
                <View>
                    <Text style={[styles.ml3, styles.textStrong]}>{bankName}</Text>
                    {selectedPlaidAccountMask.length > 0 && (
                        <Text style={[styles.ml3, styles.textLabelSupporting]}>{`${translate('bankAccount.accountEnding')} ${selectedPlaidAccountMask}`}</Text>
                    )}
                </View>
            </View>
            <Text style={[styles.textLabelSupporting]}>{`${translate('bankAccount.chooseAnAccountBelow')}:`}</Text>
            <RadioButtons
                items={options}
                defaultCheckedValue={defaultSelectedPlaidAccountID}
                onPress={handleSelectingPlaidAccount}
                radioButtonStyle={[styles.mb6]}
            />
            <FormHelpMessage message={errorText} />
        </FullPageOfflineBlockingView>
    );
}

AddPlaidBankAccount.displayName = 'AddPlaidBankAccount';

export default withOnyx<AddPlaidBankAccountProps, AddPlaidBankAccountOnyxProps>({
    plaidLinkToken: {
        key: ONYXKEYS.PLAID_LINK_TOKEN,
        initWithStoredValues: false,
    },
    isPlaidDisabled: {
        key: ONYXKEYS.IS_PLAID_DISABLED,
    },
})(AddPlaidBankAccount);
