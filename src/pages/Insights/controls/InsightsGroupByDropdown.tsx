import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import type {ButtonComponentProps, PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import DEFAULT_INSIGHTS_FILTERS, {INSIGHTS_GROUP_BY_OPTIONS} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';

import React from 'react';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

type InsightsGroupByDropdownProps = {
    /** Time bucket the headline chart aggregates into */
    groupBy: InsightsFilters['groupBy'];

    onChange: (groupBy: InsightsFilters['groupBy']) => void;
};

function InsightsGroupByDropdown({groupBy, onChange}: InsightsGroupByDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const items: Array<SingleSelectItem<InsightsFilters['groupBy']>> = INSIGHTS_GROUP_BY_OPTIONS.map((option) => ({
        text: translate(`search.filters.groupBy.${option}`),
        value: option,
    }));
    const selectedItem = items.find((item) => item.value === groupBy);

    const label = translate('search.display.groupBy');
    const buttonText = `${label}: ${selectedItem?.text ?? ''}`;

    const groupByPopover = ({closeOverlay}: PopoverComponentProps) => (
        <SingleSelectPopup
            label={label}
            items={items}
            value={selectedItem}
            defaultValue={DEFAULT_INSIGHTS_FILTERS.groupBy}
            closeOverlay={closeOverlay}
            onChange={(item) => onChange(item?.value ?? DEFAULT_INSIGHTS_FILTERS.groupBy)}
        />
    );

    const groupByButton = ({ref, onPress, isExpanded}: ButtonComponentProps) => (
        <Button
            ref={ref}
            size={CONST.BUTTON_SIZE.SMALL}
            style={styles.widgetHeaderGhostButtonWrapper}
            innerStyles={[styles.bgTransparent, isExpanded && styles.widgetHeaderMenuButtonHovered]}
            hoverStyles={styles.widgetHeaderMenuButtonHovered}
            accessibilityLabel={buttonText}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_GROUP_BY}
            onPress={onPress}
        >
            <CaretWrapper isActive={isExpanded}>
                <Text
                    numberOfLines={1}
                    style={[styles.textMicroBold, styles.textSupporting]}
                >
                    {buttonText}
                </Text>
            </CaretWrapper>
        </Button>
    );

    return (
        <FilterPopupButton
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={groupByPopover}
            renderButton={groupByButton}
        />
    );
}

export default InsightsGroupByDropdown;
