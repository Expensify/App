import type {ForwardedRef} from 'react';
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {NativeViewGestureHandlerProps} from 'react-native-gesture-handler';
import {createNativeWrapper} from 'react-native-gesture-handler';
import type {PagerViewProps} from 'react-native-pager-view';
import PagerView from 'react-native-pager-view';
import Animated, {runOnJS, useAnimatedProps, useAnimatedReaction, useSharedValue} from 'react-native-reanimated';
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
    renderItem: (props: {item: PagerItem; index: number; isActive: boolean}) => React.ReactNode;
    initialIndex: number;
    onPageSelected: () => void;
    onScaleChanged: (scale: number) => void;
};

function AttachmentCarouselPager({items, renderItem, initialIndex, onPageSelected, onScaleChanged}: AttachmentCarouselPagerProps, ref: ForwardedRef<AttachmentCarouselPagerHandle>) {
    const styles = useThemeStyles();
    const shouldPagerScroll = useSharedValue(true);
    const pagerRef = useRef<PagerView>(null);

    const isSwipingInPager = useSharedValue(false);
    const activeIndex = useSharedValue(initialIndex);

    const pageScrollHandler = usePageScrollHandler(
        {
            onPageScroll: (e) => {
                'worklet';

                activeIndex.value = e.position;
                isSwipingInPager.value = e.offset !== 0;
            },
        },
        [],
    );

    const [activePage, setActivePage] = useState(initialIndex);

    useEffect(() => {
        setActivePage(initialIndex);
        activeIndex.value = initialIndex;
    }, [activeIndex, initialIndex]);

    // we use reanimated for this since onPageSelected is called
    // in the middle of the pager animation
    useAnimatedReaction(
        () => isSwipingInPager.value,
        (stillScrolling) => {
            if (stillScrolling) {
                return;
            }

            runOnJS(setActivePage)(activeIndex.value);
        },
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

    const animatedProps = useAnimatedProps(() => ({
        scrollEnabled: shouldPagerScroll.value,
    }));

    const contextValue = useMemo(
        () => ({
            onScaleChanged,
            pagerRef,
            shouldPagerScroll,
            isSwipingInPager,
        }),
        [isSwipingInPager, shouldPagerScroll, onScaleChanged],
    );

    return (
        <AttachmentCarouselPagerContext.Provider value={contextValue}>
            <AnimatedPagerView
                pageMargin={40}
                offscreenPageLimit={1}
                onPageScroll={pageScrollHandler}
                animatedProps={animatedProps}
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
                        {renderItem({item, index, isActive: index === activePage})}
                    </View>
                ))}
            </AnimatedPagerView>
        </AttachmentCarouselPagerContext.Provider>
    );
}
AttachmentCarouselPager.displayName = 'AttachmentCarouselPager';

export default React.forwardRef(AttachmentCarouselPager);
