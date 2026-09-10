import useContainerWidth from '@hooks/useContainerWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type ChartWidthBoxProps = {
    children: (chartWidth: number) => ReactNode;
};

/** On web the chart component mounts only once the chart engine has downloaded, so measuring here keeps the width across that mount. */
function ChartWidthBox({children}: ChartWidthBoxProps) {
    const styles = useThemeStyles();
    const {onLayout, containerWidth} = useContainerWidth();

    return (
        <View
            style={styles.w100}
            onLayout={onLayout}
        >
            {children(containerWidth)}
        </View>
    );
}

export default ChartWidthBox;
