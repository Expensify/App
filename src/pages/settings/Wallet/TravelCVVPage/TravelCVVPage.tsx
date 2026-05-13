import {useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RESIZE_MODES from '@components/Image/resizeModes';
import ImageSVG from '@components/ImageSVG';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetValidateActionCodeSent} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {useTravelCVVActions, useTravelCVVState} from './TravelCVVContextProvider';

/**
 * TravelCVVPage - Displays the Travel CVV reveal interface.
 * Shows a description of the travel card and allows users to reveal the CVV.
 * CVV is stored only in React Context state and never persisted in Onyx.
 */
function TravelCVVPage() {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['TravelCVV']);

    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);
    const [, lockAccountDetailsMetadata] = useOnyx(ONYXKEYS.NVP_PRIVATE_LOCK_ACCOUNT_DETAILS);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

    // Get CVV from context - shared with TravelCVVVerifyAccountPage
    const {cvv} = useTravelCVVState();
    const {setCvv} = useTravelCVVActions();

    // Clear CVV when the page unmounts (e.g. backdrop close) so it doesn't
    // remain visible the next time the page is opened
    useEffect(() => () => setCvv(null), [setCvv]);

    const isSignedInAsDelegate = !!account?.delegatedAccess?.delegate || false;
    const isLoadingAccount = isLoadingOnyxValue(accountMetadata);
    const isLoadingLockAccountDetails = isLoadingOnyxValue(lockAccountDetailsMetadata);
    const isVerifyAccountInStack = useNavigationState((state) => state.routes.some((route) => route.name === SCREENS.SETTINGS.WALLET.TRAVEL_CVV_VERIFY_ACCOUNT));

    // Auto-navigate to the magic code screen on first mount so the user
    // doesn't have to click "Reveal Details" manually.
    const hasAutoNavigatedRef = useRef(false);
    useEffect(() => {
        if (hasAutoNavigatedRef.current) {
            return;
        }
        // If the verify-account (magic code) screen is already in the navigation
        // stack, the user has previously visited it during this mount cycle (e.g.
        // they completed or cancelled the magic code flow and returned here).
        // Skip auto-navigation so we don't push a duplicate screen. This check
        // runs before the loading guards because it doesn't depend on Onyx data.
        if (isVerifyAccountInStack) {
            hasAutoNavigatedRef.current = true;
            return;
        }
        if (isLoadingAccount || isLoadingLockAccountDetails) {
            return;
        }
        // Permanent conditions — set the ref so we never retry auto-navigation.
        // If CVV is already revealed there's no reason to navigate to the magic
        // code screen, and delegates are not allowed to request one. Unlike the
        // transient guards below (offline / locked), these won't change during
        // this mount, so we mark the ref to stop future effect re-runs.
        if (cvv || isSignedInAsDelegate) {
            hasAutoNavigatedRef.current = true;
            return;
        }
        // Transient conditions — we intentionally do NOT set hasAutoNavigatedRef here.
        // isOffline and isAccountLocked can change at any time (e.g. the user regains
        // connectivity or the account is unlocked). By leaving the ref unset, the
        // effect will re-run and auto-navigate once the blocking condition clears,
        // rather than permanently giving up and forcing the user to tap "Reveal Details".
        if (isOffline || isAccountLocked) {
            return;
        }
        hasAutoNavigatedRef.current = true;
        resetValidateActionCodeSent();
        Navigation.navigate(ROUTES.SETTINGS_WALLET_TRAVEL_CVV_VERIFY_ACCOUNT);
    }, [isLoadingAccount, isLoadingLockAccountDetails, cvv, isSignedInAsDelegate, isOffline, isAccountLocked, isVerifyAccountInStack]);

    const handleRevealDetailsPress = useCallback(() => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        // ValidateCodeActionContent only sends a magic code when validateCodeSent is false
        // so we need to reset it to ensure a code is always sent
        resetValidateActionCodeSent();
        // Navigate to the verify account page
        Navigation.navigate(ROUTES.SETTINGS_WALLET_TRAVEL_CVV_VERIFY_ACCOUNT);
    }, [isAccountLocked, showLockedAccountModal]);

    return (
        <ScreenWrapper
            testID="TravelCVVPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('walletPage.travelCVV.title')}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5]}>
                    <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.pt3, styles.pb5]}>
                        <ImageSVG
                            src={illustrations.TravelCVV}
                            contentFit={RESIZE_MODES.contain}
                            style={styles.travelCCVIllustration}
                        />
                    </View>

                    <View style={[styles.mt5, styles.mb12]}>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('walletPage.travelCVV.description')}</Text>
                    </View>

                    <MenuItemWithTopDescription
                        description={translate('cardPage.cardDetails.cvv')}
                        title={cvv ?? '•••'}
                        interactive={false}
                        wrapperStyle={[styles.pt0, styles.ph0]}
                        titleStyle={styles.walletCardNumber}
                        copyable={!!cvv}
                        shouldShowRightComponent
                        rightComponent={
                            !isSignedInAsDelegate && !cvv ? (
                                <Button
                                    text={translate('cardPage.cardDetails.revealDetails')}
                                    onPress={handleRevealDetailsPress}
                                    isDisabled={isOffline}
                                />
                            ) : undefined
                        }
                    />
                </ScrollView>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default TravelCVVPage;
