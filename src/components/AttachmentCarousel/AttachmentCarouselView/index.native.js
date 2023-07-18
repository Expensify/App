import React, {useCallback, useMemo, useRef, useEffect} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import addEncryptedAuthTokenToURL from '../../../libs/addEncryptedAuthTokenToURL';
import Pager from '../Lightbox';
import styles from '../../../styles/styles';
import CarouselButtons from '../CarouselButtons';
import attachmentCarouselViewPropTypes from './propTypes';
import CONST from '../../../CONST';

function AttachmentCarouselView(props) {
    const pagerRef = useRef(null);

    // Inverting the list for touchscreen devices that can swipe or have an animation when scrolling
    // promotes the natural feeling of swiping left/right to go to the next/previous image
    const reversedAttachments = useMemo(() => props.carouselState.attachments.reverse(), [props.carouselState.attachments]);

    const processedItems = useMemo(() => _.map(reversedAttachments, (item) => ({key: item.source, url: addEncryptedAuthTokenToURL(item.source)})), [reversedAttachments]);

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
        },
        [reversedPage, updatePage],
    );

    const autoHideArrowTimeout = useRef(null);

    /**
     * Cancels the automatic hiding of the arrows.
     */
    const cancelAutoHideArrow = useCallback(() => clearTimeout(autoHideArrowTimeout.current), []);

    /**
     * On a touch screen device, automatically hide the arrows
     * if there is no interaction for 3 seconds.
     */
    const autoHideArrow = useCallback(() => {
        cancelAutoHideArrow();
        autoHideArrowTimeout.current = setTimeout(() => {
            props.setArrowsVisibility(false);
        }, CONST.ARROW_HIDE_DELAY);
    }, [cancelAutoHideArrow, props]);

    useEffect(() => props.setArrowsVisibility(true), [props]);

    return (
        <View style={[styles.flex1, styles.attachmentCarouselButtonsContainer]}>
            <CarouselButtons
                carouselState={props.carouselState}
                onBack={() => {
                    cycleThroughAttachments(-1);
                    autoHideArrow();
                }}
                onForward={() => {
                    cycleThroughAttachments(1);
                    autoHideArrow();
                }}
                autoHideArrow={props.autoHideArrow}
                cancelAutoHideArrow={props.cancelAutoHideArrow}
            />

            {props.carouselState.containerWidth > 0 && props.carouselState.containerHeight > 0 && (
                <Pager
                    items={processedItems}
                    initialIndex={reversedPage}
                    onPageSelected={({nativeEvent: {position: newPage}}) => {
                        console.log('page updated');
                        updatePage(newPage);
                    }}
                    onTap={() => props.setArrowsVisibility(!props.carouselState.shouldShowArrow)}
                    onPinchGestureChange={(isPinchGestureRunning) => props.setArrowsVisibility(!isPinchGestureRunning)}
                    onSwipeDown={props.onClose}
                    containerWidth={props.carouselState.containerWidth}
                    containerHeight={props.carouselState.containerHeight}
                    ref={pagerRef}
                />
            )}
        </View>
    );
}

AttachmentCarouselView.propTypes = attachmentCarouselViewPropTypes;

export default AttachmentCarouselView;
