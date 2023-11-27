import React, {useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {createNativeWrapper, GestureHandlerRootView} from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, {runOnJS, useAnimatedProps, useAnimatedReaction, useEvent, useHandler, useSharedValue} from 'react-native-reanimated';
import {ScrollEvent} from 'react-native-reanimated/lib/typescript/reanimated2/hook/useAnimatedScrollHandler';
import useThemeStyles from '@styles/useThemeStyles';
import AttachmentCarouselPagerContext from './AttachmentCarouselPagerContext';

const AnimatedPagerView = Animated.createAnimatedComponent(createNativeWrapper(PagerView));

function usePageScrollHandler(handlers: {onPageScroll: (e: ScrollEvent) => void}, dependencies) {
    const {context, doDependenciesDiffer} = useHandler(handlers, dependencies);
    const subscribeForEvents = ['onPageScroll'];

    return useEvent(
        (event) => {
            'worklet';

            const {onPageScroll} = handlers;
            if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
                onPageScroll(event, context);
            }
        },
        subscribeForEvents,
        doDependenciesDiffer,
    );
}

const noopWorklet = () => {
    'worklet';

    // noop
};

type PagerProps = {
    items: Array<{
        key: string;
        url: string;
    }>;
    renderItem: () => void;
    initialIndex?: number;
    onPageSelected?: () => void;
    onTap?: () => void;
    onSwipe?: () => void;
    onSwipeSuccess?: () => void;
    onSwipeDown?: () => void;
    onPinchGestureChange?: () => void;
    containerWidth: number;
    containerHeight: number;
};

function AttachmentCarouselPager(
    {
        items,
        renderItem,
        initialIndex = 0,
        onPageSelected = () => {},
        onTap = () => {},
        onSwipe = noopWorklet,
        onSwipeSuccess = () => {},
        onSwipeDown = () => {},
        onPinchGestureChange = () => {},
        containerWidth,
        containerHeight,
    }: PagerProps,
    ref: any,
) {
    const styles = useThemeStyles();
    const shouldPagerScroll = useSharedValue(true);
    const pagerRef = useRef(null);

    const isScrolling = useSharedValue(false);
    const activeIndex = useSharedValue(initialIndex);

    const pageScrollHandler = usePageScrollHandler(
        {
            onPageScroll: (e) => {
                'worklet';

                activeIndex.value = e.position;
                isScrolling.value = e.offset !== 0;
            },
        },
        [],
    );

    const [activePage, setActivePage] = useState(initialIndex);

    // we use reanimated for this since onPageSelected is called
    // in the middle of the pager animation
    useAnimatedReaction(
        () => isScrolling.value,
        (stillScrolling) => {
            if (stillScrolling) {
                return;
            }

            runOnJS(setActivePage)(activeIndex.value);
        },
    );

    useImperativeHandle(
        ref,
        () => ({
            setPage: (...props) => pagerRef.current.setPage(...props),
        }),
        [],
    );

    const animatedProps = useAnimatedProps(() => ({
        scrollEnabled: shouldPagerScroll.value,
    }));

    const contextValue = useMemo(
        () => ({
            canvasWidth: containerWidth,
            canvasHeight: containerHeight,
            isScrolling,
            pagerRef,
            shouldPagerScroll,
            onPinchGestureChange,
            onTap,
            onSwipe,
            onSwipeSuccess,
            onSwipeDown,
        }),
        [containerWidth, containerHeight, isScrolling, pagerRef, shouldPagerScroll, onPinchGestureChange, onTap, onSwipe, onSwipeSuccess, onSwipeDown],
    );

    return (
        <GestureHandlerRootView style={styles.flex1}>
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
        </GestureHandlerRootView>
    );
}

AttachmentCarouselPager.displayName = 'AttachmentCarouselPager';

export default React.forwardRef(AttachmentCarouselPager);
