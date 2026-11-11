import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

type WiseQuoteCarouselArrowProps = {
    direction: 'previous' | 'next';
    isDisabled: boolean;
    onPress: () => void;
};

function WiseQuoteCarouselArrow({direction, isDisabled, onPress}: WiseQuoteCarouselArrowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'BackArrow']);
    const isPrevious = direction === 'previous';

    return (
        <PressableWithFeedback
            accessibilityRole="button"
            accessible
            accessibilityLabel={translate(isPrevious ? 'common.previous' : 'common.next')}
            style={[styles.reportPreviewArrowButton, StyleUtils.getBackgroundColorStyle(theme.buttonDefaultBG)]}
            onPress={onPress}
            disabled={isDisabled}
            disabledStyle={[styles.cursorDefault, styles.buttonOpacityDisabled]}
            sentryLabel={isPrevious ? CONST.SENTRY_LABEL.WISE_QUOTE_CAROUSEL.PREVIOUS : CONST.SENTRY_LABEL.WISE_QUOTE_CAROUSEL.NEXT}
        >
            <Icon
                src={isPrevious ? icons.BackArrow : icons.ArrowRight}
                fill={theme.icon}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
            />
        </PressableWithFeedback>
    );
}

export default WiseQuoteCarouselArrow;
