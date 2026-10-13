import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {LayoutChangeEvent} from 'react-native';

import {useState} from 'react';
import {View} from 'react-native';

type ChartWidthBoxProps = {
    /** Receives the card's width, or null until the card has been measured. */
    children: (chartWidth: number | null) => ReactNode;
};

/** On web the chart component mounts only once the chart engine has downloaded, so measuring here keeps the width across that mount. */
function ChartWidthBox({children}: ChartWidthBoxProps) {
    const styles = useThemeStyles();
    const [chartWidth, setChartWidth] = useState<number | null>(null);

    const onLayout = (event: LayoutChangeEvent) => {
        const {width} = event.nativeEvent.layout;

        // A hidden card reports a width of 0. Keeping the last width keeps the chart and its hover state mounted until the card shows again.
        if (width <= 0) {
            return;
        }
        setChartWidth(width);
    };

    return (
        <View
            style={styles.w100}
            onLayout={onLayout}
        >
            {children(chartWidth)}
        </View>
    );
}

export default ChartWidthBox;
