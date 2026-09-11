import Icon from '@components/Icon';
import {MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT, useMenuItemAccessibilityAnnouncement} from '@components/MenuItem/MenuItemAccessibilityContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type MenuItemBrickRoadIndicatorProps = {
    /** Whether the row is in an error or a success state */
    status: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

/**
 * The red/green dot of a `MenuItem.Row`, signalling that the row needs attention.
 * Render it before `MenuItem.Chevron` so it reads left of the navigation arrow
 */
function MenuItemBrickRoadIndicator({status}: MenuItemBrickRoadIndicatorProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // The dot means the row needs attention. Tell the row so screen readers announce it after the label
    useMenuItemAccessibilityAnnouncement(MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.REVIEW_REQUIRED, translate('common.yourReviewIsRequired'));

    return (
        <View
            style={styles.menuItemTrailingIcon}
            testID="menu-item-brick-road-indicator"
        >
            <Icon
                src={icons.DotIndicator}
                fill={status === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.success}
            />
        </View>
    );
}

export default MenuItemBrickRoadIndicator;
