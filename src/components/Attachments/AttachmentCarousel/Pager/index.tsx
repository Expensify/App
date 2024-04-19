import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {NativeViewGestureHandlerProps} from 'react-native-gesture-handler';
import {createNativeWrapper} from 'react-native-gesture-handler';
import type {PagerViewProps} from 'react-native-pager-view';
import PagerView from 'react-native-pager-view';
import Animated, {useAnimatedProps, useSharedValue} from 'react-native-reanimated';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
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

type AttachmentCarouselPagerProps = {
    /** The attachments to be rendered in the pager. */
    items: Attachment[];

    /** The source (URL) of the currently active attachment. */
    activeSource: AttachmentSource;

    /** The index of the initial page to be rendered. */
    initialPage: number;

    /** A callback to be called when the page is changed. */
    onPageSelected: (
        event: NativeSyntheticEvent<
            Readonly<{
                position: number;
            }>
        >,
    ) => void;

    /**
     * A callback that can be used to toggle the attachment carousel arrows, when the scale of the image changes.
     * @param showArrows If set, it will show/hide the arrows. If not set, it will toggle the arrows.
     */
    onRequestToggleArrows: (showArrows?: boolean) => void;

    /** A callback that is called when swipe-down-to-close gesture happens */
    onClose: () => void;
};

function AttachmentCarouselPager(
    {items, activeSource, initialPage, onPageSelected, onRequestToggleArrows, onClose}: AttachmentCarouselPagerProps,
    ref: ForwardedRef<AttachmentCarouselPagerHandle>,
) {
    const styles = useThemeStyles();
    const pagerRef = useRef<PagerView>(null);

    const scale = useRef(1);
    const isPagerScrolling = useSharedValue(false);
    const isScrollEnabled = useSharedValue(true);

    const activePage = useSharedValue(initialPage);
    const [activePageIndex, setActivePageIndex] = useState(initialPage);

    const pageScrollHandler = usePageScrollHandler((e) => {
        'worklet';

        activePage.value = e.position;
        isPagerScrolling.value = e.offset !== 0;
    }, []);

    useEffect(() => {
        setActivePageIndex(initialPage);
        activePage.value = initialPage;
    }, [activePage, initialPage]);

    /** The `pagerItems` object that passed down to the context. Later used to detect current page, whether it's a single image gallery etc. */
    const pagerItems = useMemo(() => items.map((item, index) => ({source: item.source, index, isActive: index === activePageIndex})), [activePageIndex, items]);

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

    const extractItemKey = useCallback(
        (item: Attachment, index: number) =>
            typeof item.source === 'string' || typeof item.source === 'number' ? `source-${item.source}` : `reportActionID-${item.reportActionID}` ?? `index-${index}`,
        [],
    );

    const contextValue = useMemo(
        () => ({
            pagerItems,
            activePage: activePageIndex,
            isPagerScrolling,
            isScrollEnabled,
            pagerRef,
            onTap: handleTap,
            onSwipeDown: onClose,
            onScaleChanged: handleScaleChange,
        }),
        [pagerItems, activePageIndex, isPagerScrolling, isScrollEnabled, handleTap, onClose, handleScaleChange],
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

    const carouselItems = items.map((item, index) => (
        <View
            key={extractItemKey(item, index)}
            style={styles.flex1}
        >
            <CarouselItem
                item={item}
                isFocused={index === activePageIndex && activeSource === item.source}
            />
        </View>
    ));

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
                {carouselItems}
            </AnimatedPagerView>
        </AttachmentCarouselPagerContext.Provider>
    );
}
AttachmentCarouselPager.displayName = 'AttachmentCarouselPager';

export default React.forwardRef(AttachmentCarouselPager);
export type {AttachmentCarouselPagerHandle};
