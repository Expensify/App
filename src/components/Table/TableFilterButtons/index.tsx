import React, {useCallback} from 'react';
import type {ReactNode} from 'react';
import {FlatList, View} from 'react-native';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import {useTableContext} from '@components/Table/TableContext';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import buildFilterItems from './buildFilterItems';
import type {FilterButtonItem} from './buildFilterItems';

type TableFilterButtonsProps = ViewProps;

function TableFilterButtons(props: TableFilterButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {filterConfig: filterConfigs, activeFilters: filters, updateFilter} = useTableContext();

    const setFilter = useCallback(
        (key: string, value: unknown) => {
            updateFilter({key, value});
        },
        [updateFilter],
    );

    const filterItems = buildFilterItems(filterConfigs, filters, setFilter, translate('search.filtersHeader'));

    if (filterItems.length === 0) {
        return null;
    }

    const shouldShowResponsiveLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...props}>
            <FlatList
                horizontal
                data={filterItems}
                keyExtractor={(item) => item.key}
                renderItem={({item}) => <FilterItemRenderer item={item} />}
                style={shouldShowResponsiveLayout && [styles.flexGrow0, styles.flexShrink0]}
                contentContainerStyle={[styles.flexRow, styles.gap2, styles.w100]}
                showsHorizontalScrollIndicator={false}
                CellRendererComponent={CellRendererComponent}
            />
        </View>
    );
}

type FilterItemRendererProps = {
    item: FilterButtonItem;
};

function FilterItemRenderer({item}: FilterItemRendererProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldShowResponsiveLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    return (
        <DropdownButton
            label={item.label}
            value={item.value}
            PopoverComponent={item.PopoverComponent}
            innerStyles={[styles.gap2, shouldShowResponsiveLayout && styles.mw100]}
            wrapperStyle={shouldShowResponsiveLayout && styles.w100}
            labelStyle={styles.fontSizeLabel}
            carretWrapperStyle={styles.gap2}
            medium
        />
    );
}

function CellRendererComponent({children, style, ...props}: {children: ReactNode; style: StyleProp<ViewStyle>}) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldShowResponsiveLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[style, shouldShowResponsiveLayout && styles.flex1]}
        >
            {children}
        </View>
    );
}

export default TableFilterButtons;
