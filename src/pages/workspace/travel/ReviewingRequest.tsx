import React from 'react';
import Button from '@components/Button';
import FeatureList from '@components/FeatureList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';

function ReviewingRequest() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['PendingTravel'] as const);

    return (
        <FeatureList
            menuItems={[]}
            title={translate('workspace.moreFeatures.travel.reviewingRequest.title')}
            subtitle={translate('workspace.moreFeatures.travel.reviewingRequest.subtitle')}
            footer={
                <Button
                    text={translate('workspace.moreFeatures.travel.reviewingRequest.ctaText')}
                    style={[styles.w100]}
                    isDisabled
                    large
                />
            }
            illustrationBackgroundColor={colors.tangerine700}
            illustration={illustrations.PendingTravel}
            illustrationStyle={styles.travelCardIllustration}
            illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
            titleStyles={styles.textHeadlineH1}
        />
    );
}

export default ReviewingRequest;
