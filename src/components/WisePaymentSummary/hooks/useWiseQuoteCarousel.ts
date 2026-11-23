import type ScrollView from '@components/ScrollView';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ComponentRef, RefObject} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useRef, useState} from 'react';

/** How much of the next card shows at the edge, so the admin sees there is more to review */
const NEXT_CARD_PEEK = 32;

type WiseQuoteCarouselState = {
    scrollViewRef: RefObject<ComponentRef<typeof ScrollView> | null>;
    containerWidth: number;
    cardWidth: number;
    cardStep: number;
    hasMultipleReports: boolean;

    /** The card the arrows act on */
    shownIndex: number;
    lastIndex: number;
    scrollToIndex: (index: number) => void;
    onLayout: (event: LayoutChangeEvent) => void;
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onScrollBeginDrag: () => void;
};

/** Scroll state of the Wise quote carousel, shared by its cards and the arrows the modal shows next to its title */
function useWiseQuoteCarousel(reportCount: number): WiseQuoteCarouselState {
    const styles = useThemeStyles();
    const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    // The card an arrow press is scrolling to. Until the scroll reaches it, the arrows follow it instead of the
    // in-between scroll positions, so they don't toggle between disabled and enabled during the animation.
    const [targetIndex, setTargetIndex] = useState<number | undefined>(undefined);
    const shownIndex = targetIndex ?? currentIndex;

    const hasMultipleReports = reportCount > 1;
    const cardWidth = hasMultipleReports ? containerWidth - NEXT_CARD_PEEK : containerWidth;
    const cardStep = cardWidth + styles.gap3.gap;
    const lastIndex = reportCount - 1;

    const scrollToIndex = (index: number) => {
        setTargetIndex(index);
        scrollViewRef.current?.scrollTo({x: index * cardStep, animated: true});
    };

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!cardStep) {
            return;
        }
        const index = Math.min(lastIndex, Math.max(0, Math.round(event.nativeEvent.contentOffset.x / cardStep)));
        setCurrentIndex(index);
        if (index === targetIndex) {
            setTargetIndex(undefined);
        }
    };

    return {
        scrollViewRef,
        containerWidth,
        cardWidth,
        cardStep,
        hasMultipleReports,
        shownIndex,
        lastIndex,
        scrollToIndex,
        onLayout: (event) => setContainerWidth(event.nativeEvent.layout.width),
        onScroll,
        onScrollBeginDrag: () => setTargetIndex(undefined),
    };
}

export default useWiseQuoteCarousel;
export type {WiseQuoteCarouselState};
