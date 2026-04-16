import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {LinkSuccessMetadata} from 'react-native-plaid-link-sdk';
import type {PlaidLinkOnSuccessMetadata} from 'react-plaid-link/src/types';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import PlaidLink from '@components/PlaidLink';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setAddNewPersonalCardStepAndData} from '@libs/actions/PersonalCards';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Log from '@libs/Log';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import Navigation from '@navigation/Navigation';
import {handleRestrictedEvent} from '@userActions/App';
import {setPlaidEvent} from '@userActions/BankAccounts';
import {openPlaidCompanyCardLogin} from '@userActions/Plaid';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID, PlaidData} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type PlaidLinkContentProps = {
    plaidLinkToken?: string;
    plaidDataErrorMessage: string;
    plaidData?: PlaidData;
    onSuccess: (args: {publicToken: string; metadata: PlaidLinkOnSuccessMetadata | LinkSuccessMetadata}) => void;
    onError: (error: ErrorEvent | null) => void;
    onEvent: (eventName: string) => void;
    onExit: () => void;
    receivedRedirectURI?: string;
};

function PlaidLinkContent({plaidLinkToken, plaidDataErrorMessage, plaidData, onSuccess, onError, onEvent, onExit, receivedRedirectURI}: PlaidLinkContentProps) {
    const styles = useThemeStyles();

    if (plaidLinkToken) {
        return (
            <PlaidLink
                token={plaidLinkToken}
                onSuccess={onSuccess}
                onError={onError}
                onEvent={onEvent}
                onExit={onExit}
                receivedRedirectURI={receivedRedirectURI}
            />
        );
    }
    if (plaidDataErrorMessage) {
        return <Text style={[styles.formError, styles.mh5]}>{plaidDataErrorMessage}</Text>;
    }
    if (plaidData?.isLoading) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'PersonalCardPlaidConnectionStep.renderPlaidLink',
            isPlaidDataLoading: plaidData?.isLoading,
        };
        return (
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    reasonAttributes={reasonAttributes}
                />
            </View>
        );
    }
    return null;
}

function PlaidConnectionStep({feed, onExit}: {feed?: CompanyCardFeedWithDomainID; onExit?: () => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewPersonalCard] = useOnyx(ONYXKEYS.ADD_NEW_PERSONAL_CARD);
    const isUSCountry = addNewPersonalCard?.data?.selectedCountry === CONST.COUNTRY.US;
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);
    const [plaidLinkToken] = useOnyx(ONYXKEYS.PLAID_LINK_TOKEN);
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);
    const plaidErrors = plaidData?.errors;
    const subscribedKeyboardShortcuts = useRef<Array<() => void>>([]);
    const previousNetworkState = useRef<boolean | undefined>(undefined);
    const plaidDataErrorMessage = !isEmptyObject(plaidErrors) && Object.values(plaidErrors) ? (Object.values(plaidErrors).at(0) ?? '') : '';
    const {isOffline} = useNetwork();
    const isAuthenticatedWithPlaid = !!plaidData?.bankAccounts?.length || !isEmptyObject(plaidData?.errors);

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
        for (const unsubscribe of subscribedKeyboardShortcuts.current) {
            unsubscribe();
        }
        subscribedKeyboardShortcuts.current = [];
    };

    useEffect(() => {
        subscribeToNavigationShortcuts();

        // If we're coming from Plaid OAuth flow then we need to reuse the existing plaidLinkToken
        if (isAuthenticatedWithPlaid) {
            return unsubscribeToNavigationShortcuts;
        }
        if (addNewPersonalCard?.data?.selectedCountry) {
            openPlaidCompanyCardLogin(addNewPersonalCard.data.selectedCountry, '', feed, true);
            return unsubscribeToNavigationShortcuts;
        }

        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // If we are coming back from offline and we haven't authenticated with Plaid yet, we need to re-run our call to kick off Plaid
        // previousNetworkState.current also makes sure that this doesn't run on the first render.
        if (previousNetworkState.current && !isOffline && !isAuthenticatedWithPlaid && addNewPersonalCard?.data?.selectedCountry) {
            openPlaidCompanyCardLogin(addNewPersonalCard.data.selectedCountry, '', feed, true);
        }
        previousNetworkState.current = isOffline;
    }, [addNewPersonalCard?.data?.selectedCountry, feed, isAuthenticatedWithPlaid, isOffline]);

    const handleBackButtonPress = () => {
        if (feed) {
            Navigation.goBack();
            return;
        }
        setAddNewPersonalCardStepAndData({step: isUSCountry ? CONST.PERSONAL_CARDS.STEP.SELECT_BANK : CONST.PERSONAL_CARDS.STEP.SELECT_COUNTRY});
    };
    const handlePlaidLinkError = (error: ErrorEvent | null) => {
        Log.hmmm('[PlaidLink] Error: ', error?.message);
    };

    const handlePlaidLinkSuccess = ({publicToken, metadata}: {publicToken: string; metadata: PlaidLinkOnSuccessMetadata | LinkSuccessMetadata}) => {
        // on success we need to move to bank connection screen with token, bank name = plaid
        Log.info('[PlaidLink] Success!');

        const plaidConnectedFeed = (metadata?.institution as PlaidLinkOnSuccessMetadata['institution'])?.institution_id ?? (metadata?.institution as LinkSuccessMetadata['institution'])?.id;
        const plaidConnectedFeedName = (metadata?.institution as PlaidLinkOnSuccessMetadata['institution'])?.name ?? (metadata?.institution as LinkSuccessMetadata['institution'])?.name;

        setAddNewPersonalCardStepAndData({
            step: CONST.PERSONAL_CARDS.STEP.BANK_CONNECTION,
            data: {
                publicToken,
                plaidConnectedFeed,
                plaidConnectedFeedName,
                plaidAccounts: metadata?.accounts,
            },
        });
    };

    const handlePlaidLinkEvent = (event: string) => {
        setPlaidEvent(event);
        // Limit the number of times a user can submit Plaid credentials
        if (event === 'SUBMIT_CREDENTIALS') {
            handleRestrictedEvent(event);
        }
    };

    const handlePlaidLinkExit = () => {
        onExit?.();
        handleBackButtonPress();
    };

    return (
        <ScreenWrapper
            testID="PlaidConnectionStep"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('personalCard.addPersonalCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            {isPlaidDisabled ? (
                <Text style={[styles.formError, styles.ph5, styles.mv3]}>{translate('bankAccount.error.tooManyAttempts')}</Text>
            ) : (
                <FullPageOfflineBlockingView>
                    <PlaidLinkContent
                        plaidLinkToken={plaidLinkToken}
                        plaidDataErrorMessage={plaidDataErrorMessage}
                        plaidData={plaidData}
                        onSuccess={handlePlaidLinkSuccess}
                        onError={handlePlaidLinkError}
                        onEvent={handlePlaidLinkEvent}
                        onExit={handlePlaidLinkExit}
                        receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                    />
                </FullPageOfflineBlockingView>
            )}
        </ScreenWrapper>
    );
}

export default PlaidConnectionStep;
