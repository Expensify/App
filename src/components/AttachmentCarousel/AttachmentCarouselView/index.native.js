import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import addEncryptedAuthTokenToURL from '../../../libs/addEncryptedAuthTokenToURL';
import Pager from '../Lightbox';
import styles from '../../../styles/styles';
import CarouselButtons from '../CarouselButtons';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    carouselState: PropTypes.object.isRequired,
    updatePage: PropTypes.func.isRequired,
    toggleArrowsVisibility: PropTypes.func.isRequired,
    autoHideArrow: PropTypes.func.isRequired,
    cancelAutoHideArrow: PropTypes.func.isRequired,
    onClose: PropTypes.func,
};

const defaultProps = {
    onClose: () => {},
};

function AttachmentCarouselView(props) {
    const pagerRef = useRef(null);

    // Inverting the list for touchscreen devices that can swipe or have an animation when scrolling
    // promotes the natural feeling of swiping left/right to go to the next/previous image
    const reversedAttachments = useMemo(() => props.carouselState.attachments.reverse(), [props.carouselState.attachments]);

    const reversePage = useCallback(
        (page) => Math.max(0, Math.min(props.carouselState.attachments.length - page - 1, props.carouselState.attachments.length)),
        [props.carouselState.attachments.length],
    );

    const reversedPage = useMemo(() => reversePage(props.carouselState.page), [props.carouselState.page, reversePage]);

    /**
     * Update carousel page based on next page index
     * @param {Number} newPageIndex
     */
    const updatePage = useCallback(
        (newPageIndex) => {
            const nextItem = reversedAttachments[newPageIndex];
            if (!nextItem) {
                return;
            }

            props.updatePage({item: nextItem, index: reversePage(newPageIndex)});
        },
        [props, reversePage, reversedAttachments],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextPageIndex = reversedPage + deltaSlide;
            updatePage(nextPageIndex);
            pagerRef.current.setPage(nextPageIndex);

            props.autoHideArrow();
        },
        [props, reversedPage, updatePage],
    );

    return (
        <View style={[styles.flex1, styles.attachmentCarouselButtonsContainer]}>
            <CarouselButtons
                carouselState={props.carouselState}
                onBack={() => {
                    cycleThroughAttachments(-1);
                    props.autoHideArrow();
                }}
                onForward={() => {
                    cycleThroughAttachments(1);
                    props.autoHideArrow();
                }}
                autoHideArrow={props.autoHideArrow}
                cancelAutoHideArrow={props.cancelAutoHideArrow}
            />

            {props.carouselState.containerWidth > 0 && props.carouselState.containerHeight > 0 && (
                <Pager
                    items={reversedAttachments}
                    initialIndex={reversedPage}
                    onPageSelected={({nativeEvent: {position: newPage}}) => updatePage(newPage)}
                    onTap={() => props.toggleArrowsVisibility(!props.carouselState.shouldShowArrow)}
                    onPinchGestureChange={(isPinchGestureRunning) => props.toggleArrowsVisibility(!isPinchGestureRunning)}
                    onSwipeDown={props.onClose}
                    itemExtractor={({item}) => ({key: item.source, url: addEncryptedAuthTokenToURL(item.source)})}
                    containerWidth={props.carouselState.containerWidth}
                    containerHeight={props.carouselState.containerHeight}
                    ref={pagerRef}
                />
            )}
        </View>
    );
}

AttachmentCarouselView.propTypes = propTypes;
AttachmentCarouselView.defaultProps = defaultProps;

export default AttachmentCarouselView;
