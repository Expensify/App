import React from 'react';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import CONST from '@src/CONST';
import WorkspaceTravelInvoicingSection from './WorkspaceTravelInvoicingSection';

type GetStartedTravelProps = {
    policyID: string;
};

function GetStartedTravel({policyID}: GetStartedTravelProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['LuggageWithLines', 'NewWindow'] as const);
    const {isBetaEnabled} = usePermissions();
    const isTravelInvoicingEnabled = isBetaEnabled(CONST.BETAS.TRAVEL_INVOICING);

    const handleManageTravel = () => {
        openTravelDotLink(policyID);
    };

    return (
        <>
            <Section
                title={translate('workspace.moreFeatures.travel.travelInvoicing.travelBookingSection.title')}
                subtitle={translate('workspace.moreFeatures.travel.travelInvoicing.travelBookingSection.subtitle')}
                titleStyles={[styles.accountSettingsSectionTitle]}
                subtitleMuted
                isCentralPane
            >
                <MenuItem
                    title={translate('workspace.moreFeatures.travel.bookOrManageYourTrip.ctaText')}
                    icon={icons.LuggageWithLines}
                    onPress={handleManageTravel}
                    shouldShowRightIcon
                    iconRight={icons.NewWindow}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                />
            </Section>
            {isTravelInvoicingEnabled && <WorkspaceTravelInvoicingSection policyID={policyID} />}
        </>
    );
}

export default GetStartedTravel;
