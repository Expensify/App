import Icon from '@components/Icon';

import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, StyleSheet, View} from 'react-native';

type TabIconProps = {
    /** Icon to display on tab */
    icon?: IconAsset;

    /** Animated opacity value while the icon is in inactive state */
    inactiveOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Animated opacity value while the icon is in active state */
    activeOpacity?: number | Animated.AnimatedInterpolation<number>;
};

function TabIcon({icon, activeOpacity = 0, inactiveOpacity = 1}: TabIconProps) {
    const theme = useTheme();
    return (
        <View>
            {!!icon && (
                <>
                    <Animated.View style={{opacity: inactiveOpacity}}>
                        <Icon
                            src={icon}
                            fill={theme.icon}
                            size={CONST.ICON_SIZE.SMALL}
                        />
                    </Animated.View>
                    <Animated.View style={[StyleSheet.absoluteFill, {opacity: activeOpacity}]}>
                        <Icon
                            src={icon}
                            fill={theme.iconMenu}
                            size={CONST.ICON_SIZE.SMALL}
                        />
                    </Animated.View>
                </>
            )}
        </View>
    );
}

export default TabIcon;
