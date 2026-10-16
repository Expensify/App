import {useFeatureTrainingState} from '@components/FeatureTraining/context';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

const CAROUSEL_DOT_SIZE = 6;
const PAGINATION_DOTS_BOTTOM_OFFSET = 5;
const CONTENT_PADDING = variables.spacing2;

function PaginationDots() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isCarousel, currentPage, pageCount} = useFeatureTrainingState();

    if (!isCarousel || currentPage === undefined || pageCount === undefined) {
        return null;
    }

    return (
        <View
            pointerEvents="none"
            style={[
                styles.pAbsolute,
                styles.flexRow,
                styles.justifyContentCenter,
                styles.w100,
                styles.l0,
                styles.r0,
                StyleUtils.getFeatureTrainingCarouselDotsContainerStyle(PAGINATION_DOTS_BOTTOM_OFFSET + CONTENT_PADDING),
            ]}
        >
            {Array.from({length: pageCount}, (_v, index) => (
                <View
                    key={`carousel-dot-${index}`}
                    style={StyleUtils.getFeatureTrainingCarouselDotStyle(CAROUSEL_DOT_SIZE, theme.buttonSuccessText, index === currentPage)}
                />
            ))}
        </View>
    );
}

PaginationDots.displayName = 'FeatureTraining.PaginationDots';

export default PaginationDots;
