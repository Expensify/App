import React from 'react';
import {View} from 'react-native';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import ROUTES from '@src/ROUTES';

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

const ILLUSTRATION_WIDTH = 190;
const ILLUSTRATION_HEIGHT = 172;

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
                    ctaText={translate('travel.bookTravel')}
                    ctaAccessibilityLabel={translate('travel.bookTravel')}
                    onCtaPress={() => {
                        Navigation.navigate(ROUTES.TRAVEL_TCS);
                    }}
                    illustration={Illustrations.EmptyStateTravel}
                    illustrationStyle={[styles.mv4, {width: ILLUSTRATION_WIDTH, height: ILLUSTRATION_HEIGHT}]}
                    illustrationBackgroundColor={colors.blue600}
                    titleStyles={styles.textHeadlineH1}
                    contentPaddingOnLargeScreens={styles.p5}
                />
            </View>
        </ScrollView>
    );
}

ManageTrips.displayName = 'ManageTrips';

export default ManageTrips;
