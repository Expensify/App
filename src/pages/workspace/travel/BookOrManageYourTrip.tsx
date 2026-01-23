import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyTravelSettings} from '@libs/actions/Policy/Travel';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

type GetStartedTravelProps = {
    policyID: string;
};

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const autoAddTripName = policy?.travelSettings?.autoAddTripName !== false;

    const toggleAutoAddTripName = (enabled: boolean) => {
        setPolicyTravelSettings(policyID, {autoAddTripName: enabled});
    };

    const handleManageTravel = () => {
        openTravelDotLink(policyID);
    };

    return (
        <Section
            title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.title')}
            subtitle={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.subtitle')}
            titleStyles={[styles.accountSettingsSectionTitle]}
            subtitleMuted
            isCentralPane
        >
            <MenuItem
                title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.ctaText')}
                icon={Expensicons.LuggageWithLines}
                onPress={handleManageTravel}
                shouldShowRightIcon
                iconRight={Expensicons.NewWindow}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
            />
            <ToggleSettingOptionRow
                    title={translate('workspace.moreFeatures.travel.settings.autoAddTripName.title')}
                    subtitle={translate('workspace.moreFeatures.travel.settings.autoAddTripName.subtitle')}
                    shouldPlaceSubtitleBelowSwitch
                    switchAccessibilityLabel={translate('workspace.moreFeatures.travel.settings.autoAddTripName.title')}
                    isActive={autoAddTripName}
                    onToggle={toggleAutoAddTripName}
                    pendingAction={policy?.pendingFields?.travelSettings}
                    wrapperStyle={styles.mt3}
                />
        </Section>
    );
}

export default GetStartedTravel;
