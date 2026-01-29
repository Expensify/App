import {filterPersonalCards} from '@selectors/Card';
import React, {useCallback, useContext, useState} from 'react';
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
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {revealVirtualCardDetails} from '@libs/actions/Card';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {shouldShowMissingDetailsPage} from '@libs/PersonalDetailsUtils';
import {getTravelInvoicingCard} from '@libs/TravelInvoicingUtils';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Errors} from '@src/types/onyx/OnyxCommon';

/**
 * TravelCVVPage - Displays the Travel CVV reveal interface.
 * Shows a description of the travel card and allows users to reveal the CVV.
 * CVV is stored only in local component state and never persisted in Onyx.
 */
function TravelCVVPage() {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['TravelCVV']);

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});

    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);

    // Local state for CVV - never persisted in Onyx for security
    const [cvv, setCvv] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [validateError, setValidateError] = useState<Errors>({});

    const travelCard = getTravelInvoicingCard(cardList);

    const primaryLogin = account?.primaryLogin ?? '';
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
        // Switch to verification mode - shows ValidateCodeActionContent in RHP
        setIsVerifying(true);
    }, [isAccountLocked, showLockedAccountModal, travelCard, privatePersonalDetails]);

    const handleValidateCode = (validateCode: string) => {
        if (!travelCard?.cardID) {
            return;
        }

        setIsLoading(true);

        // Call revealVirtualCardDetails and only extract CVV
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        revealVirtualCardDetails(travelCard.cardID, validateCode)
            .then((cardDetails) => {
                // Only store CVV in local state - never persist PAN or other details
                setCvv(cardDetails.cvv ?? null);
                setIsVerifying(false);
                setValidateError({});
            })
            .catch((error: TranslationPaths) => {
                setValidateError(getMicroSecondOnyxErrorWithTranslationKey(error));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleCloseVerification = useCallback(() => {
        resetValidateActionCodeSent();
        setIsVerifying(false);
        setValidateError({});
    }, []);

    // When in verification mode, show magic code input directly in RHP
    if (isVerifying) {
        return (
            <ScreenWrapper
                testID="TravelCVVPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                <ValidateCodeActionContent
                    title={translate('cardPage.validateCardTitle')}
                    descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin)}
                    sendValidateCode={() => requestValidateCodeAction()}
                    validateCodeActionErrorField="revealExpensifyCardDetails"
                    handleSubmitForm={handleValidateCode}
                    validateError={validateError}
                    clearError={() => setValidateError({})}
                    onClose={handleCloseVerification}
                    isLoading={isLoading}
                />
            </ScreenWrapper>
        );
    }

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
                    <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.pv10]}>
                        <ImageSVG
                            src={illustrations.TravelCVV}
                            contentFit={RESIZE_MODES.contain}
                            style={styles.travelCCVIllustration}
                        />
                    </View>

                    <View style={[styles.mb12, styles.gap4]}>
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

TravelCVVPage.displayName = 'TravelCVVPage';

export default TravelCVVPage;
