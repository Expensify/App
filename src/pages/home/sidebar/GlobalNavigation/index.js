import React, {useMemo, useContext} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../../../../styles/styles';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import CONST from '../../../../CONST';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import useLocalize from '../../../../hooks/useLocalize';
import GlobalNavigationMenuItem from './GlobalNavigationMenuItem';
import {SidebarNavigationContext} from '../SidebarNavigationContext';
import SignInOrAvatarWithOptionalStatus from '../SignInOrAvatarWithOptionalStatus';

function GlobalNavigation() {
    const sidebarNavigation = useContext(SidebarNavigationContext);
    const {translate} = useLocalize();

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
                    Navigation.navigate(ROUTES.INDIVIDUALS_OLDDOT);
                },
            },
        ],
        [translate],
    );

    return (
        <View style={[styles.ph5, styles.pv3, styles.alignItemsCenter, styles.h100, styles.globalNavigation]}>
            <SignInOrAvatarWithOptionalStatus />
            <View style={styles.globalNavigationMenuContainer}>
                {_.map(items, (item) => (
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
