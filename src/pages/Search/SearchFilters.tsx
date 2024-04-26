import React from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import useActiveRoute from '@hooks/useActiveRoute';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import SearchFiltersNarrow from './SearchFiltersNarrow';

type SearchMenuFilterItem = {
    title: string;
    icon: IconAsset;
    route: Route;
};

function SearchFilters() {
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const activeRoute = useActiveRoute();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const filterItems: SearchMenuFilterItem[] = [
        {
            title: translate('common.all'),
            icon: Expensicons.All,
            route: ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.ALL),
        },
    ];

    const currentQuery = activeRoute?.params && 'query' in activeRoute.params ? activeRoute?.params?.query : '';

    if (isSmallScreenWidth) {
        const activeItemLabel = String(currentQuery);

        return (
            <SearchFiltersNarrow
                filterItems={filterItems}
                activeItemLabel={activeItemLabel}
            />
        );
    }

    return (
        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
            {filterItems.map((item) => {
                const isActive = item.title.toLowerCase() === currentQuery;
                const onPress = singleExecution(() => Navigation.navigate(item.route));

                return (
                    <MenuItem
                        key={item.title}
                        disabled={false}
                        interactive
                        title={item.title}
                        icon={item.icon}
                        wrapperStyle={styles.sectionMenuItem}
                        focused={isActive}
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
