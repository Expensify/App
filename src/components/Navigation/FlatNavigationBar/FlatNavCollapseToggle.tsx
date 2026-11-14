/** The flat navigation bar's toggle for collapsing it into an icon rail and expanding it back. */
import SidebarLeftIcon from '@assets/images/sidebar-left.svg';
import SidebarRightIcon from '@assets/images/sidebar-right.svg';

import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

type FlatNavCollapseToggleProps = {
    isCollapsed: boolean;

    onPress: () => void;
};

function FlatNavCollapseToggle({isCollapsed, onPress}: FlatNavCollapseToggleProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();

    const label = translate(isCollapsed ? 'reportActionCompose.expand' : 'reportActionCompose.collapse');

    return (
        <Tooltip text={label}>
            <PressableWithFeedback
                testID="FlatNavCollapseToggle"
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={label}
                accessibilityState={{expanded: !isCollapsed}}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.COLLAPSE}
                onPress={onPress}
                style={[StyleUtils.getWidthAndHeightStyle(variables.iconSizeNormal), styles.alignItemsCenter, styles.justifyContentCenter]}
                shouldUseAutoHitSlop
            >
                <Icon
                    src={isCollapsed ? SidebarRightIcon : SidebarLeftIcon}
                    fill={theme.icon}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
            </PressableWithFeedback>
        </Tooltip>
    );
}

export default FlatNavCollapseToggle;
