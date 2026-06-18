import React from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import {useTableContext} from '@components/Table/TableContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

export default function TableFilterTrigger() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Filter']);
    const {filterConfig, shouldUseNarrowTableLayout} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;

    if (!hasFiltersAvailable) {
        return null;
    }

    return (
        <FilterPopupButton
            PopoverComponent={FilterPopoverComponent}
            renderButton={({ref, isExpanded, onPress}) => {
                if (shouldUseNarrowTableLayout) {
                    return (
                        <PressableWithFeedback
                            ref={ref}
                            accessibilityLabel={translate('search.filtersHeader')}
                            role={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.TABLE.FILTERS}
                            hoverStyle={styles.buttonHoveredBG}
                            style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.componentSizeNormal, styles.borderRadiusCircle, isExpanded && styles.buttonHoveredBG]}
                            onPress={onPress}
                        >
                            <Icon
                                small
                                src={icons.Filter}
                                fill={theme.icon}
                            />
                        </PressableWithFeedback>
                    );
                }

                return (
                    <Button
                        small
                        ref={ref}
                        text="Filters"
                        icon={icons.Filter}
                        onPress={onPress}
                    />
                );
            }}
        />
    );
}

function FilterPopoverComponent({closeOverlay}: PopoverComponentProps) {
    const {filterConfig, activeFilters, tableMethods} = useTableContext();
    const filterKey = Object.keys(filterConfig ?? {}).at(0);

    if (!filterKey || !filterConfig) {
        return null;
    }

    const config = filterConfig[filterKey];
    const items = config.options.map((option) => ({
        text: option.label,
        value: option.value,
    }));

    if (config.filterType === CONST.TABLES.FILTER_TYPE.MULTI_SELECT) {
        const selectedValues = Array.isArray(activeFilters[filterKey]) ? activeFilters[filterKey] : [];
        const value = items.filter((item) => selectedValues.includes(item.value));

        return (
            <MultiSelectPopup
                label={filterKey}
                items={items}
                value={value}
                closeOverlay={closeOverlay}
                onChange={(selectedItems) => {
                    tableMethods.updateFilter({
                        key: filterKey,
                        value: selectedItems.map((item) => item.value),
                    });
                }}
            />
        );
    }

    const value = items.find((item) => item.value === activeFilters[filterKey]);

    return (
        <SingleSelectPopup
            label={config.showLabel ? filterKey : undefined}
            defaultValue={config.default}
            items={items}
            value={value}
            closeOverlay={closeOverlay}
            onChange={(selectedItem) => {
                tableMethods.updateFilter({
                    key: filterKey,
                    value: selectedItem?.value ?? null,
                });
            }}
        />
    );
}
