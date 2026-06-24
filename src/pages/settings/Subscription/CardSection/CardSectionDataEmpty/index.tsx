import React, {useCallback} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function CardSectionDataEmpty() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CreditCardsNewGreen']);
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const handleAddPaymentCardPress = useCallback(() => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, [isActingAsDelegate, showDelegateNoAccessModal]);

    return (
        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.p5]}>
            <ImageSVG
                src={illustrations.CreditCardsNewGreen}
                width={68}
                height={68}
            />
            <Text
                style={[styles.textAlignCenter, styles.textHeadlineH1, styles.mt5, styles.mb2]}
                accessibilityRole={CONST.ROLE.HEADER}
            >
                {translate('subscription.cardSection.cardNotFound')}
            </Text>
            <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.mb5]}>{translate('subscription.cardSection.subtitle')}</Text>
            <Button
                text={translate('subscription.cardSection.addCardButton')}
                onPress={handleAddPaymentCardPress}
                success
                large
            />
        </View>
    );
}

export default CardSectionDataEmpty;
