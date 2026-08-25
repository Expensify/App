import Button from '@components/ButtonComposed';
import FeatureList from '@components/FeatureList';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearTravelSignupRequest, getTravelRiskApproval} from '@libs/actions/Travel';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';

type ReviewingRequestProps = {
    policyID: string;
};

function ReviewingRequest({policyID}: ReviewingRequestProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['PendingTravel']);

    useFocusEffect(
        useCallback(() => {
            getTravelRiskApproval(policyID).then((isTravelRiskApproved) => {
                if (!isTravelRiskApproved) {
                    return;
                }
                clearTravelSignupRequest();
            });
        }, [policyID]),
    );

    return (
        <FeatureList
            menuItems={[]}
            title={translate('workspace.moreFeatures.travel.reviewingRequest.title')}
            subtitle={translate('workspace.moreFeatures.travel.reviewingRequest.subtitle')}
            footer={
                <Button
                    style={[styles.w100]}
                    isDisabled
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.Text>{translate('workspace.moreFeatures.travel.reviewingRequest.ctaText')}</Button.Text>
                </Button>
            }
            illustrationBackgroundColor={colors.tangerine700}
            illustration={illustrations.PendingTravel}
            illustrationStyle={styles.travelCardIllustration}
            illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter, styles.cardSectionIllustrationContainer]}
            titleStyles={styles.textHeadlineH1}
        />
    );
}

export default ReviewingRequest;
