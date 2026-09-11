import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {LegendListRef, ViewToken} from '@legendapp/list/react-native';
import type {ReactElement, ReactNode} from 'react';
import type {LayoutChangeEvent, ViewStyle} from 'react-native';

import {LegendList} from '@legendapp/list/react-native';
import React, {cloneElement, isValidElement, useEffect, useRef, useState} from 'react';
import {Platform, View} from 'react-native';

import type {FeatureTrainingActionsValue, FeatureTrainingStateValue} from './context';
import type {IllustrationProps} from './primitives/Illustration';
import type {FeatureTrainingCarouselProps} from './types';

import {FeatureTrainingActionsContext, FeatureTrainingStateContext} from './context';
import useScrollableWrapper from './hooks/useScrollableWrapper';
import Body from './primitives/Body';
import BodyText from './primitives/BodyText';
import CloseButton from './primitives/CloseButton';
import Illustration from './primitives/Illustration';
import Page from './primitives/Page';
import PaginationDots from './primitives/PaginationDots';

const CAROUSEL_VIEWABILITY_CONFIG = {
    itemVisiblePercentThreshold: 95,
};
const WEB_CAROUSEL_PAGE_SNAP_STYLE: ViewStyle =
    Platform.OS === 'web'
        ? ({
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
          } as ViewStyle)
        : {};
