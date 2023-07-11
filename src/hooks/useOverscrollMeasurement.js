import {useState, useCallback} from 'react';

export default function useOverscrollMeasurement() {
    const [overscrollBottom, setOverscrollBottom] = useState(0);
    const [overscrollTop, setOverscrollTop] = useState(0);

    const measureScrollPosition = useCallback((event) => {
        const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;

        if (contentOffset.y <= 0) {
            setOverscrollTop(-1 * Math.ceil(contentOffset.y));
        }

        const newOverscrollBottom = Math.ceil(layoutMeasurement.height + contentOffset.y - contentSize.height);
        if (newOverscrollBottom < 0) {
            return;
        }
        setOverscrollBottom(newOverscrollBottom);
    }, []);

    return {overscrollBottom, overscrollTop, measureScrollPosition};
}
