import React, {useContext, useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import {SidebarNavigationContext} from '@pages/home/sidebar/SidebarNavigationContext';
import SignInOrAvatarWithOptionalStatus from '@pages/home/sidebar/SignInOrAvatarWithOptionalStatus';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import GlobalNavigationMenuItem from './GlobalNavigationMenuItem';

function GlobalNavigation() {
    const sidebarNavigation = useContext(SidebarNavigationContext);
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const items = useMemo(
        () => [
            {
                icon: Expensicons.Feed,
                text: translate('globalNavigation.home'),
                value: CONST.GLOBAL_NAVIGATION_OPTION.HOME,
                onSelected: () => {
                    Navigation.navigate(ROUTES.HOME_OLDDOT);
                },
            },
            {
                icon: Expensicons.ChatBubble,
                text: translate('globalNavigation.chats'),
                value: CONST.GLOBAL_NAVIGATION_OPTION.CHATS,
                onSelected: () => {
                    Navigation.navigate(ROUTES.REPORT);
                },
            },
            {
                icon: Expensicons.Transfer,
                text: translate('globalNavigation.money'),
                value: CONST.GLOBAL_NAVIGATION_OPTION.MONEY,
                onSelected: () => {
                    Navigation.navigate(ROUTES.EXPENSES_OLDDOT);
                },
            },
            {
                icon: Expensicons.Building,
                text: translate('workspace.common.workspace'),
                value: CONST.GLOBAL_NAVIGATION_OPTION.WORKSPACES,
                onSelected: () => {
                    Navigation.navigate(ROUTES.INDIVIDUAL_OLDDOT);
                },
            },
        ],
        [translate],
    );

    const itemsToDisplay = useMemo(() => {
        if (isSmallScreenWidth) {
            return _.filter(items, (item) => item.value === CONST.GLOBAL_NAVIGATION_OPTION.CHATS);
        }
        return items;
    }, [isSmallScreenWidth, items]);

    return (
        <View style={[styles.ph5, styles.pv3, styles.alignItemsCenter, styles.h100, styles.globalNavigation]}>
            <SignInOrAvatarWithOptionalStatus />
            <View style={styles.globalNavigationMenuContainer}>
                {_.map(itemsToDisplay, (item) => (
                    <GlobalNavigationMenuItem
                        key={item.value}
                        icon={item.icon}
                        title={item.text}
                        onPress={item.onSelected}
                        isFocused={sidebarNavigation.selectedGlobalNavigationOption === item.value}
                    />
                ))}
            </View>
        </View>
    );
}

GlobalNavigation.displayName = 'GlobalNavigation';

export default GlobalNavigation;