type BodyElement = ReactElement<React.ComponentProps<typeof Body>>;
type BodyTextElement = ReactElement<React.ComponentProps<typeof BodyText>>;
type IllustrationElement = ReactElement<IllustrationProps>;
type PageElement = ReactElement<React.ComponentProps<typeof Page>>;
function isBodyElement(child: ReactElement): child is BodyElement {
    return child.type === Body;
}
function isBodyTextElement(child: ReactElement): child is BodyTextElement {
    return child.type === BodyText;
}
function isIllustrationElement(child: ReactElement): child is IllustrationElement {
    return child.type === Illustration;
}
function isPageElement(child: ReactElement): child is PageElement {
    return child.type === Page;
}
type SplitPage = {
    illustration: IllustrationElement | null;
    body: BodyElement | null;
    bodyText: BodyTextElement | null;
};
function splitPageChildren(pageChildren: ReactNode): SplitPage {
    let illustration: IllustrationElement | null = null;
    let body: BodyElement | null = null;
    let bodyText: BodyTextElement | null = null;
    React.Children.forEach(pageChildren, (child) => {
        if (!isValidElement(child)) {
            return;
        }
        if (isIllustrationElement(child)) {
            illustration = child;
            return;
        }
        if (isBodyElement(child)) {
            body = child;
            React.Children.forEach(child.props.children, (bodyChild) => {
                if (!isValidElement(bodyChild) || !isBodyTextElement(bodyChild)) {
                    return;
                }
                bodyText = bodyChild;
            });
        }
    });
    return {
        illustration,
        body,
        bodyText,
    };
}
function FeatureTrainingCarousel({
    onConfirm,
    onClose,
    onPageChange,
    shouldUseScrollView = false,
    width = variables.featureTrainingModalWidth,
    confirmSentryLabel,
    children,
}: FeatureTrainingCarouselProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [carouselViewportWidth, setCarouselViewportWidth] = useState(0);
    const horizontalListRef = useRef<LegendListRef>(null);
    const lastReportedPage = useRef(0);
    const [contentMinHeight, setContentMinHeight] = useState<number | undefined>(undefined);
    const measuredHeightsRef = useRef<Record<number, number>>({});
    const {
        Wrapper,
        wrapperProps,
        setContainerHeight,
        shouldUseScrollView: usingScrollView,
        isInLandscapeMode,
    } = useScrollableWrapper({
        shouldUseScrollView,
        width,
    });
    const pages = (() => {
        const pageList: SplitPage[] = [];
        React.Children.forEach(children, (child) => {
            if (!isValidElement(child) || !isPageElement(child)) {
                return;
            }
            pageList.push(splitPageChildren(child.props.children));
        });
        return pageList;
    })();
    const onPageChangeRef = useRef(onPageChange);
    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    }, [onPageChange]);
    const onViewableItemsChanged = ({viewableItems}: {viewableItems: ViewToken[]}) => {
        const entry = viewableItems.at(0);
        if (entry?.index == null || entry.index === lastReportedPage.current) {
            return;
        }
        lastReportedPage.current = entry.index;
        setCurrentPage(entry.index);
        onPageChangeRef.current?.(entry.index);
    };
    const advance = () => {
        horizontalListRef.current?.scrollToIndex({
            index: Math.min(currentPage + 1, pages.length - 1),
            animated: true,
        });
    };
    const goBack = () => {
        if (currentPage <= 0) {
            return;
        }
        horizontalListRef.current?.scrollToIndex({
            index: Math.max(currentPage - 1, 0),
            animated: true,
        });
    };
    const pageCountRef = useRef(pages.length);
    useEffect(() => {
        pageCountRef.current = pages.length;
    }, [pages.length]);

    // Re-align the horizontal offset to the current page whenever the viewport width changes (e.g. device
    // rotation or window resize). Without this the old pixel offset no longer lands on a page boundary and
    // the carousel gets stuck between pages.
    useEffect(() => {
        if (carouselViewportWidth <= 0) {
            return;
        }
        horizontalListRef.current?.scrollToOffset({
            offset: lastReportedPage.current * carouselViewportWidth,
            animated: false,
        });
    }, [carouselViewportWidth]);
    const recordPageHeight = (index: number, measured: number) => {
        if (measuredHeightsRef.current[index] === measured) {
            return;
        }
        measuredHeightsRef.current[index] = measured;
        if (Object.keys(measuredHeightsRef.current).length < pageCountRef.current) {
            return;
        }
        setContentMinHeight(Math.max(...Object.values(measuredHeightsRef.current)));
    };
    const isLastPage = pages.length === 0 || currentPage >= pages.length - 1;
    const handleConfirm = () => {
        onConfirm?.(false);
    };
    const handleClose = () => onClose?.();
    const stateValue: FeatureTrainingStateValue = {
        willShowAgain: true,
        shouldShowLoadingImmediatelyOnPress: isLastPage ? undefined : false,
        isCarousel: true,
        confirmSentryLabel,
        currentPage,
        pageCount: pages.length,
        isLastPage,
        contentMinHeight,
    };
    const actionsValue: FeatureTrainingActionsValue = {
        toggleWillShowAgain: () => {},
        handleConfirm,
        handleClose,
        advance,
        goBack,
    };
    const currentPageBody = pages.at(currentPage)?.body ?? null;
    const carouselExtraData = {
        currentPage,
        carouselViewportWidth,
    };
    const onWrapperLayout = (e: LayoutChangeEvent) => {
        const newWidth = e.nativeEvent.layout.width;
        if (newWidth === carouselViewportWidth || newWidth <= 0) {
            return;
        }
        setCarouselViewportWidth(newWidth);
        if (!usingScrollView) {
            return;
        }
        setContainerHeight(e.nativeEvent.layout.height);
    };
    const probeStyle: ViewStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: carouselViewportWidth,
        opacity: 0,
    };
    return (
        <FeatureTrainingStateContext.Provider value={stateValue}>
            <FeatureTrainingActionsContext.Provider value={actionsValue}>
                <Wrapper
                    {...wrapperProps}
                    onLayout={onWrapperLayout}
                    contentContainerStyle={isInLandscapeMode ? wrapperProps.contentContainerStyle : undefined}
                >
                    {carouselViewportWidth > 0 && contentMinHeight === undefined && (
                        <View
                            pointerEvents="none"
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                            style={probeStyle}
                        >
                            {pages.map((probePage, index) =>
                                probePage.bodyText == null ? null : (
                                    <ProbePage
                                        // Static per pages array lifetime — the carousel's page count is fixed at mount.
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={`FeatureTrainingCarousel-probe-${index}`}
                                        index={index}
                                        bodyText={probePage.bodyText}
                                        onMeasure={recordPageHeight}
                                    />
                                ),
                            )}
                        </View>
                    )}
                    {carouselViewportWidth > 0 && (
                        <>
                            <View>
                                <LegendList
                                    ref={horizontalListRef}
                                    data={pages}
                                    extraData={carouselExtraData}
                                    keyExtractor={(_page, index) => `FeatureTrainingCarousel-page-${index}`}
                                    horizontal
                                    pagingEnabled
                                    initialScrollIndex={currentPage}
                                    disableIntervalMomentum
                                    snapToInterval={carouselViewportWidth}
                                    decelerationRate="fast"
                                    bounces={false}
                                    showsHorizontalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    viewabilityConfig={CAROUSEL_VIEWABILITY_CONFIG}
                                    onViewableItemsChanged={onViewableItemsChanged}
                                    getFixedItemSize={() => carouselViewportWidth}
                                    renderItem={({item, index}) => (
                                        <View
                                            style={[
                                                {
                                                    width: carouselViewportWidth,
                                                },
                                                WEB_CAROUSEL_PAGE_SNAP_STYLE,
                                            ]}
                                        >
                                            {item.illustration == null
                                                ? null
                                                : cloneElement(item.illustration, {
                                                      isFocused: index === currentPage,
                                                  })}
                                        </View>
                                    )}
                                />
                                <PaginationDots />
                            </View>
                            {currentPageBody}
                            <CloseButton />
                        </>
                    )}
                </Wrapper>
            </FeatureTrainingActionsContext.Provider>
        </FeatureTrainingStateContext.Provider>
    );
}
FeatureTrainingCarousel.displayName = 'FeatureTraining.Carousel';
type ProbePageProps = {
    index: number;
    bodyText: BodyTextElement;
    onMeasure: (index: number, height: number) => void;
};

// The probe measures only the BodyText block (title/subtitle/description) — buttons and checkboxes are
// excluded so the locked minHeight matches the area it is later applied to. The mh5 wrapper mirrors
// Body's horizontal margins so the probe text wraps at the same width as the visible page.
function ProbePage({index, bodyText, onMeasure}: ProbePageProps) {
    const styles = useThemeStyles();
    const onLayout = (event: LayoutChangeEvent) => onMeasure(index, event.nativeEvent.layout.height);
    return (
        <View style={styles.mh5}>
            {cloneElement(bodyText, {
                onLayout,
            })}
        </View>
    );
}
export default FeatureTrainingCarousel;
