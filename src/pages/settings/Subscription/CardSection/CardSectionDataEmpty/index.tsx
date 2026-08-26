import Button from '@components/ButtonComposed';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback} from 'react';
import {View} from 'react-native';

const ILLUSTRATION_SIZE = 68;

function CardSectionDataEmpty() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HandCard']);
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const openAddPaymentCardScreen = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, []);
    const handleAddPaymentCardPress = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        openAddPaymentCardScreen();
    };
    return (
        <View style={[styles.alignItemsCenter, styles.gap5, styles.pv4]}>
            <ImageSVG
                src={illustrations.HandCard}
                width={ILLUSTRATION_SIZE}
                height={ILLUSTRATION_SIZE}
            />
            <View style={[styles.alignItemsCenter, styles.gap2, styles.w100]}>
                <Text style={styles.forYouEmptyStateTitle}>{translate('subscription.cardSection.addPaymentCardTitle')}</Text>
                <Text style={styles.forYouEmptyStateDescription}>{translate('subscription.cardSection.subtitle')}</Text>
            </View>
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                onPress={handleAddPaymentCardPress}
            >
                <Button.Text>{translate('subscription.cardSection.addCard')}</Button.Text>
            </Button>
        </View>
    );
}

export default CardSectionDataEmpty;
