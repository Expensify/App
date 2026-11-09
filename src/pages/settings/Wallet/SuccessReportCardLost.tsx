import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import React from 'react';

function SuccessReportCardLost({cardDetailsPath}: {cardDetailsPath: Route}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['CardReplacementSuccess']);

    return (
        <ConfirmationPageDefault
            heading={translate('reportCardLostOrDamaged.successTitle')}
            description={translate('reportCardLostOrDamaged.successDescription')}
            illustration={illustrations.CardReplacementSuccess}
            onButtonPress={() => {
                // Going back with compareParams: false collapses the flow onto the deleted card route and
                // replaces its cardID with the replacement card instead of a stale/NotFound route.
                Navigation.goBack(cardDetailsPath, {compareParams: false});
            }}
            buttonText={translate('common.buttonConfirm')}
            illustrationStyle={[styles.w100, StyleUtils.getSuccessReportCardLostIllustrationStyle()]}
            innerContainerStyle={styles.ph0}
            descriptionStyle={[styles.ph4, styles.textSupporting]}
        />
    );
}

export default SuccessReportCardLost;
