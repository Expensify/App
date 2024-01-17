import type {ForwardedRef} from 'react';
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {NativeViewGestureHandlerProps} from 'react-native-gesture-handler';
import {createNativeWrapper} from 'react-native-gesture-handler';
import type {PagerViewProps} from 'react-native-pager-view';
import PagerView from 'react-native-pager-view';
import Animated, {useSharedValue} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import AttachmentCarouselPagerContext from './AttachmentCarouselPagerContext';
import usePageScrollHandler from './usePageScrollHandler';

const WrappedPagerView = createNativeWrapper(PagerView) as React.ForwardRefExoticComponent<
    PagerViewProps & NativeViewGestureHandlerProps & React.RefAttributes<React.Component<PagerViewProps>>
>;
const AnimatedPagerView = Animated.createAnimatedComponent(WrappedPagerView);

type AttachmentCarouselPagerHandle = {
    setPage: (selectedPage: number) => void;
};

type PagerItem = {
    key: string;
    url: string;
    source: string;
};

type AttachmentCarouselPagerProps = {
    items: PagerItem[];
    scrollEnabled?: boolean;
    renderItem: (props: {item: PagerItem; index: number; isActive: boolean}) => React.ReactNode;
    initialIndex: number;
    onTap: () => void;
    onPageSelected: () => void;
    onScaleChanged: (scale: number) => void;
};

function AttachmentCarouselPager(
    {items, scrollEnabled = true, renderItem, initialIndex, onTap, onPageSelected, onScaleChanged}: AttachmentCarouselPagerProps,
    ref: ForwardedRef<AttachmentCarouselPagerHandle>,
) {
    const styles = useThemeStyles();
    const pagerRef = useRef<PagerView>(null);

    const isPdfZooming = useSharedValue(false);
    const isPagerSwiping = useSharedValue(false);
    const activePage = useSharedValue(initialIndex);
    const [activePageState, setActivePageState] = useState(initialIndex);

    const pageScrollHandler = usePageScrollHandler(
        {
            onPageScroll: (e) => {
                'worklet';

                activePage.value = e.position;
                isPagerSwiping.value = e.offset !== 0;
            },
        },
        [],
    );

    useEffect(() => {
        setActivePageState(initialIndex);
        activePage.value = initialIndex;
    }, [activePage, initialIndex]);

    const contextValue = useMemo(
        () => ({
            pagerRef,
            isPagerSwiping,
            isPdfZooming,
            onTap,
            onScaleChanged,
        }),
        [isPagerSwiping, isPdfZooming, onTap, onScaleChanged],
    );

    useImperativeHandle<AttachmentCarouselPagerHandle, AttachmentCarouselPagerHandle>(
        ref,
        () => ({
            setPage: (selectedPage) => {
                pagerRef.current?.setPage(selectedPage);
            },
        }),
        [],
    );

    return (
        <AttachmentCarouselPagerContext.Provider value={contextValue}>
            <AnimatedPagerView
                pageMargin={40}
                offscreenPageLimit={1}
                scrollEnabled={scrollEnabled && !isPdfZooming.value}
                onPageScroll={pageScrollHandler}
                onPageSelected={onPageSelected}
                ref={pagerRef}
                style={styles.flex1}
                initialPage={initialIndex}
            >
                {items.map((item, index) => (
                    <View
                        key={item.source}
                        style={styles.flex1}
                    >
                        {renderItem({item, index, isActive: index === activePageState})}
                    </View>
                ))}
            </AnimatedPagerView>
        </AttachmentCarouselPagerContext.Provider>
    );
}
AttachmentCarouselPager.displayName = 'AttachmentCarouselPager';

export default React.forwardRef(AttachmentCarouselPager);
