import React, {memo, useContext, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useSharedValue} from 'react-native-reanimated';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';
import type AttachmentViewPdfProps from './types';

// If the user pans less than this threshold, we'll not enable/disable the pager scroll, since the thouch will most probably be a tap.
// If the user moves their finger more than this threshold in the X direction, we'll enable the pager scroll. Otherwise if in the Y direction, we'll disable it.
const SCROLL_THRESHOLD = 10;

function AttachmentViewPdf(props: AttachmentViewPdfProps) {
    const styles = useThemeStyles();
    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const scale = useSharedValue(1);

    // Reanimated freezes all objects captured in the closure of a worklet.
    // Since Reanimated 3, entire objects are captured instead of just the relevant properties.
    // See https://github.com/software-mansion/react-native-reanimated/pull/4060
    // Because context contains more properties, all of them (most notably the pager ref) were
    // frozen, which combined with Reanimated using strict mode since 3.6.0 was resulting in errors.
    // Without strict mode, it would just silently fail.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#description
    const isScrollEnabled = attachmentCarouselPagerContext === null ? undefined : attachmentCarouselPagerContext.isScrollEnabled;

    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const isPanGestureActive = useSharedValue(false);

    const Pan = Gesture.Pan()
        .manualActivation(true)
        .onTouchesMove((evt) => {
            if (offsetX.value !== 0 && offsetY.value !== 0 && isScrollEnabled) {
                const translateX = Math.abs(evt.allTouches[0].absoluteX - offsetX.value);
                const translateY = Math.abs(evt.allTouches[0].absoluteY - offsetY.value);
                const allowEnablingScroll = !isPanGestureActive.value || isScrollEnabled.value;

                // if the value of X is greater than Y and the pdf is not zoomed in,
                // enable  the pager scroll so that the user
                // can swipe to the next attachment otherwise disable it.
                if (translateX > translateY && translateX > SCROLL_THRESHOLD && scale.value === 1 && allowEnablingScroll) {
                    isScrollEnabled.value = true;
                } else if (translateY > SCROLL_THRESHOLD) {
                    isScrollEnabled.value = false;
                }
            }

            isPanGestureActive.value = true;
            offsetX.value = evt.allTouches[0].absoluteX;
            offsetY.value = evt.allTouches[0].absoluteY;
        })
        .onTouchesUp(() => {
            isPanGestureActive.value = false;
            if (!isScrollEnabled) {
                return;
            }
            isScrollEnabled.value = true;
        });

    const Content = useMemo(
        () => (
            <BaseAttachmentViewPdf
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                onScaleChanged={(newScale) => {
                    // The react-native-pdf's onScaleChanged event will sometimes give us scale values of e.g. 0.99... instead of 1,
                    // even though we're not pinching/zooming
                    // Rounding the scale value to 2 decimal place fixes this issue, since pinching will still be possible but very small pinches are ignored.
                    scale.value = Math.round(newScale * 1e2) / 1e2;
                }}
            />
        ),
        [props, scale],
    );

    return (
        <View
            collapsable={false}
            style={styles.flex1}
        >
            {attachmentCarouselPagerContext === null ? (
                Content
            ) : (
                <GestureDetector gesture={Pan}>
                    <Animated.View
                        collapsable={false}
                        style={[StyleSheet.absoluteFill, styles.justifyContentCenter, styles.alignItemsCenter]}
                    >
                        {Content}
                    </Animated.View>
                </GestureDetector>
            )}
        </View>
    );
}

export default memo(AttachmentViewPdf);
