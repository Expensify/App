import React from 'react';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyTravelSettings} from '@libs/actions/Policy/Travel';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import WorkspaceTravelInvoicingSection from './WorkspaceTravelInvoicingSection';

type GetStartedTravelProps = {
    policyID: string;
};

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['LuggageWithLines', 'NewWindow'] as const);
    const {isBetaEnabled} = usePermissions();
    const isTravelInvoicingEnabled = isBetaEnabled(CONST.BETAS.TRAVEL_INVOICING);
    const isPreventSpotnanaTravelEnabled = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);

    const autoAddTripName = policy?.travelSettings?.autoAddTripName !== false;

    const toggleAutoAddTripName = (enabled: boolean) => {
        setPolicyTravelSettings(policyID, {autoAddTripName: enabled});
    };

    const handleManageTravel = () => {
        // TODO: Show the prevention modal when the beta is enabled
        if (isPreventSpotnanaTravelEnabled) {
            return;
        }
        openTravelDotLink(policyID);
    };

    return (
        <>
            <Section
                title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.title')}
                subtitle={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.subtitle')}
                titleStyles={[styles.accountSettingsSectionTitle]}
                subtitleMuted
                isCentralPane
            >
                <MenuItem
                    title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.ctaText')}
                    icon={icons.LuggageWithLines}
                    onPress={handleManageTravel}
                    shouldShowRightIcon
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.BOOK_TRAVEL_BUTTON}
                    iconRight={icons.NewWindow}
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
            {isTravelInvoicingEnabled && <WorkspaceTravelInvoicingSection policyID={policyID} />}
        </>
    );
}

export default GetStartedTravel;
