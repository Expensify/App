import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type CardAddedToWalletPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_ADDED_TO_WALLET>;

const PAYMENT_MARK_HEIGHT = 48;
const APPLE_PAY_MARK_WIDTH = Math.round((PAYMENT_MARK_HEIGHT * 82) / 52);
const CONTACTLESS_MARK_WIDTH = Math.round((PAYMENT_MARK_HEIGHT * 95) / 56);

function CardAddedToWalletPage({
    route: {
        params: {cardID = ''},
    },
}: CardAddedToWalletPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardAppleWalletIllustration']);
    const icons = useMemoizedLazyExpensifyIcons(['Contactless', 'ApplePayMark']);

    const goToCardDetails = () => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID={CardAddedToWalletPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('cardPage.cardAddedToWalletPage.title')}
                onBackButtonPress={goToCardDetails}
            />
            <ConfirmationPage
                heading={translate('cardPage.cardAddedToWalletPage.description')}
                illustration={illustrations.ExpensifyCardAppleWalletIllustration}
                shouldShowButton
                descriptionComponent={
                    <View style={[styles.alignItemsCenter, styles.w100, styles.ph8]}>
                        <Text style={[styles.textAlignCenter, styles.textSupporting, styles.mb2]}>{translate('cardPage.cardAddedToWalletPage.firstSupportingText')}</Text>
                        <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate('cardPage.cardAddedToWalletPage.secondSupportingText')}</Text>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap5, styles.mt7]}>
                            <Icon
                                width={APPLE_PAY_MARK_WIDTH}
                                height={PAYMENT_MARK_HEIGHT}
                                contentFit="contain"
                                src={icons.ApplePayMark}
                                accessibilityLabel={translate('cardPage.cardAddedToWalletPage.applePayMark')}
                            />
                            <Icon
                                width={CONTACTLESS_MARK_WIDTH}
                                height={PAYMENT_MARK_HEIGHT}
                                contentFit="contain"
                                fill={theme.icon}
                                src={icons.Contactless}
                                accessibilityLabel={translate('cardPage.cardAddedToWalletPage.contactlessMark')}
                            />
                        </View>
                    </View>
                }
                onButtonPress={goToCardDetails}
                buttonText={translate('cardPage.cardAddedToWalletPage.buttonText')}
                headingStyle={styles.ph8}
            />
        </ScreenWrapper>
    );
}

CardAddedToWalletPage.displayName = 'CardAddedToWalletPage';

export default CardAddedToWalletPage;
