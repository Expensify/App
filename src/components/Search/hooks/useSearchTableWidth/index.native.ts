import type {ComponentRef} from 'react';
import type {LayoutChangeEvent, View} from 'react-native';

import {useRef, useState} from 'react';

/**
 * Native measures the table width from `onLayout` alone: text can't be measured on native, so the columns are never
 * dynamically sized and there is no pre-paint snap to avoid. The ref is returned unused so the call signature matches
 * web, where it is attached to the container to take the synchronous first measurement.
 */
function useSearchTableWidth() {
    const tableWidthRef = useRef<ComponentRef<typeof View> | null>(null);
    const [tableWidth, setTableWidth] = useState(0);

    const onTableLayout = (event: LayoutChangeEvent) => {
        setTableWidth(event.nativeEvent.layout.width);
    };

    return {tableWidthRef, tableWidth, onTableLayout};
}

export default useSearchTableWidth;
