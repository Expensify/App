import Icon from '@components/Icon';

import useConciergeTabIndicatorStatus from '@hooks/useConciergeTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/** The history icon in the Concierge header, with a dot while a Concierge conversation has something unread */
function ConciergeHistoryIcon() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['History']);
    const {hasUnreadConversation, indicatorColor} = useConciergeTabIndicatorStatus();

    return (
        <View>
            <Icon
                src={icons.History}
                fill={theme.icon}
            />
            {hasUnreadConversation && <View style={[styles.navigationTabBarStatusIndicator, styles.statusIndicatorColor(indicatorColor), StyleUtils.getBorderColorStyle(theme.appBG)]} />}
        </View>
    );
}

export default ConciergeHistoryIcon;
