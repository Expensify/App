/** Chart header pill that switches a Compliance chart between submitters' and approvers' violations, styled like the chart's Group by pill. */
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsViolationStage} from '@pages/Insights/dashboardSpecs';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import type {InsightsControlProps} from './insightsControls';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

function InsightsViolationStageDropdown({value, onChange}: InsightsControlProps<InsightsViolationStage>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const items: Array<SingleSelectItem<InsightsViolationStage>> = Object.values(CONST.INSIGHTS.VIOLATION_STAGE).map((stage) => ({
        text: translate(`insightsPage.violationStage.${stage}`),
        value: stage,
    }));
    const selectedItem = items.find((item) => item.value === value);

    const violationStagePopover = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={translate('insightsPage.violationStage.label')}
            showLabel={false}
            items={items}
            value={selectedItem}
            defaultValue={CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED}
            closeOverlay={closeOverlay}
            onChange={(item) => onChange(item?.value ?? CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED)}
            applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_APPLY.VIOLATION_STAGE}
            resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_RESET.VIOLATION_STAGE}
        />
    );

    return (
        <DropdownButton
            label={selectedItem?.text ?? ''}
            value={null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_VIOLATION_STAGE}
            wrapperStyle={[styles.getWidgetHeaderButtonOverflowStyle(variables.componentSizeSmall), styles.flexShrink1]}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.widgetHeaderMenuButtonHovered}
            labelStyle={styles.textSupporting}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={violationStagePopover}
        />
    );
}

export default InsightsViolationStageDropdown;
