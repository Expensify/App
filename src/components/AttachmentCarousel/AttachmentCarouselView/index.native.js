import React, {useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import addEncryptedAuthTokenToURL from '../../../libs/addEncryptedAuthTokenToURL';
import Pager from '../Lightbox';
import CarouselButtons from '../CarouselButtons';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    carouselState: PropTypes.object.isRequired,

    toggleArrowsVisibility: PropTypes.func.isRequired,
    autoHideArrow: PropTypes.func.isRequired,
    cancelAutoHideArrow: PropTypes.func.isRequired,
};

function AttachmentCarouselView(props) {
    const pagerRef = useRef(null);

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextIndex = props.carouselState.page - deltaSlide;
            const nextItem = props.carouselState.attachments[nextIndex];

            if (!nextItem) {
                return;
            }

            pagerRef.current.setPage(nextIndex);
        },
        [props.carouselState.attachments, props.carouselState.page],
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

            <Pager
                items={props.carouselState.attachments}
                initialIndex={props.carouselState.page}
                onTap={props.toggleArrowsVisibility}
                itemExtractor={({item}) => ({key: item.source, url: addEncryptedAuthTokenToURL(item.source)})}
                ref={pagerRef}
            />
        </>
    );
}

AttachmentCarouselView.propTypes = propTypes;

export default AttachmentCarouselView;
