import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import {CardReplacementSuccess} from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SuccessReportCardLost({cardID}: {cardID: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ConfirmationPage
            heading={translate('reportCardLostOrDamaged.successTitle')}
            description={translate('reportCardLostOrDamaged.successDescription')}
            illustration={CardReplacementSuccess}
            shouldShowButton
            onButtonPress={() => {
                Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
            }}
            buttonText={translate('common.buttonConfirm')}
            containerStyle={styles.h100}
            illustrationStyle={{...styles.w100, height: getPlatform() === CONST.PLATFORM.IOS ? '60%' : 'auto'}}
            innerContainerStyle={styles.ph0}
            descriptionStyle={styles.ph4}
        />
    );
}

export default SuccessReportCardLost;
