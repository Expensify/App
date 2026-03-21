import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from './Icon';

type SelectCircleProps = {
    /** Should we show the checkmark inside the circle */
    isChecked: boolean;

    /** Additional styles to pass to SelectCircle */
    selectCircleStyles?: StyleProp<ViewStyle>;
};

function SelectCircle({isChecked = false, selectCircleStyles}: SelectCircleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);

    return (
        <View style={[styles.selectCircle, styles.alignSelfCenter, selectCircleStyles]}>
            {isChecked && (
                <Icon
                    src={icons.Checkmark}
                    fill={theme.iconSuccessFill}
                />
            )}
        </View>
    );
}

export default SelectCircle;
