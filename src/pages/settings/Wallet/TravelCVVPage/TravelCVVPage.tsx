import React, {useCallback, useContext} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RESIZE_MODES from '@components/Image/resizeModes';
import ImageSVG from '@components/ImageSVG';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
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
import {shouldShowMissingDetailsPage} from '@libs/PersonalDetailsUtils';
import {getTravelInvoicingCard} from '@libs/TravelInvoicingUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useTravelCVVState} from './TravelCVVContextProvider';

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

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const [cardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);

    // Get CVV from context - shared with TravelCVVVerifyAccountPage
    const {cvv} = useTravelCVVState();

    const travelCard = getTravelInvoicingCard(cardList);
    const isSignedInAsDelegate = !!account?.delegatedAccess?.delegate || false;

    const handleRevealDetailsPress = useCallback(() => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        // Check if user needs to add personal details first (UK/EU cards only)
        if (shouldShowMissingDetailsPage(travelCard, privatePersonalDetails)) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_MISSING_DETAILS.getRoute(String(travelCard?.cardID)));
            return;
        }

        // ValidateCodeActionContent only sends a magic code when validateCodeSent is false
        // so we need to reset it to ensure a code is always sent
        resetValidateActionCodeSent();
        // Navigate to the verify account page
        Navigation.navigate(ROUTES.SETTINGS_WALLET_TRAVEL_CVV_VERIFY_ACCOUNT);
    }, [isAccountLocked, showLockedAccountModal, travelCard, privatePersonalDetails]);

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

                    <View style={[styles.mt5, styles.mb12, styles.gap4]}>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('walletPage.travelCVV.description')}</Text>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('walletPage.travelCVV.instructions')}</Text>
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
