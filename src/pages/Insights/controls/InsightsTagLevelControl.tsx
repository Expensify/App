/** Selects one configured tag position using the existing Insights grouping menu. */
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import type {InsightsTagLevelOption} from '@pages/Insights/insightsTagLevels';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';
import InsightsGroupByPopup from './InsightsGroupByPopup';

type InsightsTagLevelControlProps = {
    /** 1-based position in the workspace's configured tag lists. */
    tagLevel: number;
    options: InsightsTagLevelOption[];
    onChange: (update: Partial<InsightsFilters>) => void;
};

function InsightsTagLevelControl({tagLevel, options, onChange}: InsightsTagLevelControlProps) {
    const styles = useThemeStyles();
    const {translate, numberFormat} = useLocalize();
    const label = options.find((option) => option.value === tagLevel)?.label ?? translate('insightsPage.tagLevel', numberFormat(tagLevel));
    const selectLevel = (value: string) => {
        const option = options.find((item) => String(item.value) === value);
        if (option) {
            onChange({tagLevel: option.value});
        }
    };
    const tagLevelPopover = ({closeOverlay}: PopoverComponentProps) => (
        <InsightsGroupByPopup
            optionGroups={[options.map((option) => ({value: String(option.value), label: option.label}))]}
            selectedValue={String(tagLevel)}
            defaultValue={String(CONST.INSIGHTS.DEFAULT_TAG_LEVEL)}
            label={translate('insightsPage.tagLevelLabel')}
            resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_RESET.TAG_LEVEL}
            applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_APPLY.TAG_LEVEL}
            closeOverlay={closeOverlay}
            onChange={selectLevel}
        />
    );

    return (
        <DropdownButton
            label={label}
            value={null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_TAG_LEVEL}
            wrapperStyle={[styles.getWidgetHeaderButtonOverflowStyle(variables.componentSizeSmall), styles.flexShrink1]}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.widgetHeaderMenuButtonHovered}
            labelStyle={styles.textSupporting}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={tagLevelPopover}
        />
    );
}

export default InsightsTagLevelControl;
