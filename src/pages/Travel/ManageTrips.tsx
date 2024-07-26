import React from 'react';
import {Linking, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicy} from '@libs/PolicyUtils';
import colors from '@styles/theme/colors';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    const hasAcceptedTravelTerms = travelSettings?.hasAcceptedTerms;
    const hasPolicyAddress = !isEmptyObject(getPolicy(activePolicyID)?.address);

    const navigateToBookTravelDemo = () => {
        Linking.openURL(CONST.BOOK_TRAVEL_DEMO_URL);
    };

    return (
        <ScrollView contentContainerStyle={styles.pt3}>
            <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <FeatureList
                    menuItems={tripsFeatures}
                    title={translate('travel.title')}
                    subtitle={translate('travel.subtitle')}
                    ctaText={translate('travel.bookTravel')}
                    ctaAccessibilityLabel={translate('travel.bookTravel')}
                    onCtaPress={() => {
                        if (!hasPolicyAddress) {
                            Navigation.navigate(ROUTES.WORKSPACE_PROFILE_ADDRESS.getRoute(activePolicyID ?? '-1'));
                            return;
                        }
                        if (!hasAcceptedTravelTerms) {
                            Navigation.navigate(ROUTES.TRAVEL_TCS);
                            return;
                        }
                        Link.openTravelDotLink(activePolicyID);
                    }}
                    illustration={Illustrations.EmptyStateTravel}
                    illustrationStyle={[styles.mv4, styles.tripIllustrationSize]}
                    secondaryButtonText={translate('travel.bookDemo')}
                    secondaryButtonAccessibilityLabel={translate('travel.bookDemo')}
                    onSecondaryButtonPress={navigateToBookTravelDemo}
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
