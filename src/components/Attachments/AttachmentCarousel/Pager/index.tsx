import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {NativeViewGestureHandlerProps} from 'react-native-gesture-handler';
import {createNativeWrapper} from 'react-native-gesture-handler';
import type {PagerViewProps} from 'react-native-pager-view';
import PagerView from 'react-native-pager-view';
import Animated, {useAnimatedProps, useSharedValue} from 'react-native-reanimated';
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
    isZoomedOut?: boolean;
    renderItem: (props: {item: PagerItem; index: number; isActive: boolean}) => React.ReactNode;
    initialIndex: number;
    onPageSelected: () => void;
    shouldShowArrows: boolean;
    setShouldShowArrows: (shouldShowArrows: boolean) => void;
};

function AttachmentCarouselPager(
    {items, isZoomedOut = true, renderItem, initialIndex, onPageSelected, shouldShowArrows, setShouldShowArrows}: AttachmentCarouselPagerProps,
    ref: ForwardedRef<AttachmentCarouselPagerHandle>,
) {
    const styles = useThemeStyles();
    const pagerRef = useRef<PagerView>(null);

    const scale = useSharedValue(1);
    const isPagerScrolling = useSharedValue(false);
    const isScrollEnabled = useSharedValue(isZoomedOut);

    const activePage = useSharedValue(initialIndex);
    const [activePageState, setActivePageState] = useState(initialIndex);

    const pageScrollHandler = usePageScrollHandler(
        {
            onPageScroll: (e) => {
                'worklet';

                activePage.value = e.position;
                isPagerScrolling.value = e.offset !== 0;
            },
        },
        [],
    );

    useEffect(() => {
        setActivePageState(initialIndex);
        activePage.value = initialIndex;
    }, [activePage, initialIndex]);

    const handleScaleChange = useCallback(
        (newScale: number) => {
            if (newScale === scale.value) {
                return;
            }

            scale.value = newScale;

            const newIsZoomedOut = newScale === 1;

            if (isZoomedOut === newIsZoomedOut) {
                return;
            }

            isScrollEnabled.value = newIsZoomedOut;
            setShouldShowArrows(newIsZoomedOut);
        },
        [isScrollEnabled, isZoomedOut, scale, setShouldShowArrows],
    );

    const onTap = useCallback(() => {
        if (!isScrollEnabled.value) {
            return;
        }

        setShouldShowArrows(!shouldShowArrows);
    }, [isScrollEnabled.value, setShouldShowArrows, shouldShowArrows]);

    const contextValue = useMemo(
        () => ({
            pagerRef,
            isPagerScrolling,
            isScrollEnabled,
            onTap,
            onScaleChanged: handleScaleChange,
        }),
        [isPagerScrolling, isScrollEnabled, onTap, handleScaleChange],
    );

    const animatedProps = useAnimatedProps(() => ({
        scrollEnabled: isScrollEnabled.value,
    }));

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
                onPageScroll={pageScrollHandler}
                onPageSelected={onPageSelected}
                ref={pagerRef}
                style={styles.flex1}
                initialPage={initialIndex}
                animatedProps={animatedProps}
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
