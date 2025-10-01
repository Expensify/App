import React from 'react';
import {View} from 'react-native';
import BookTravelButton from '@components/BookTravelButton';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import {EmptyStateTravel} from '@components/Icon/Illustrations';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';

type GetStartedTravelProps = {
    policyID: string;
};

const tripsFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.PiggyBank,
        translationKey: 'travel.features.saveMoney',
    },
    {
        icon: Illustrations.TravelAlerts,
        translationKey: 'travel.features.alerts',
    },
];

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const handleCtaPress = () => {};

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <View>
            <FeatureList
                menuItems={tripsFeatures}
                title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.title')}
                subtitle={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.subtitle')}
                onCtaPress={handleCtaPress}
                illustrationBackgroundColor={colors.blue600}
                illustration={EmptyStateTravel}
                illustrationStyle={styles.emptyStateCardIllustration}
                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart]}
                titleStyles={styles.textHeadlineH1}
                footer={
                    <BookTravelButton
                        text={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.ctaText')}
                        activePolicyID={policyID}
                    />
                }
            />
        </View>
    );
}

GetStartedTravel.displayName = 'GetStartedTravel';
export default GetStartedTravel;
