import React, {useCallback} from 'react';
import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

function CardSectionDataEmpty() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
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
        <Button
            text={translate('subscription.cardSection.addCardButton')}
            onPress={handleAddPaymentCardPress}
            style={styles.w100}
            success
            large
        />
    );
}

export default CardSectionDataEmpty;
