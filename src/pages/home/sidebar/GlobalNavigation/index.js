import React, {useMemo, useContext} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PressableAvatarWithIndicator from '../PressableAvatarWithIndicator';
import styles from '../../../../styles/styles';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import CONST from '../../../../CONST';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import useLocalize from '../../../../hooks/useLocalize';
import GlobalNavigationMenuItem from './GlobalNavigationMenuItem';
import defaultTheme from '../../../../styles/themes/default';
import {SidebarNavigationContext} from '../SidebarNavigationContext';

const propTypes = {};

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
            <PressableAvatarWithIndicator />
            <View style={styles.mt4}>
                {_.map(items, (item) => (
                    <GlobalNavigationMenuItem
                        key={item.text}
                        iconFill={defaultTheme.icon}
                        icon={item.icon}
                        title={item.text}
                        onPress={() => item.onSelected(item.value)}
                        focused={sidebarNavigation.selectedGlobalNavigationOption === item.value}
                    />
                ))}
            </View>
        </View>
    );
}

GlobalNavigation.propTypes = propTypes;
GlobalNavigation.displayName = 'GlobalNavigation';

export default GlobalNavigation;
