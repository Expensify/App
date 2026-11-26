import ActivityIndicator from '@components/ActivityIndicator';
import ScrollView from '@components/ScrollView';
import type {WiseQuoteCarouselState} from '@components/WisePaymentSummary/hooks/useWiseQuoteCarousel';

import useThemeStyles from '@hooks/useThemeStyles';

import type {Report} from '@src/types/onyx';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import WiseQuotePaymentSummary from './WiseQuotePaymentSummary';

type WiseQuoteCarouselProps = {
    reports: Report[];

    /** The reports Wise pays through a global provider, which show a quote. The rest show their amounts with no fees */
    quotedReportIDs: string[];

    /** True until every report's quote has loaded or failed, shown as one loader for the whole carousel */
    isLoading: boolean;

    /** Scroll state shared with the arrows, which the modal shows next to its title */
    carousel: WiseQuoteCarouselState;
};

/** One Wise quote card per report, swiped or stepped through with the arrows */
function WiseQuoteCarousel({reports, quotedReportIDs, isLoading, carousel: {scrollViewRef, ...carousel}}: WiseQuoteCarouselProps) {
    const styles = useThemeStyles();

    // The cards scroll to the edges of the modal, past the margin around its content
    return (
        <View
            style={styles.mhn5}
            onLayout={carousel.onLayout}
        >
            {!!carousel.containerWidth && (
                <View>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={carousel.cardStep}
                        decelerationRate="fast"
                        scrollEventThrottle={16}
                        onScroll={carousel.onScroll}
                        onScrollBeginDrag={carousel.onScrollBeginDrag}
                        contentContainerStyle={[styles.gap3, styles.ph5]}
                    >
                        {reports.map((report) => (
                            <View
                                key={report.reportID}
                                style={{width: carousel.cardWidth}}
                            >
                                <WiseQuotePaymentSummary
                                    reportID={report.reportID}
                                    searchReport={report}
                                    isPayingUnheldOnly={false}
                                    isQuoteRequired={quotedReportIDs.includes(report.reportID)}
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
