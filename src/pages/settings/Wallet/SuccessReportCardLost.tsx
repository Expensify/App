import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import {MushroomTopHat} from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function SuccessReportCardLost({cardID}: {cardID: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ConfirmationPage
            heading="Your new card is on the way!"
            description="You'll need to activate it once it arrives in a few business days. In the meantime, your virtual card is ready to use."
            illustration={MushroomTopHat}
            shouldShowButton
            onButtonPress={() => {
                Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
            }}
            buttonText={translate('common.buttonConfirm')}
            containerStyle={styles.h100}
        />
    );
}

export default SuccessReportCardLost;
