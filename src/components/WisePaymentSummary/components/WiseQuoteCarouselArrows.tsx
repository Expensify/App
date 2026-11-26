import type {WiseQuoteCarouselState} from '@components/WisePaymentSummary/hooks/useWiseQuoteCarousel';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import WiseQuoteCarouselArrow from './WiseQuoteCarouselArrow';

type WiseQuoteCarouselArrowsProps = {
    carousel: WiseQuoteCarouselState;
};

/** Steps the Wise quote carousel one card back or forward */
function WiseQuoteCarouselArrows({carousel}: WiseQuoteCarouselArrowsProps) {
    const styles = useThemeStyles();
    const {shownIndex, lastIndex, scrollToIndex} = carousel;

    return (
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
    );
}

export default WiseQuoteCarouselArrows;
