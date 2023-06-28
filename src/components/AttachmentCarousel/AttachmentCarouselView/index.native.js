import React, {useCallback, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import addEncryptedAuthTokenToURL from '../../../libs/addEncryptedAuthTokenToURL';
import Pager from '../Lightbox';
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
        () => Math.max(0, Math.min(props.carouselState.attachments.length - props.carouselState.page - 1, props.carouselState.attachments.length)),
        [props.carouselState.attachments.length, props.carouselState.page],
    );

    const reversedPage = useMemo(() => reversePage(), [reversePage]);

    /**
     * Update carousel page based on next page index
     * @param {Number} newPageIndex
     */
    const updatePage = useCallback(
        (newPageIndex) => {
            const nextItem = reversedAttachments[newPageIndex];

            console.log('updatePage', newPageIndex);

            if (!nextItem) {
                return;
            }

            // pagerRef.current.setPage(nextPagerIndex);
            props.updatePage([nextItem]);
        },
        [props, reversedAttachments],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextPageIndex = props.carouselState.page - deltaSlide;
            updatePage(nextPageIndex);
        },
        [props.carouselState.page, updatePage],
    );

    return (
        <>
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
                    onPageScroll={({position: newPage}) => {
                        console.log(newPage);
                        updatePage(reversePage(newPage));
                    }}
                    onTap={() => props.toggleArrowsVisibility(!props.carouselState.shouldShowArrow)}
                    onPinchGestureChange={(isPinchGestureRunning) => props.toggleArrowsVisibility(!isPinchGestureRunning)}
                    onSwipeDown={props.onClose}
                    itemExtractor={({item}) => ({key: item.source, url: addEncryptedAuthTokenToURL(item.source)})}
                    containerWidth={props.carouselState.containerWidth}
                    containerHeight={props.carouselState.containerHeight}
                    ref={pagerRef}
                />
            )}
        </>
    );
}

AttachmentCarouselView.propTypes = propTypes;
AttachmentCarouselView.defaultProps = defaultProps;

export default AttachmentCarouselView;
