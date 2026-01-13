import React from 'react';
import BookTravelButton from '@components/BookTravelButton';
import FeatureList from '@components/FeatureList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';

type GetStartedTravelProps = {
    policyID: string;
};

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const handleCtaPress = () => {};

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['PendingTravel'] as const);

    return (
        <FeatureList
            menuItems={[]}
            title={translate('workspace.moreFeatures.travel.getStarted.title')}
            subtitle={translate('workspace.moreFeatures.travel.getStarted.subtitle')}
            onCtaPress={handleCtaPress}
            illustrationBackgroundColor={colors.tangerine700}
            illustration={illustrations.PendingTravel}
            illustrationStyle={styles.travelCardIllustration}
            illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
            titleStyles={styles.textHeadlineH1}
            footer={
                <BookTravelButton
                    text={translate('workspace.moreFeatures.travel.getStarted.ctaText')}
                    activePolicyID={policyID}
                    shouldShowVerifyAccountModal={false}
                />
            }
        />
    );
}

export default GetStartedTravel;
