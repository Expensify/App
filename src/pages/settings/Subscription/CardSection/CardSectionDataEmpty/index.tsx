import Button from '@components/ButtonComposed';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback} from 'react';

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
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            onPress={handleAddPaymentCardPress}
            style={styles.w100}
        >
            <Button.Text>{translate('subscription.cardSection.addCardButton')}</Button.Text>
        </Button>
    );
}

export default CardSectionDataEmpty;
