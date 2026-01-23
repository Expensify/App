import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function WorkspaceTimeTrackingHourlyRateSection({policyID}: {policyID: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const horizontalPadding = shouldUseNarrowLayout ? styles.ph5 : styles.ph8;

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});

    return (
        <Section
            title={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
            subtitle={translate('workspace.moreFeatures.timeTracking.subtitle')}
            containerStyles={[styles.ph0, shouldUseNarrowLayout ? styles.pt5 : styles.pt8]}
            subtitleStyles={horizontalPadding}
            titleStyles={[styles.accountSettingsSectionTitle, horizontalPadding]}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <MenuItemWithTopDescription
                shouldShowLoadingSpinnerIcon={!policy}
                key={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
                shouldShowRightIcon
                title={policy ? convertAmountToDisplayString(getDefaultTimeTrackingRate(policy), policy?.outputCurrency) : ''}
                description={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TIME_TRACKING_RATE.getRoute(policyID))}
                style={horizontalPadding}
            />
        </Section>
    );
}

export default WorkspaceTimeTrackingHourlyRateSection;
