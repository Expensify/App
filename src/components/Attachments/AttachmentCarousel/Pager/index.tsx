import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {NativeViewGestureHandlerProps} from 'react-native-gesture-handler';
import {createNativeWrapper} from 'react-native-gesture-handler';
import type {PagerViewProps} from 'react-native-pager-view';
import PagerView from 'react-native-pager-view';
import Animated, {useAnimatedProps, useSharedValue} from 'react-native-reanimated';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
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
    activeSource: string;
    initialPage: number;
    onPageSelected: () => void;
    onRequestToggleArrows: (showArrows?: boolean) => void;
};

function AttachmentCarouselPager({items, activeSource, initialPage, onPageSelected, onRequestToggleArrows}: AttachmentCarouselPagerProps, ref: ForwardedRef<AttachmentCarouselPagerHandle>) {
    const styles = useThemeStyles();
    const pagerRef = useRef<PagerView>(null);

    const scale = useRef(1);
    const isPagerScrolling = useSharedValue(false);
    const isScrollEnabled = useSharedValue(true);

    const activePage = useSharedValue(initialPage);
    const [activePageState, setActivePageState] = useState(initialPage);

    const pageScrollHandler = usePageScrollHandler((e) => {
        'worklet';

        activePage.value = e.position;
        isPagerScrolling.value = e.offset !== 0;
    }, []);

    useEffect(() => {
        setActivePageState(initialPage);
        activePage.value = initialPage;
    }, [activePage, initialPage]);

    const itemsMeta = useMemo(() => items.map((item, index) => ({source: item.source, index, isActive: index === activePageState})), [activePageState, items]);

    /**
     * This callback is passed to the MultiGestureCanvas/Lightbox through the AttachmentCarouselPagerContext.
     * It is used to react to zooming/pinching and (mostly) enabling/disabling scrolling on the pager,
     * as well as enabling/disabling the carousel buttons.
     */
    const handleScaleChange = useCallback(
        (newScale: number) => {
            if (newScale === scale.current) {
                return;
            }

            scale.current = newScale;

            const newIsScrollEnabled = newScale === 1;
            if (isScrollEnabled.value === newIsScrollEnabled) {
                return;
            }

            isScrollEnabled.value = newIsScrollEnabled;
            onRequestToggleArrows(newIsScrollEnabled);
        },
        [isScrollEnabled, onRequestToggleArrows],
    );

    /**
     * This callback is passed to the MultiGestureCanvas/Lightbox through the AttachmentCarouselPagerContext.
     * It is used to trigger touch events on the pager when the user taps on the MultiGestureCanvas/Lightbox.
     */
    const handleTap = useCallback(() => {
        if (!isScrollEnabled.value) {
            return;
        }

        onRequestToggleArrows();
    }, [isScrollEnabled.value, onRequestToggleArrows]);

    const contextValue = useMemo(
        () => ({
            itemsMeta,
            activePage: activePageState,
            isPagerScrolling,
            isScrollEnabled,
            pagerRef,
            onTap: handleTap,
            onScaleChanged: handleScaleChange,
        }),
        [itemsMeta, activePageState, isPagerScrolling, isScrollEnabled, handleTap, handleScaleChange],
    );

    const animatedProps = useAnimatedProps(() => ({
        scrollEnabled: isScrollEnabled.value,
    }));

    /**
     * This "useImperativeHandle" call is needed to expose certain imperative methods via the pager's ref.
     * setPage: can be used to programmatically change the page from a parent component
     */
    useImperativeHandle<AttachmentCarouselPagerHandle, AttachmentCarouselPagerHandle>(
        ref,
        () => ({
            setPage: (selectedPage) => {
                pagerRef.current?.setPage(selectedPage);
            },
        }),
        [],
    );

    const Content = useMemo(
        () =>
            items.map((item, index) => (
                <View
                    key={item.source}
                    style={styles.flex1}
                >
                    <CarouselItem
                        item={item}
                        isSingleItem={items.length === 1}
                        index={index}
                        isFocused={index === activePageState && activeSource === item.source}
                    />
                </View>
            )),
        [activePageState, activeSource, items, styles.flex1],
    );

    return (
        <AttachmentCarouselPagerContext.Provider value={contextValue}>
            <AnimatedPagerView
                pageMargin={40}
                offscreenPageLimit={1}
                onPageScroll={pageScrollHandler}
                onPageSelected={onPageSelected}
                style={styles.flex1}
                initialPage={initialPage}
                animatedProps={animatedProps}
                ref={pagerRef}
            >
                {Content}
            </AnimatedPagerView>
        </AttachmentCarouselPagerContext.Provider>
    );
}
AttachmentCarouselPager.displayName = 'AttachmentCarouselPager';

export default React.forwardRef(AttachmentCarouselPager);
