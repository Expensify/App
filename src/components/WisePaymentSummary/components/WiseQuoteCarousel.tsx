import ActivityIndicator from '@components/ActivityIndicator';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ComponentRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import WiseQuoteCarouselArrow from './WiseQuoteCarouselArrow';
import WiseQuotePaymentSummary from './WiseQuotePaymentSummary';

/** How much of the next card shows at the edge, so the admin sees there is more to review */
const NEXT_CARD_PEEK = 32;

type WiseQuoteCarouselProps = {
    reportIDs: string[];

    /** The reports Wise pays through a global provider, which show a quote. The rest show their amounts with no fees */
    quotedReportIDs: string[];

    /** True until every report's quote has loaded or failed, shown as one loader for the whole carousel */
    isLoading: boolean;
};

/** One Wise quote card per report, swiped or stepped through with the arrows */
function WiseQuoteCarousel({reportIDs, quotedReportIDs, isLoading}: WiseQuoteCarouselProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    // The card an arrow press is scrolling to. Until the scroll reaches it, the arrows follow it instead of the
    // in-between scroll positions, so they don't toggle between disabled and enabled during the animation.
    const [targetIndex, setTargetIndex] = useState<number | undefined>(undefined);
    const shownIndex = targetIndex ?? currentIndex;

    const hasMultipleReports = reportIDs.length > 1;
    const cardWidth = hasMultipleReports ? containerWidth - NEXT_CARD_PEEK : containerWidth;
    const cardStep = cardWidth + styles.gap3.gap;
    const lastIndex = reportIDs.length - 1;

    const scrollToIndex = (index: number) => {
        setTargetIndex(index);
        scrollViewRef.current?.scrollTo({x: index * cardStep, animated: true});
    };

    const updateCurrentIndex = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!cardStep) {
            return;
        }
        const index = Math.min(lastIndex, Math.max(0, Math.round(event.nativeEvent.contentOffset.x / cardStep)));
        setCurrentIndex(index);
        if (index === targetIndex) {
            setTargetIndex(undefined);
        }
    };

    return (
        <View
            style={styles.gap3}
            onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                <Text style={styles.textLabelSupporting}>{translate('iou.wisePaymentSummary.reportCount', {count: reportIDs.length})}</Text>
                {hasMultipleReports && (
                    <View style={styles.flexRow}>
                        <WiseQuoteCarouselArrow
                            direction="previous"
                            isDisabled={shownIndex === 0}
                            onPress={() => scrollToIndex(shownIndex - 1)}
                        />
                        <WiseQuoteCarouselArrow
                            direction="next"
                            isDisabled={shownIndex === lastIndex}
                            onPress={() => scrollToIndex(shownIndex + 1)}
                        />
                    </View>
                )}
            </View>
            {!!containerWidth && (
                <View>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={cardStep}
                        decelerationRate="fast"
                        scrollEventThrottle={16}
                        onScroll={updateCurrentIndex}
                        onScrollBeginDrag={() => setTargetIndex(undefined)}
                        contentContainerStyle={styles.gap3}
                    >
                        {reportIDs.map((reportID) => (
                            <View
                                key={reportID}
                                style={{width: cardWidth}}
                            >
                                <WiseQuotePaymentSummary
                                    reportID={reportID}
                                    isPayingUnheldOnly={false}
                                    isQuoteRequired={quotedReportIDs.includes(reportID)}
                                    shouldShowLoadingIndicator={false}
                                />
                            </View>
                        ))}
                    </ScrollView>
                    {isLoading && (
                        <View style={[StyleSheet.absoluteFill, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <ActivityIndicator />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

export default WiseQuoteCarousel;
