import React from 'react';
import {View} from 'react-native';
import BookTravelButton from '@components/BookTravelButton';
import FeatureList from '@components/FeatureList';
import {PendingTravel} from '@components/Icon/Illustrations';
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
    return (
        <View>
            <FeatureList
                menuItems={[]}
                title={translate('workspace.moreFeatures.travel.getStarted.title')}
                subtitle={translate('workspace.moreFeatures.travel.getStarted.subtitle')}
                onCtaPress={handleCtaPress}
                illustrationBackgroundColor={colors.tangerine700}
                illustration={PendingTravel}
                illustrationStyle={styles.travelCardIllustration}
                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
                titleStyles={styles.textHeadlineH1}
                footer={
                    <BookTravelButton
                        text={translate('workspace.moreFeatures.travel.getStarted.ctaText')}
                        activePolicyID={policyID}
                    />
                }
            />
        </View>
    );
}

GetStartedTravel.displayName = 'GetStartedTravel';
export default GetStartedTravel;
