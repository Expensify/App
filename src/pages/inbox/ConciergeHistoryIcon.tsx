import Icon from '@components/Icon';

import useConciergeTabIndicatorStatus from '@hooks/useConciergeTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/** The history icon in the Concierge header, with a dot while a Concierge conversation has something unread */
function ConciergeHistoryIcon() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['History']);
    const statusIndicatorColor = useConciergeTabIndicatorStatus();

    return (
        <View>
            <Icon
                src={icons.History}
                fill={theme.icon}
            />
            {!!statusIndicatorColor && <View style={[styles.navigationTabBarStatusIndicator, styles.statusIndicatorColor(statusIndicatorColor), {borderColor: theme.appBG}]} />}
        </View>
    );
}

export default ConciergeHistoryIcon;
