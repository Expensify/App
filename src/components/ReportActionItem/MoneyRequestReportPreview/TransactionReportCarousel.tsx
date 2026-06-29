import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import AccessMoneyRequestReportPreviewPlaceHolder from './AccessMoneyRequestReportPreviewPlaceHolder';
import EmptyMoneyRequestReportPreview from './EmptyMoneyRequestReportPreview';
import {useReportPreviewCarouselList, useReportPreviewMeta, useReportPreviewUIState} from './MoneyRequestReportPreviewContext';

/**
 * Renders the body of the money request report preview: a loading indicator, the access/empty placeholders,
 * or the horizontal transaction carousel. Reads everything from the preview context slices.
 */
function TransactionReportCarousel() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldShowPreviewLoading, shouldShowAccessPlaceHolder, shouldShowEmptyPlaceholder, previewCarouselMinWidth, carouselReasonAttributes, reportPreviewStyles} =
        useReportPreviewUIState();
    const carousel = useReportPreviewCarouselList();
    const {setCarouselRef} = useReportPreviewMeta();

    if (shouldShowPreviewLoading) {
        return (
            <View
                style={[
                    StyleUtils.getHeight(CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.WIDE_HEIGHT),
                    StyleUtils.getMinimumWidth(previewCarouselMinWidth),
                    styles.justifyContentCenter,
                    styles.mtn1,
                ]}
            >
                <ActivityIndicator
                    size={40}
                    reasonAttributes={carouselReasonAttributes}
                />
            </View>
        );
    }

    if (shouldShowAccessPlaceHolder) {
        return <AccessMoneyRequestReportPreviewPlaceHolder />;
    }

    if (shouldShowEmptyPlaceholder) {
        return <EmptyMoneyRequestReportPreview />;
    }

    return (
        <View style={[styles.flex1, styles.flexColumn, styles.overflowVisible, styles.minHeight42]}>
            <FlashList
                key={carousel.carouselKey}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToOffsets={carousel.snapOffsets}
                horizontal
                ItemSeparatorComponent={carousel.renderSeparator}
                data={carousel.carouselTransactions}
                ref={setCarouselRef}
                nestedScrollEnabled
                bounces={false}
                keyExtractor={(item) => `${item.transactionID}_${reportPreviewStyles.transactionPreviewCarouselStyle.width}`}
                contentContainerStyle={styles.ph2}
                style={reportPreviewStyles.flatListStyle}
                showsHorizontalScrollIndicator={false}
                renderItem={carousel.renderItem}
                getItemType={carousel.getItemType}
                onViewableItemsChanged={carousel.onViewableItemsChanged}
                onEndReached={carousel.adjustScroll}
                viewabilityConfig={carousel.viewabilityConfig}
                ListFooterComponent={<View style={styles.pl2} />}
                ListHeaderComponent={<View style={styles.pr2} />}
                drawDistance={1000}
            />
        </View>
    );
}

export default TransactionReportCarousel;
