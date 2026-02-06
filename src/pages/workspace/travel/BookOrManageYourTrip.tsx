import React from 'react';
import BookTravelButton from '@components/BookTravelButton';
import type {FeatureListItem} from '@components/FeatureList';
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

    const illustrations = useMemoizedLazyIllustrations(['PiggyBank', 'TravelAlerts', 'EmptyStateTravel'] as const);

    const tripsFeatures: FeatureListItem[] = [
        {
            icon: illustrations.PiggyBank,
            translationKey: 'travel.features.saveMoney',
        },
        {
            icon: illustrations.TravelAlerts,
            translationKey: 'travel.features.alerts',
        },
    ];
    return (
        <FeatureList
            menuItems={tripsFeatures}
            title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.title')}
            subtitle={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.subtitle')}
            onCtaPress={handleCtaPress}
            illustrationBackgroundColor={colors.blue600}
            illustration={illustrations.EmptyStateTravel}
            illustrationStyle={styles.travelCardIllustration}
            illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
            titleStyles={styles.textHeadlineH1}
            footer={
                <BookTravelButton
                    text={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.ctaText')}
                    activePolicyID={policyID}
                />
            }
        />
    );
}

export default GetStartedTravel;
