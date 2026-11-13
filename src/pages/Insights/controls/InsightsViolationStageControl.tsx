/** Selects which action's persisted violations a Compliance chart plots. */
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsViolationStage, InsightsViolationStageGraphKey} from '@pages/Insights/insightsViolationStages';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

type InsightsViolationStageControlProps = {
    graphKey: InsightsViolationStageGraphKey;
    value: InsightsViolationStage;
    onChange: (graphKey: InsightsViolationStageGraphKey, stage: InsightsViolationStage) => void;
};

function InsightsViolationStageControl({graphKey, value, onChange}: InsightsViolationStageControlProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const items: Array<SingleSelectItem<InsightsViolationStage>> = [
        {text: translate('insightsPage.submitters'), value: CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED},
        {text: translate('insightsPage.approvers'), value: CONST.INSIGHTS.VIOLATION_STAGE.APPROVED},
    ];
    const selectedItem = items.find((item) => item.value === value);
    const renderStagePopover = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={translate('common.view')}
            items={items}
            value={selectedItem}
            defaultValue={CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED}
            closeOverlay={closeOverlay}
            onChange={(item) => onChange(graphKey, item?.value ?? CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED)}
            applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_APPLY.VIOLATION_STAGE}
            resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_RESET.VIOLATION_STAGE}
        />
    );

    return (
        <DropdownButton
            label={selectedItem?.text ?? ''}
            value={null}
            sentryLabel={
                graphKey === CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME
                    ? CONST.SENTRY_LABEL.INSIGHTS.CONTROL_VIOLATION_STAGE.VIOLATIONS_OVER_TIME
                    : CONST.SENTRY_LABEL.INSIGHTS.CONTROL_VIOLATION_STAGE.TOP_VIOLATIONS
            }
            wrapperStyle={[styles.getWidgetHeaderButtonOverflowStyle(variables.componentSizeSmall), styles.flexShrink1]}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.widgetHeaderMenuButtonHovered}
            labelStyle={styles.textSupporting}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={renderStagePopover}
        />
    );
}

export default InsightsViolationStageControl;
