import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function CardSectionDataEmpty() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const openAddPaymentCardScreen = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, []);
    const handleAddPaymentCardPress = () => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        openAddPaymentCardScreen();
    };
    return (
        <>
            <Button
                text={translate('subscription.cardSection.addCardButton')}
                onPress={handleAddPaymentCardPress}
                style={styles.w100}
                success
                large
            />
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </>
    );
}

CardSectionDataEmpty.displayName = 'CardSectionDataEmpty';

export default CardSectionDataEmpty;
