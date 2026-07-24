import ConfirmationPage from '@components/ConfirmationPage';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';

function SuccessReportCardLost({cardID, isFromDomainCardDetail = false}: {cardID: string; isFromDomainCardDetail?: boolean}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['CardReplacementSuccess']);

    return (
        <ConfirmationPage
            heading={translate('reportCardLostOrDamaged.successTitle')}
            description={translate('reportCardLostOrDamaged.successDescription')}
            illustration={illustrations.CardReplacementSuccess}
            shouldShowButton
            onButtonPress={() => {
                // Going back with compareParams: false collapses the flow onto the deleted card route and
                // replaces its cardID with the replacement card instead of a stale/NotFound route.
                const cardDetailRoute = isFromDomainCardDetail ? ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(cardID) : ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID);
                Navigation.goBack(cardDetailRoute, {compareParams: false});
            }}
            buttonText={translate('common.buttonConfirm')}
            containerStyle={styles.h100}
            illustrationStyle={[styles.w100, StyleUtils.getSuccessReportCardLostIllustrationStyle()]}
            innerContainerStyle={styles.ph0}
            descriptionStyle={[styles.ph4, styles.textSupporting]}
        />
    );
}

export default SuccessReportCardLost;
