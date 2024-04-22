import React from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import useActiveRoute from '@hooks/useActiveRoute';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

type SearchMenuItem = {
    title: string;
    icon: IconAsset;
    route: Route;
};

const searchMenuItems: SearchMenuItem[] = [
    {
        title: 'All',
        icon: Expensicons.All,
        route: ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.ALL),
    },
    // More tabs prepared for final version but in v1 we support only "All"
    // {
    //     title: 'Sent',
    //     icon: Expensicons.Send,
    //     route: ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.SENT),
    // },
    // {
    //     title: 'Drafts',
    //     icon: Expensicons.Pencil,
    //     route: ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.DRAFTS),
    // },
];

function SearchFilters() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const activeRoute = useActiveRoute();
    const {isSmallScreenWidth} = useWindowDimensions();

    const currentQuery = activeRoute?.params && 'query' in activeRoute.params ? activeRoute?.params?.query : '';
    const flexDirection = isSmallScreenWidth && styles.flexRow;

    return (
        <View style={[styles.pb4, styles.mh3, styles.mt3, flexDirection]}>
            {searchMenuItems.map((item) => {
                const isActive = item.title.toLowerCase() === currentQuery;
                const onPress = singleExecution(() => Navigation.navigate(item.route));

                if (isSmallScreenWidth) {
                    return (
                        <View
                            key={item.title}
                            style={[styles.searchFiltersTabItem]}
                        >
                            <TabSelectorItem
                                icon={item.icon}
                                title={item.title}
                                isActive={isActive}
                                activeOpacity={isActive ? 1 : 0}
                                backgroundColor={isActive ? theme.border : theme.appBG}
                                onPress={onPress}
                            />
                        </View>
                    );
                }

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
