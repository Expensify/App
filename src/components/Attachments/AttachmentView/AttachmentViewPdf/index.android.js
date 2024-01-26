import React, {memo, useCallback, useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useSharedValue} from 'react-native-reanimated';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseAttachmentViewPdf from './BaseAttachmentViewPdf';
import {attachmentViewPdfDefaultProps, attachmentViewPdfPropTypes} from './propTypes';

function AttachmentViewPdf(props) {
    const styles = useThemeStyles();
    const {onScaleChanged, ...restProps} = props;
    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const scaleRef = useSharedValue(1);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    // Reanimated freezes all objects captured in the closure of a worklet.
    // Since Reanimated 3, entire objects are captured instead of just the relevant properties.
    // See https://github.com/software-mansion/react-native-reanimated/pull/4060
    // Because context contains more properties, all of them (most notably the pager ref) were
    // frozen, which combined with Reanimated using strict mode since 3.6.0 was resulting in errors.
    // Without strict mode, it would just silently fail.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#description
    const shouldPagerScroll = attachmentCarouselPagerContext !== null ? attachmentCarouselPagerContext.shouldPagerScroll : undefined;

    const Pan = Gesture.Pan()
        .manualActivation(true)
        .onTouchesMove((evt) => {
            if (offsetX.value !== 0 && offsetY.value !== 0 && shouldPagerScroll) {
                // if the value of X is greater than Y and the pdf is not zoomed in,
                // enable  the pager scroll so that the user
                // can swipe to the next attachment otherwise disable it.
                if (Math.abs(evt.allTouches[0].absoluteX - offsetX.value) > Math.abs(evt.allTouches[0].absoluteY - offsetY.value) && scaleRef.value === 1) {
                    shouldPagerScroll.value = true;
                } else {
                    shouldPagerScroll.value = false;
                }
            }
            offsetX.value = evt.allTouches[0].absoluteX;
            offsetY.value = evt.allTouches[0].absoluteY;
        });

    const updateScale = useCallback(
        (scale) => {
            scaleRef.value = scale;
        },
        [scaleRef],
    );

    return (
        <View
            collapsable={false}
            style={styles.flex1}
        >
            <GestureDetector gesture={Pan}>
                <Animated.View
                    collapsable={false}
                    style={[StyleSheet.absoluteFill, styles.justifyContentCenter, styles.alignItemsCenter]}
                >
                    <BaseAttachmentViewPdf
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...restProps}
                        onScaleChanged={(scale) => {
                            updateScale(scale);
                            onScaleChanged();
                        }}
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

AttachmentViewPdf.propTypes = attachmentViewPdfPropTypes;
AttachmentViewPdf.defaultProps = attachmentViewPdfDefaultProps;

export default memo(AttachmentViewPdf);
