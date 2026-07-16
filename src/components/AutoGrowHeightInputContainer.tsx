import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {ReactNode} from 'react';
import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';

type AutoGrowHeightInputContainerProps = {
    children: (maxAutoGrowHeight: number) => ReactNode;
    style?: StyleProp<ViewStyle>;
};

function AutoGrowHeightInputContainer({children, style}: AutoGrowHeightInputContainerProps) {
    const styles = useThemeStyles();
    const [maxAutoGrowHeight, setMaxAutoGrowHeight] = useState(variables.textInputAutoGrowMaxHeight);

    return (
        <View
            style={[styles.flex1, style]}
            onLayout={(event) => {
                const {height} = event.nativeEvent.layout;
                if (height <= 0) {
                    return;
                }
                setMaxAutoGrowHeight(height);
            }}
        >
            {children(maxAutoGrowHeight)}
        </View>
    );
}

export default AutoGrowHeightInputContainer;
