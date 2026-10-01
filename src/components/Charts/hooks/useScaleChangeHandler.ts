import type {Scale} from 'victory-native';

import {useEffect, useEffectEvent, useRef} from 'react';

/**
 * Returns the `onScaleChange` handler for a CartesianChart, which hands the chart's scales to `onScales`.
 * victory-native reports its scales only when an axis changes, so they are kept and handed over again whenever the data or series change.
 */
function useScaleChangeHandler(onScales: (xScale: Scale, yScale: Scale) => void, data: unknown, series: unknown): (xScale: Scale, yScale: Scale) => void {
    const scalesRef = useRef<{xScale: Scale; yScale: Scale} | undefined>(undefined);

    const onDataChange = useEffectEvent(() => {
        if (!scalesRef.current) {
            return;
        }
        onScales(scalesRef.current.xScale, scalesRef.current.yScale);
    });

    useEffect(() => {
        onDataChange();
    }, [data, series]);

    return (xScale: Scale, yScale: Scale) => {
        scalesRef.current = {xScale, yScale};
        onScales(xScale, yScale);
    };
}

export default useScaleChangeHandler;
