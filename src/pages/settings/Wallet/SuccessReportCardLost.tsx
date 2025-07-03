import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import {CardReplacementSuccess} from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function SuccessReportCardLost({cardID}: {cardID: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

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
            illustrationStyle={[styles.w100, StyleUtils.getSuccessReportCardLostIllustrationStyle()]}
            innerContainerStyle={styles.ph0}
            descriptionStyle={[styles.ph4, styles.textSupporting]}
        />
    );
}

SuccessReportCardLost.displayName = 'SuccessReportCardLost';
export default SuccessReportCardLost;
