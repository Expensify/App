import React, {useState} from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useActiveRoute from '@hooks/useActiveRoute';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import SearchResults from './SearchResults';

type SearchMenuItem = {
    title: string;
    icon: IconAsset;
    action: () => void;
};

function SearchPageBottomTab() {
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {isSmallScreenWidth} = useWindowDimensions();
    const waitForNavigate = useWaitForNavigation();
    const activeRoute = useActiveRoute();
    const currentQuery = activeRoute?.params?.query;

    const searchMenuItems: SearchMenuItem[] = [
        {
            title: 'All',
            icon: Expensicons.ExpensifyLogoNew,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.SEARCH.getRoute('all')))),
        },
        {
            title: 'Sent',
            icon: Expensicons.ExpensifyLogoNew,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.SEARCH.getRoute('sent')))),
        },
        {
            title: 'Drafts',
            icon: Expensicons.ExpensifyLogoNew,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.SEARCH.getRoute('drafts')))),
        },
    ];

    return (
        <ScreenWrapper testID="testPage">
            {isSmallScreenWidth ? (
                <OnyxTabNavigator
                    id={CONST.TAB.NEW_CHAT_TAB_ID}
                    tabBar={TabSelector}
                    onTabSelected={(tab: string) => Navigation.navigate(ROUTES.SEARCH.getRoute(tab))}
                >
                    <TopTab.Screen name={CONST.TAB_SEARCH.ALL}>{() => <SearchResults filter="all" />}</TopTab.Screen>
                    <TopTab.Screen name={CONST.TAB_SEARCH.SENT}>{() => <SearchResults filter="sent" />}</TopTab.Screen>
                    <TopTab.Screen name={CONST.TAB_SEARCH.DRAFTS}>{() => <SearchResults filter="drafts" />}</TopTab.Screen>
                </OnyxTabNavigator>
            ) : (
                <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                    {/*
                                Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
                                In this case where user can click on workspace avatar or menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
                            */}
                    {searchMenuItems.map((item) => (
                        <MenuItem
                            key={item.title}
                            disabled={false}
                            interactive
                            title={item.title}
                            icon={item.icon}
                            onPress={item.action}
                            wrapperStyle={styles.sectionMenuItem}
                            focused={item.title.toLowerCase() === currentQuery}
                            hoverAndPressStyle={styles.hoveredComponentBG}
                            isPaneMenu
                        />
                    ))}
                </View>
            )}
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPage';

export default SearchPageBottomTab;
