/** Switches the Handled by table between the approve and submit stages, using the existing Insights grouping menu. */
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsHandledByStage} from '@pages/Insights/dashboardSpecs';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';
import InsightsGroupByPopup from './InsightsGroupByPopup';

type InsightsHandledByStageControlProps = {
    stage: InsightsHandledByStage;

    /** Stages the workspaces in scope offer, the default first */
    options: InsightsHandledByStage[];

    onChange: (stage: InsightsHandledByStage) => void;
};

function InsightsHandledByStageControl({stage, options, onChange}: InsightsHandledByStageControlProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const stagePopover = ({closeOverlay}: PopoverComponentProps) => (
        <InsightsGroupByPopup
            optionGroups={[options.map((option) => ({value: option, label: translate(`insightsPage.handledBy.stage.${option}`)}))]}
            selectedValue={stage}
            defaultValue={options.at(0) ?? stage}
            label={translate('insightsPage.handledBy.stageLabel')}
            resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_RESET.HANDLED_BY_STAGE}
            applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_APPLY.HANDLED_BY_STAGE}
            closeOverlay={closeOverlay}
            onChange={onChange}
        />
    );

    return (
        <DropdownButton
            label={translate(`insightsPage.handledBy.stage.${stage}`)}
            value={null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_HANDLED_BY_STAGE}
            wrapperStyle={[styles.getWidgetHeaderButtonOverflowStyle(variables.componentSizeSmall), styles.flexShrink1]}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.widgetHeaderMenuButtonHovered}
            labelStyle={styles.textSupporting}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={stagePopover}
        />
    );
}

export default InsightsHandledByStageControl;
