import type {LayoutChangeEvent} from 'react-native';
import type {ChartExplicitSize} from 'victory-native';

import {useState} from 'react';

/**
 * A victory-native chart draws nothing until it has a size, so handing it the measured one lets it draw on the render
 * it mounts in instead of waiting for a layout pass of its own. Passing a size also stops the chart listening to its
 * own layout events, which makes this the only place a resize can arrive from.
 */
function useMeasuredChartSize() {
    const [size, setSize] = useState({width: 0, height: 0});

    const onLayout = (event: LayoutChangeEvent) => {
        setSize({width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height});
    };

    const measuredSize: ChartExplicitSize | undefined = size.width > 0 && size.height > 0 ? size : undefined;

    return {onLayout, width: size.width, height: size.height, measuredSize};
}

export default useMeasuredChartSize;
