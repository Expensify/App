import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

function CardSectionDataEmpty() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Button
            text={translate('subscription.cardSection.addCardButton')}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD)}
            style={styles.w100}
            success
            large
        />
    );
}

CardSectionDataEmpty.displayName = 'CardSectionDataEmpty';

export default CardSectionDataEmpty;
