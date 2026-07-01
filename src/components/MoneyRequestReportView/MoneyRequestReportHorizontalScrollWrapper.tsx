import React, {useCallback, useLayoutEffect, useRef} from 'react';
// ScrollView component needed for horizontal table scroll on wide layouts; vertical scroll happens in the parent FlashList.
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type MoneyRequestReportHorizontalScrollWrapperProps = {
    shouldScroll: boolean;
    contentWidth: number;
    /** When this value changes, the wrapper restores the previous horizontal scroll offset synchronously before paint. */
    restorationKey: unknown;
    children: React.ReactElement;
};

function MoneyRequestReportHorizontalScrollWrapper({shouldScroll, contentWidth, restorationKey, children}: MoneyRequestReportHorizontalScrollWrapperProps) {
    const styles = useThemeStyles();
    const scrollRef = useRef<RNScrollView>(null);
    const offsetRef = useRef(0);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        offsetRef.current = event.nativeEvent.contentOffset.x;
    }, []);

    useLayoutEffect(() => {
        if (!shouldScroll || offsetRef.current <= 0) {
            return;
        }
        scrollRef.current?.scrollTo({x: offsetRef.current, animated: false});
    }, [restorationKey, shouldScroll]);

    if (!shouldScroll) {
        return children;
    }

    return (
        <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator
            style={styles.flex1}
            contentContainerStyle={{width: contentWidth}}
            onScroll={handleScroll}
            scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
        >
            {children}
        </ScrollView>
    );
}

export default MoneyRequestReportHorizontalScrollWrapper;
