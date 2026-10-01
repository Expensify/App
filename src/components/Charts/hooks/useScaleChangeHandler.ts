import type {Scale} from 'victory-native';

import {useEffect, useEffectEvent, useRef} from 'react';

/**
 * Returns a CartesianChart `onScaleChange` handler that passes the scales to `onScales`.
 * victory-native reports scales only when an axis changes, so the stored ones are passed again when data or series change.
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
