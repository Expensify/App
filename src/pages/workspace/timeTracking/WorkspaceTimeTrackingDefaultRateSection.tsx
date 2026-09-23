import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRow from '@components/MenuItem/presets/MenuItemSectionRow';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getDefaultTimeTrackingRate} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {policyTimeTrackingSelector} from '@src/selectors/Policy';

import React from 'react';

function WorkspaceTimeTrackingDefaultRateSection({policyID, canWriteMoreFeatures}: {policyID: string; canWriteMoreFeatures: boolean}) {
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: policyTimeTrackingSelector,
    });

    return (
        <Section
            title={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
            subtitle={translate('workspace.moreFeatures.timeTracking.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={styles.pt6}
            subtitleMuted
            isCentralPane
        >
            <OfflineWithFeedback pendingAction={policy?.pendingFields?.timeTrackingDefaultRate}>
                <MenuItemSectionRow onPress={canWriteMoreFeatures ? () => Navigation.navigate(ROUTES.WORKSPACE_TIME_TRACKING_DEFAULT_RATE.getRoute(policyID)) : undefined}>
                    <MenuItemField.Row
                        name={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
                        value={policy ? convertToDisplayString(getDefaultTimeTrackingRate(policy), policy.outputCurrency) : undefined}
                    >
                        {canWriteMoreFeatures && <MenuItem.Chevron />}
                    </MenuItemField.Row>
                </MenuItemSectionRow>
            </OfflineWithFeedback>
        </Section>
    );
}

export default WorkspaceTimeTrackingDefaultRateSection;
