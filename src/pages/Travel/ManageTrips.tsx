import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {Linking, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
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
    const policy = usePolicy(activePolicyID);
    const contactMethod = UserUtils.getContactMethod();

    const [ctaErrorMessage, setCtaErrorMessage] = useState('');

    if (isEmptyObject(policy)) {
        return <FullScreenLoadingIndicator />;
    }

    const hasAcceptedTravelTerms = travelSettings?.hasAcceptedTerms;
    const hasPolicyAddress = !isEmptyObject(policy?.address);

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
                        if (Str.isSMSLogin(contactMethod)) {
                            setCtaErrorMessage(translate('travel.phoneError'));
                            return;
                        }
                        if (!hasPolicyAddress) {
                            Navigation.navigate(ROUTES.WORKSPACE_PROFILE_ADDRESS.getRoute(activePolicyID ?? '-1', Navigation.getActiveRoute()));
                            return;
                        }
                        if (!hasAcceptedTravelTerms) {
                            Navigation.navigate(ROUTES.TRAVEL_TCS);
                            return;
                        }
                        if (ctaErrorMessage) {
                            setCtaErrorMessage('');
                        }
                        Link.openTravelDotLink(activePolicyID)?.catch(() => {
                            setCtaErrorMessage(translate('travel.errorMessage'));
                        });
                    }}
                    ctaErrorMessage={ctaErrorMessage}
                    illustration={LottieAnimations.TripsEmptyState}
                    illustrationStyle={[styles.mv4]}
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
