import React from 'react';
import {View} from 'react-native';
import BookTravelButton from '@components/BookTravelButton';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyTravelSettings} from '@libs/actions/Policy/Travel';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import colors from '@styles/theme/colors';

type GetStartedTravelProps = {
    policyID: string;
};

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const handleCtaPress = () => {};

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const illustrations = useMemoizedLazyIllustrations(['PiggyBank', 'TravelAlerts', 'EmptyStateTravel'] as const);

    const autoAddTripName = policy?.travelSettings?.autoAddTripName ?? true;

    const toggleAutoAddTripName = (enabled: boolean) => {
        setPolicyTravelSettings(policyID, {autoAddTripName: enabled});
    };

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
        <>
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

            <View style={[styles.mt5]}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3, styles.ph5]}>{translate('workspace.moreFeatures.travel.settings.title')}</Text>

                <ToggleSettingOptionRow
                    title={translate('workspace.moreFeatures.travel.settings.autoAddTripName.title')}
                    subtitle={translate('workspace.moreFeatures.travel.settings.autoAddTripName.subtitle')}
                    switchAccessibilityLabel={translate('workspace.moreFeatures.travel.settings.autoAddTripName.title')}
                    isActive={autoAddTripName}
                    onToggle={toggleAutoAddTripName}
                    pendingAction={policy?.pendingFields?.travelSettings}
                />
            </View>
        </>
    );
}

export default GetStartedTravel;
