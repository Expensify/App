import React from 'react';
import {ScrollView, View} from 'react-native';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import colors from '@styles/theme/colors';

const tripsFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.PiggyBank,
        translationKey: 'travel.features.saveMoney',
    },
    {
        icon: Illustrations.Alert,
        translationKey: 'travel.features.alerts',
    },
];

function ManageTrips() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    return (
        <ScrollView contentContainerStyle={styles.pt3}>
            <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <FeatureList
                    menuItems={tripsFeatures}
                    title={translate('travel.title')}
                    subtitle={translate('travel.subtitle')}
                    ctaText={translate('travel.bookOrManage')}
                    ctaAccessibilityLabel={translate('travel.bookOrManage')}
                    onCtaPress={() => console.log('pressed')}
                    illustration={LottieAnimations.Plane}
                    illustrationStyle={styles.travelIllustrationStyle}
                    illustrationBackgroundColor={colors.blue600}
                />
            </View>
        </ScrollView>
    );
}

ManageTrips.displayName = 'ManageTrips';

export default ManageTrips;
