import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {NativeViewGestureHandlerProps} from 'react-native-gesture-handler';
import {createNativeWrapper} from 'react-native-gesture-handler';
import type {PagerViewProps} from 'react-native-pager-view';
import PagerView from 'react-native-pager-view';
import type {AnimatedProps} from 'react-native-reanimated';
import Animated, {runOnJS, useAnimatedProps, useAnimatedReaction, useSharedValue} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import AttachmentCarouselPagerContext from './AttachmentCarouselPagerContext';
import usePageScrollHandler from './usePageScrollHandler';

type PagerViewPropsObject = {
    [K in keyof PagerViewProps]: PagerViewProps[K];
};

type AnimatedNativeWrapperComponent<P extends Record<string, unknown>, C> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<AnimatedProps<P> & NativeViewGestureHandlerProps> & React.RefAttributes<C>
>;

const AnimatedPagerView = Animated.createAnimatedComponent(createNativeWrapper(PagerView)) as AnimatedNativeWrapperComponent<PagerViewPropsObject, PagerView>;

type AttachmentCarouselPagerHandle = {
    setPage: (selectedPage: number) => void;
};

type PagerItem = {
    key: string;
    url: string;
    source: string;
};

type AttachmentCarouselPagerProps = React.PropsWithChildren<{
    items: PagerItem[];
    renderItem: (props: {item: PagerItem; index: number; isActive: boolean}) => React.ReactNode;
    initialIndex: number;
    onPageSelected: () => void;
    onTap: () => void;
    onScaleChanged: (scale: number) => void;
    forwardedRef: React.Ref<AttachmentCarouselPagerHandle>;
}>;

function AttachmentCarouselPager({items, renderItem, initialIndex, onPageSelected, onTap, onScaleChanged, forwardedRef}: AttachmentCarouselPagerProps) {
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
        forwardedRef,
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
            onTap,
            onScaleChanged,
            pagerRef,
            shouldPagerScroll,
            isSwipingInPager,
        }),
        [isSwipingInPager, shouldPagerScroll, onScaleChanged, onTap],
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

const AttachmentCarouselPagerWithRef = React.forwardRef<AttachmentCarouselPagerHandle, Omit<AttachmentCarouselPagerProps, 'forwardedRef'>>((props, ref) => (
    <AttachmentCarouselPager
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

export default AttachmentCarouselPagerWithRef;
