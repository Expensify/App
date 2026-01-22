import React from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import * as Expensicons from '@components/Icon/Expensicons';
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
            isCentralPane
        >
            <MenuItem
                title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.manageTravel')}
                icon={Expensicons.LuggageWithLines}
                onPress={handleManageTravel}
                shouldShowRightIcon
                iconRight={Expensicons.NewWindow}
                wrapperStyle={styles.sectionMenuItemTopDescription}
            />

            <View style={styles.mt5}>
                <ToggleSettingOptionRow
                    title={translate('workspace.moreFeatures.travel.settings.title')}
                    subtitle={translate('workspace.moreFeatures.travel.settings.subtitle')}
                    switchAccessibilityLabel={translate('workspace.moreFeatures.travel.settings.title')}
                    isActive={autoAddTripName}
                    onToggle={toggleAutoAddTripName}
                    pendingAction={policy?.pendingFields?.travelSettings}
                />
            </View>
        </Section>
    );
}

export default GetStartedTravel;
