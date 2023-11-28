import React, {ComponentType, ForwardedRef, ReactNode, RefObject, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {createNativeWrapper, GestureHandlerRootView} from 'react-native-gesture-handler';
import PagerView, {PagerViewOnPageScrollEventData} from 'react-native-pager-view';
import {OnPageSelectedEventData} from 'react-native-pager-view/lib/typescript/PagerViewNativeComponent';
import Animated, {runOnJS, useAnimatedProps, useAnimatedReaction, useEvent, useHandler, useSharedValue} from 'react-native-reanimated';
import {DependencyList} from 'react-native-reanimated/lib/typescript/reanimated2/hook';
import {DirectEventHandler} from 'react-native/Libraries/Types/CodegenTypes';
import {Attachment} from '@components/Attachments/AttachmentCarousel/types';
import useThemeStyles from '@styles/useThemeStyles';
import AttachmentCarouselPagerContext, {AttachmentCarouselPagerContextValue} from './AttachmentCarouselPagerContext';

type PagerScrollEvent = PagerViewOnPageScrollEventData & {
    eventName?: string;
};

const AnimatedPagerView = Animated.createAnimatedComponent(createNativeWrapper(PagerView));

function usePageScrollHandler<TContext extends Record<string, unknown>>(handlers: {onPageScroll: (event: PagerScrollEvent, context: TContext) => void}, dependencies: DependencyList) {
    const {context, doDependenciesDiffer} = useHandler(handlers, dependencies);
    const subscribeForEvents = ['onPageScroll'];

    return useEvent<PagerScrollEvent>(
        (event) => {
            'worklet';

            const {onPageScroll} = handlers;
            if (onPageScroll && event.eventName?.endsWith('onPageScroll')) {
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
    items: Attachment[];
    renderItem: (props: {item: Attachment; isActive: boolean; index: number}) => ReactNode;
    initialIndex?: number;
    onPageSelected: DirectEventHandler<OnPageSelectedEventData>;
    onTap?: () => void;
    onSwipe?: () => void;
    onSwipeSuccess?: () => void;
    onSwipeDown?: () => void;
    onPinchGestureChange?: (value?: boolean) => void;
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
    ref: ForwardedRef<PagerView>,
) {
    const styles = useThemeStyles();
    const shouldPagerScroll = useSharedValue(true);
    const pagerRef = useRef<PagerView>(null);

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
        () =>
            ({
                setPage: (...props) => pagerRef?.current?.setPage(...props),
            } as PagerView),
        [],
    );

    const animatedProps = useAnimatedProps(() => ({
        scrollEnabled: shouldPagerScroll.value,
    }));

    const contextValue: AttachmentCarouselPagerContextValue = useMemo(
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
                    ref={pagerRef as unknown as RefObject<ComponentType<PagerView>>}
                    style={styles.flex1}
                    initialPage={initialIndex}
                >
                    {items.map((item, index) => (
                        <View
                            key={String(item.source)}
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
