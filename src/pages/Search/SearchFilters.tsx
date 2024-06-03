import React from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import SearchFiltersNarrow from './SearchFiltersNarrow';

type SearchFiltersProps = {
    query: string;
};

type SearchMenuFilterItem = {
    title: string;
    query: string;
    icon: IconAsset;
    route: Route;
};

function SearchFilters({query}: SearchFiltersProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();

    const filterItems: SearchMenuFilterItem[] = [
        {
            title: translate('common.expenses'),
            query: CONST.TAB_SEARCH.ALL,
            icon: Expensicons.Receipt,
            route: ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.ALL),
        },
        {
            title: translate('common.shared'),
            query: CONST.TAB_SEARCH.SHARED,
            icon: Expensicons.Send,
            route: ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.SHARED),
        },
        // {
        //     title: translate('common.drafts'),
        //     query: CONST.TAB_SEARCH.DRAFTS,
        //     icon: Expensicons.Pencil,
        //     route: ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.DRAFTS),
        // },
        // {
        //     title: translate('common.finished'),
        //     query: CONST.TAB_SEARCH.FINISHED,
        //     icon: Expensicons.CheckCircle,
        //     route: ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.FINISHED),
        // },
    ];
    const activeItemIndex = filterItems.findIndex((item) => item.query === query);

    if (isSmallScreenWidth) {
        return (
            <SearchFiltersNarrow
                filterItems={filterItems}
                activeItemIndex={activeItemIndex}
            />
        );
    }

    return (
        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
            {filterItems.map((item, index) => {
                const onPress = singleExecution(() => Navigation.navigate(item.route));

                return (
                    <MenuItem
                        key={item.title}
                        disabled={false}
                        interactive
                        title={item.title}
                        icon={item.icon}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        wrapperStyle={styles.sectionMenuItem}
                        focused={index === activeItemIndex}
                        hoverAndPressStyle={styles.hoveredComponentBG}
                        onPress={onPress}
                        isPaneMenu
                    />
                );
            })}
        </View>
    );
}

SearchFilters.displayName = 'SearchFilters';

export default SearchFilters;
export type {SearchMenuFilterItem};
