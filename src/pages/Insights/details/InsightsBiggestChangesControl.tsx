/** Dropdown picking whether Biggest changes lists categories, merchants or spenders. */
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from '@pages/Insights/controls/insightsControls';
import InsightsGroupByPopup from '@pages/Insights/controls/InsightsGroupByPopup';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {InsightsBiggestChangesGroupBy} from '@src/types/onyx';

import React from 'react';

const GROUP_BY_LABEL_KEYS = {
    [CONST.SEARCH.GROUP_BY.CATEGORY]: 'workspace.common.categories',
    [CONST.SEARCH.GROUP_BY.MERCHANT]: 'common.merchants',
    [CONST.SEARCH.GROUP_BY.FROM]: 'common.spenders',
} as const satisfies Record<InsightsBiggestChangesGroupBy, TranslationPaths>;

type InsightsBiggestChangesControlProps = {
    groupBy: InsightsBiggestChangesGroupBy;
    options: InsightsBiggestChangesGroupBy[];
    onChange: (groupBy: InsightsBiggestChangesGroupBy) => void;
};

function InsightsBiggestChangesControl({groupBy, options, onChange}: InsightsBiggestChangesControlProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const popover = ({closeOverlay}: PopoverComponentProps) => (
        <InsightsGroupByPopup
            optionGroups={[options.map((value) => ({value, label: translate(GROUP_BY_LABEL_KEYS[value])}))]}
            selectedValue={groupBy}
            defaultValue={CONST.SEARCH.GROUP_BY.CATEGORY}
            label={translate('insightsPage.biggestChanges')}
            resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_RESET.BIGGEST_CHANGES}
            applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_APPLY.BIGGEST_CHANGES}
            closeOverlay={closeOverlay}
            onChange={onChange}
        />
    );

    return (
        <DropdownButton
            label={translate(GROUP_BY_LABEL_KEYS[groupBy])}
            value={null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.DETAILS_BIGGEST_CHANGES_GROUP_BY}
            wrapperStyle={[styles.getWidgetHeaderButtonOverflowStyle(variables.componentSizeSmall), styles.flexShrink1]}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.widgetHeaderMenuButtonHovered}
            labelStyle={styles.textSupporting}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={popover}
        />
    );
}

export default InsightsBiggestChangesControl;
