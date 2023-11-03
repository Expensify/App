import React, {useContext, useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
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
    const items = useMemo(
        () => [
            {
                icon: Expensicons.ChatBubble,
                text: translate('globalNavigationOptions.chats'),
                value: CONST.GLOBAL_NAVIGATION_OPTION.CHATS,
                onSelected: () => {
                    Navigation.navigate(ROUTES.REPORT);
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
                        onPress={() => item.onSelected(item.value)}
                        isFocused={sidebarNavigation.selectedGlobalNavigationOption === item.value}
                    />
                ))}
            </View>
        </View>
    );
}

GlobalNavigation.displayName = 'GlobalNavigation';

export default GlobalNavigation;
