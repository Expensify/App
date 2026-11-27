/**
 * The More tab of the flat nav bar on narrow web, which opens the More menu. While the user is on one of the menu's
 * entries it shows that entry's icon with the More chevron beside it, and the chevron alone otherwise.
 */
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getMoreMenuItemIconName from '@libs/Navigation/MoreMenu/getMoreMenuItemIconName';
import type {MoreMenuItemID} from '@libs/Navigation/MoreMenu/MORE_MENU';
import MoreMenuStateContext from '@libs/Navigation/MoreMenu/MoreMenuStateContext';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useContext} from 'react';
import {View} from 'react-native';

import getTabAccessibilityLabel from './getTabAccessibilityLabel';
import TabBarItemIcon from './TabBarItemIcon';
import TabBarItemLayout from './TabBarItemLayout';

type FlatNavMoreTabButtonProps = {
    isSelected: boolean;

    /** The More menu entry the user is on, from getMoreTabItemID */
    moreTabItemID: MoreMenuItemID | undefined;
};

function FlatNavMoreTabButton({isSelected, moreTabItemID}: FlatNavMoreTabButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const entryIconName = isSelected && moreTabItemID ? getMoreMenuItemIconName(moreTabItemID) : undefined;
    const expensifyIcons = useMemoizedLazyExpensifyIcons(entryIconName ? ['CaretUpDown', entryIconName] : ['CaretUpDown']);
    const {indicatorColor, status} = useWorkspacesTabIndicatorStatus();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const [, setMoreMenuState] = useContext(MoreMenuStateContext);
    const label = translate('common.more');
    const entryIcon = entryIconName ? expensifyIcons[entryIconName] : undefined;

    return (
        <PressableWithFeedback
            onPress={() => interceptAnonymousUser(() => setMoreMenuState('open'), session)}
            role={CONST.ROLE.TAB}
            accessibilityLabel={getTabAccessibilityLabel(label, !!status, translate)}
            accessibilityState={{selected: isSelected}}
            wrapperStyle={styles.navigationTabBarSlot}
            style={styles.navigationTabBarItem}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE}
        >
            <TabBarItemLayout
                icon={
                    // The chevron's room is kept on both sides even without an entry, so the glyph stays centered over the
                    // label and the bar does not shift when the entry comes and goes.
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <View style={styles.navigationTabBarIconAccessory} />
                        <TabBarItemIcon
                            icon={entryIcon ?? expensifyIcons.CaretUpDown}
                            isSelected={isSelected}
                            statusIndicatorColor={status ? indicatorColor : undefined}
                        />
                        <View style={styles.navigationTabBarIconAccessory}>
                            {!!entryIcon && (
                                <Icon
                                    src={expensifyIcons.CaretUpDown}
                                    fill={theme.icon}
                                    width={variables.floatingTabBarIconAccessorySize}
                                    height={variables.floatingTabBarIconAccessorySize}
                                />
                            )}
                        </View>
                    </View>
                }
                label={label}
                isSelected={isSelected}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default FlatNavMoreTabButton;
