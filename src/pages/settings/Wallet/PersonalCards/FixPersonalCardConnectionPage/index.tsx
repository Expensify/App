import React, {useEffect, useRef, useState} from 'react';
import type {PlaidLinkOnSuccessMetadata} from 'react-plaid-link/src/types';
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import openBankConnection from '@pages/settings/Wallet/PersonalCards/steps/BankConnection/openBankConnection';
import {handleRestrictedEvent} from '@userActions/App';
import {setPlaidEvent} from '@userActions/BankAccounts';
import {updatePersonalCardConnection} from '@userActions/PersonalCards';
import {addPersonalPlaidCard, openPlaidCompanyCardLogin} from '@userActions/Plaid';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useFixPersonalCardConnection from './useFixPersonalCardConnection';

type FixPersonalCardConnectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_FIX_CONNECTION>;

let customWindow: Window | null = null;

function FixPersonalCardConnectionPage({route}: FixPersonalCardConnectionPageProps) {
    const {cardID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['PendingBank']);
    const {card, bankDisplayName, url, isOffline, isPlaid, country} = useFixPersonalCardConnection(cardID);

    const [plaidLinkToken] = useOnyx(ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN);
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);

    const hasRequestedPlaidToken = useRef(false);
    const lastScrapeResultRef = useRef(card?.lastScrapeResult);
    useEffect(() => {
        lastScrapeResultRef.current = card?.lastScrapeResult;
    }, [card?.lastScrapeResult]);
    // Snapshot any stale Plaid token left over in Onyx from a previous Plaid flow.
    // We only open Plaid once we receive a token that differs from this snapshot — otherwise an
    // initial mount with the stale token starts a create/destroy cycle that leaves the SDK stuck.
    const [stalePlaidLinkToken] = useState(plaidLinkToken);
    const hasFreshPlaidToken = !!plaidLinkToken && plaidLinkToken !== stalePlaidLinkToken;
    const [isPlaidScriptLoaded, setIsPlaidScriptLoaded] = useState(() => typeof window !== 'undefined' && typeof window.Plaid?.create === 'function');

    const plaidErrors = plaidData?.errors;
    const plaidDataErrorMessage = !isEmptyObject(plaidErrors) ? (Object.values(plaidErrors).at(0) ?? '') : '';

    const onOpenBankConnectionFlow = () => {
        if (!url) {
            return;
        }
        customWindow = openBankConnection(url);
    };

    const handleBackButtonPress = () => {
        customWindow?.close();
        Navigation.goBack();
    };

    useEffect(() => {
        if (!isPlaid || isOffline || hasRequestedPlaidToken.current) {
            return;
        }
        hasRequestedPlaidToken.current = true;
        openPlaidCompanyCardLogin(country, '', undefined, true, cardID);
    }, [isPlaid, isOffline, country, cardID]);

    // Ensure the Plaid Link SDK is loaded. react-plaid-link normally injects it via <PlaidLink>,
    // but we bypass that component, so we load it ourselves if it isn't already present.
    useEffect(() => {
        if (!isPlaid || typeof window === 'undefined' || isPlaidScriptLoaded) {
            return;
        }
        const PLAID_SRC = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
        const handleLoad = () => setIsPlaidScriptLoaded(true);
        // Already loaded globally in this session
        if (typeof window.Plaid?.create === 'function') {
            handleLoad();
            return;
        }
        let scriptEl = document.querySelector<HTMLScriptElement>(`script[src="${PLAID_SRC}"]`);
        if (!scriptEl) {
            scriptEl = document.createElement('script');
            scriptEl.src = PLAID_SRC;
            scriptEl.async = true;
            document.body.appendChild(scriptEl);
        }
        scriptEl.addEventListener('load', handleLoad, {once: true});
        return () => {
            scriptEl?.removeEventListener('load', handleLoad);
        };
    }, [isPlaid, isPlaidScriptLoaded]);

    useEffect(() => {
        if (isPlaid || !url || isOffline) {
            return;
        }
        customWindow = openBankConnection(url);

        return () => {
            customWindow?.close();
        };
    }, [isPlaid, url, isOffline]);

    // Open Plaid Link directly via window.Plaid.create when a fresh token arrives.
    // We bypass react-plaid-link's usePlaidLink hook because its internal state gets stuck
    // under React 18 Strict Mode: cleanup destroys the Plaid factory while the hook's `plaid`
    // state still holds the now-dead reference, leaving `ready` false forever.
    useEffect(() => {
        if (!isPlaid || !hasFreshPlaidToken || !plaidLinkToken || !isPlaidScriptLoaded || typeof window === 'undefined' || typeof window.Plaid?.create !== 'function') {
            return;
        }
        const handler = window.Plaid.create({
            token: plaidLinkToken,
            onSuccess: (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
                Log.info('[PlaidLink] Fix personal card success');
                const plaidConnectedFeed = metadata?.institution?.institution_id;
                const plaidAccounts = metadata?.accounts;
                if (!plaidConnectedFeed || !plaidAccounts?.length) {
                    return;
                }
                addPersonalPlaidCard(publicToken, plaidConnectedFeed, country, JSON.stringify(plaidAccounts));
                // Trigger a scrape so the broken-connection error clears immediately.
                // The non-Plaid flow relies on useFixPersonalCardConnection's effect, which
                // doesn't fire here because we navigate away before isCardBroken flips.
                updatePersonalCardConnection(cardID, lastScrapeResultRef.current);
                Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID));
            },
            onExit: () => {
                Navigation.goBack();
            },
            onEvent: (eventName: string) => {
                setPlaidEvent(eventName);
                // Limit the number of times a user can submit Plaid credentials (24-hour lockout)
                if (eventName === 'SUBMIT_CREDENTIALS') {
                    handleRestrictedEvent(eventName);
                }
            },
        });
        handler.open();
        return () => {
            handler.exit(true);
            handler.destroy();
        };
    }, [isPlaid, hasFreshPlaidToken, plaidLinkToken, isPlaidScriptLoaded, country, cardID]);

    const renderPlaid = () => {
        if (isPlaidDisabled) {
            return <Text style={[styles.formError, styles.ph5, styles.mv3]}>{translate('bankAccount.error.tooManyAttempts')}</Text>;
        }
        if (plaidDataErrorMessage) {
            return <Text style={[styles.formError, styles.mh5]}>{plaidDataErrorMessage}</Text>;
        }
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'FixPersonalCardConnectionPage.renderPlaid',
            isPlaidLoading: plaidData?.isLoading,
        };
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                style={styles.flex1}
                reasonAttributes={reasonAttributes}
            />
        );
    };

    return (
        <ScreenWrapper
            testID="FixPersonalCardConnectionPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('personalCard.fixCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                {isPlaid ? (
                    renderPlaid()
                ) : (
                    <BlockingView
                        icon={illustrations.PendingBank}
                        iconWidth={styles.pendingBankCardIllustration.width}
                        iconHeight={styles.pendingBankCardIllustration.height}
                        title={translate('workspace.moreFeatures.companyCards.pendingBankTitle')}
                        CustomSubtitle={
                            <Text style={[styles.textAlignCenter, styles.textSupporting]}>
                                {bankDisplayName && translate('workspace.moreFeatures.companyCards.pendingBankDescription', bankDisplayName)}
                                <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>.
                            </Text>
                        }
                        onLinkPress={onOpenBankConnectionFlow}
                        addBottomSafeAreaPadding
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

FixPersonalCardConnectionPage.displayName = 'FixPersonalCardConnectionPage';

export default FixPersonalCardConnectionPage;
