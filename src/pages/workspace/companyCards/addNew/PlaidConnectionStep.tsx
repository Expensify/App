import React, {useCallback, useEffect, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
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
import {setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@libs/actions/CompanyCards';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Log from '@libs/Log';
import {getDomainNameForPolicy} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {handleRestrictedEvent} from '@userActions/App';
import {setPlaidEvent} from '@userActions/BankAccounts';
import {importPlaidAccounts, openPlaidCompanyCardLogin} from '@userActions/Plaid';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function PlaidConnectionStep({feed, policyID, onExit}: {feed?: CompanyCardFeedWithDomainID; policyID?: string; onExit?: () => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const isUSCountry = addNewCard?.data?.selectedCountry === CONST.COUNTRY.US;
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED, {canBeMissing: true});
    const [plaidLinkToken] = useOnyx(ONYXKEYS.PLAID_LINK_TOKEN, {canBeMissing: true});
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA, {canBeMissing: true});
    const plaidErrors = plaidData?.errors;
    const subscribedKeyboardShortcuts = useRef<Array<() => void>>([]);
    const previousNetworkState = useRef<boolean | undefined>(undefined);
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const plaidDataErrorMessage = !isEmptyObject(plaidErrors) ? (Object.values(plaidErrors).at(0) as string) : '';
    const {isOffline} = useNetwork();
    const domain = getDomainNameForPolicy(policyID);

    const isAuthenticatedWithPlaid = useCallback(() => !!plaidData?.bankAccounts?.length || !isEmptyObject(plaidData?.errors), [plaidData?.bankAccounts?.length, plaidData?.errors]);

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
        if (isAuthenticatedWithPlaid()) {
            return unsubscribeToNavigationShortcuts;
        }
        if (addNewCard?.data?.selectedCountry) {
            openPlaidCompanyCardLogin(addNewCard.data.selectedCountry, domain, feed);
            return unsubscribeToNavigationShortcuts;
        }

        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // If we are coming back from offline and we haven't authenticated with Plaid yet, we need to re-run our call to kick off Plaid
        // previousNetworkState.current also makes sure that this doesn't run on the first render.
        if (previousNetworkState.current && !isOffline && !isAuthenticatedWithPlaid() && addNewCard?.data?.selectedCountry) {
            openPlaidCompanyCardLogin(addNewCard.data.selectedCountry, domain, feed);
        }
        previousNetworkState.current = isOffline;
    }, [addNewCard?.data?.selectedCountry, domain, feed, isAuthenticatedWithPlaid, isOffline]);

    const handleBackButtonPress = () => {
        if (feed) {
            Navigation.goBack();
            return;
        }
        setAddNewCompanyCardStepAndData({step: isUSCountry ? CONST.COMPANY_CARDS.STEP.SELECT_BANK : CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };
    const handlePlaidLinkError = useCallback((error: ErrorEvent | null) => {
        Log.hmmm('[PlaidLink] Error: ', error?.message);
    }, []);

    const renderPlaidLink = () => {
        if (plaidLinkToken) {
            return (
                <PlaidLink
                    token={plaidLinkToken}
                    onSuccess={({publicToken, metadata}) => {
                        // on success we need to move to bank connection screen with token, bank name = plaid
                        Log.info('[PlaidLink] Success!');

                        const plaidConnectedFeed =
                            (metadata?.institution as PlaidLinkOnSuccessMetadata['institution'])?.institution_id ?? (metadata?.institution as LinkSuccessMetadata['institution'])?.id;
                        const plaidConnectedFeedName =
                            (metadata?.institution as PlaidLinkOnSuccessMetadata['institution'])?.name ?? (metadata?.institution as LinkSuccessMetadata['institution'])?.name;

                        if (feed) {
                            if (plaidConnectedFeed && addNewCard?.data?.selectedCountry && plaidConnectedFeedName) {
                                importPlaidAccounts(
                                    publicToken,
                                    plaidConnectedFeed,
                                    plaidConnectedFeedName,
                                    addNewCard.data.selectedCountry,
                                    getDomainNameForPolicy(policyID),
                                    JSON.stringify(metadata?.accounts),
                                    addNewCard.data.statementPeriodEnd,
                                    addNewCard.data.statementPeriodEndDay,
                                    '',
                                );
                                // eslint-disable-next-line @typescript-eslint/no-deprecated
                                InteractionManager.runAfterInteractions(() => {
                                    setAssignCardStepAndData({
                                        cardToAssign: {
                                            plaidAccessToken: publicToken,
                                            institutionId: plaidConnectedFeed,
                                            plaidConnectedFeedName,
                                            plaidAccounts: metadata?.accounts,
                                        },
                                        currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION,
                                    });
                                });
                                return;
                            }
                            setAssignCardStepAndData({
                                cardToAssign: {
                                    plaidAccessToken: publicToken,
                                    institutionId: plaidConnectedFeed,
                                    plaidConnectedFeedName,
                                    plaidAccounts: metadata?.accounts,
                                },
                                currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION,
                            });
                            return;
                        }

                        setAddNewCompanyCardStepAndData({
                            step: CONST.COMPANY_CARDS.STEP.SELECT_STATEMENT_CLOSE_DATE,
                            data: {
                                publicToken,
                                plaidConnectedFeed,
                                plaidConnectedFeedName,
                                plaidAccounts: metadata?.accounts,
                            },
                        });
                    }}
                    onError={handlePlaidLinkError}
                    onEvent={(event) => {
                        setPlaidEvent(event);
                        // Limit the number of times a user can submit Plaid credentials
                        if (event === 'SUBMIT_CREDENTIALS') {
                            handleRestrictedEvent(event);
                        }
                    }}
                    // User prematurely exited the Plaid flow
                    // eslint-disable-next-line react/jsx-props-no-multi-spaces
                    onExit={() => {
                        onExit?.();
                        handleBackButtonPress();
                    }}
                />
            );
        }

        if (plaidDataErrorMessage) {
            return <Text style={[styles.formError, styles.mh5]}>{plaidDataErrorMessage}</Text>;
        }

        if (plaidData?.isLoading) {
            return (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            );
        }
    };

    return (
        <ScreenWrapper
            testID="PlaidConnectionStep"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />
            {isPlaidDisabled ? (
                <Text style={[styles.formError, styles.ph5, styles.mv3]}>{translate('bankAccount.error.tooManyAttempts')}</Text>
            ) : (
                <FullPageOfflineBlockingView>{renderPlaidLink()}</FullPageOfflineBlockingView>
            )}
        </ScreenWrapper>
    );
}

export default PlaidConnectionStep;
