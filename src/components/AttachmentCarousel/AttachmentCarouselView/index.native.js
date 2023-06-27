import React, {useCallback, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import addEncryptedAuthTokenToURL from '../../../libs/addEncryptedAuthTokenToURL';
import Pager from '../Lightbox';
import CarouselButtons from '../CarouselButtons';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    carouselState: PropTypes.object.isRequired,
    updatePageByIndex: PropTypes.func.isRequired,
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
    const reversedPage = useMemo(() => props.carouselState.attachments.length - props.carouselState.page - 1, [props.carouselState.attachments, props.carouselState.page]);

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextCarouselPage = props.carouselState.page - deltaSlide;
            const nextItem = reversedAttachments[nextCarouselPage];

            const nextPagerIndex = reversedPage + deltaSlide;

            if (!nextItem) {
                return;
            }

            pagerRef.current.setPage(nextPagerIndex);
            props.updatePageByIndex(nextCarouselPage);
        },
        [props, reversedAttachments, reversedPage],
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
