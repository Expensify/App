import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ArrowIconProps = {
    /** Specifies if the arrow icon should be disabled or not. */
    disabled?: boolean;

    /** Specifies direction of icon */
    direction?: ValueOf<typeof CONST.DIRECTION>;
};

function ArrowIcon({disabled = false, direction = CONST.DIRECTION.RIGHT}: ArrowIconProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    return (
        <View style={[styles.p1, StyleUtils.getDirectionStyle(direction), disabled ? styles.buttonOpacityDisabled : {}]}>
            <Icon
                fill={theme.icon}
                src={icons.ArrowRight}
            />
        </View>
    );
}

export default ArrowIcon;
