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
};

function AttachmentCarouselView(props) {
    const pagerRef = useRef(null);

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

            <Pager
                items={reversedAttachments}
                initialIndex={reversedPage}
                onTap={props.toggleArrowsVisibility}
                itemExtractor={({item}) => ({key: item.source, url: addEncryptedAuthTokenToURL(item.source)})}
                ref={pagerRef}
            />
        </>
    );
}

AttachmentCarouselView.propTypes = propTypes;

export default AttachmentCarouselView;
