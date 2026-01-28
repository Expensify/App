import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function WorkspaceTimeTrackingDefaultRateSection({policyID}: {policyID: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});

    return (
        <Section
            title={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
            subtitle={translate('workspace.moreFeatures.timeTracking.defaultHourlyRateSubtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={styles.pt6}
            subtitleMuted
            isCentralPane
        >
            <OfflineWithFeedback pendingAction={policy?.pendingFields?.timeTrackingDefaultRate}>
                <MenuItemWithTopDescription
                    shouldShowLoadingSpinnerIcon={!policy}
                    key={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
                    shouldShowRightIcon
                    title={policy ? convertAmountToDisplayString(getDefaultTimeTrackingRate(policy), policy?.outputCurrency) : ''}
                    description={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TIME_TRACKING_DEFAULT_RATE.getRoute(policyID))}
                    style={styles.sectionMenuItemTopDescription}
                />
            </OfflineWithFeedback>
        </Section>
    );
}

export default WorkspaceTimeTrackingDefaultRateSection;
