import type {ForwardedRef, SetStateAction} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, {useAnimatedProps, useSharedValue} from 'react-native-reanimated';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import useCarouselContextEvents from '@components/Attachments/AttachmentCarousel/useCarouselContextEvents';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import useThemeStyles from '@hooks/useThemeStyles';
import shouldUseNewPager from '@libs/shouldUseNewPager';
import AttachmentCarouselPagerContext from './AttachmentCarouselPagerContext';
import usePageScrollHandler from './usePageScrollHandler';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

type AttachmentCarouselPagerHandle = {
    setPage: (selectedPage: number) => void;
};

type AttachmentCarouselPagerProps = {
    /** The attachments to be rendered in the pager. */
    items: Attachment[];

    /** The id or source (URL) of the currently active attachment. */
    activeAttachmentID: AttachmentSource;

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

    /** A callback that is called when swipe-down-to-close gesture happens */
    onClose: () => void;

    /** Sets the visibility of the arrows. */
    setShouldShowArrows: (show?: SetStateAction<boolean>) => void;

    /** The reportID related to the attachment */
    reportID?: string;

    /** Callback for attachment errors */
    onAttachmentError?: (source: AttachmentSource) => void;
};

function AttachmentCarouselPager(
    {items, activeAttachmentID, initialPage, setShouldShowArrows, onPageSelected, onClose, reportID, onAttachmentError}: AttachmentCarouselPagerProps,
    ref: ForwardedRef<AttachmentCarouselPagerHandle>,
) {
    const {handleTap, handleScaleChange, isScrollEnabled} = useCarouselContextEvents(setShouldShowArrows);
    const styles = useThemeStyles();
    const pagerRef = useRef<PagerView>(null);

    const isPagerScrolling = useSharedValue(false);

    const activePage = useSharedValue(initialPage);
    const [activePageIndex, setActivePageIndex] = useState(initialPage);

    const pageScrollHandler = usePageScrollHandler((e) => {
        'worklet';

        activePage.set(e.position);
        isPagerScrolling.set(e.offset !== 0);
    }, []);

    useEffect(() => {
        setActivePageIndex(initialPage);
        activePage.set(initialPage);
    }, [activePage, initialPage]);

    /** The `pagerItems` object that passed down to the context. Later used to detect current page, whether it's a single image gallery etc. */
    const pagerItems = useMemo(
        () => items.map((item, index) => ({source: item.source, previewSource: item.previewSource, index, isActive: index === activePageIndex})),
        [activePageIndex, items],
    );

    const extractItemKey = useCallback((item: Attachment, index: number) => `attachmentID-${item.attachmentID}-${index}`, []);

    const nativeGestureHandler = Gesture.Native();

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
            onAttachmentError,
            externalGestureHandler: nativeGestureHandler,
        }),
        [pagerItems, activePageIndex, isPagerScrolling, isScrollEnabled, handleTap, onClose, handleScaleChange, nativeGestureHandler, onAttachmentError],
    );

    const animatedProps = useAnimatedProps(() => ({
        scrollEnabled: isScrollEnabled.get(),
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
                isFocused={index === activePageIndex && activeAttachmentID === (item.attachmentID ?? item.source)}
                reportID={reportID}
            />
        </View>
    ));

    return (
        <AttachmentCarouselPagerContext.Provider value={contextValue}>
            <GestureDetector gesture={nativeGestureHandler}>
                <AnimatedPagerView
                    pageMargin={40}
                    offscreenPageLimit={1}
                    onPageScroll={pageScrollHandler}
                    onPageSelected={onPageSelected}
                    style={styles.flex1}
                    initialPage={initialPage}
                    useNext={shouldUseNewPager()}
                    animatedProps={animatedProps}
                    ref={pagerRef}
                >
                    {carouselItems}
                </AnimatedPagerView>
            </GestureDetector>
        </AttachmentCarouselPagerContext.Provider>
    );
}
AttachmentCarouselPager.displayName = 'AttachmentCarouselPager';

export default React.forwardRef(AttachmentCarouselPager);
export type {AttachmentCarouselPagerHandle};
