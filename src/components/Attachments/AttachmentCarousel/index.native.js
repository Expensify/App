import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {View, Keyboard, PixelRatio} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import AttachmentCarouselPager from '../AttachmentCarouselPager';
import styles from '../../../styles/styles';
import CarouselButtons from './CarouselButtons';
import AttachmentView from '../AttachmentView';
import ONYXKEYS from '../../../ONYXKEYS';
import withLocalize from '../../withLocalize';
import compose from '../../../libs/compose';
import withWindowDimensions from '../../withWindowDimensions';
import {attachmentCarouselPropTypes, attachmentCarouselDefaultProps} from './propTypes';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import useCarouselArrows from './useCarouselArrows';

function AttachmentCarousel({report, reportActions, source, onNavigate, onClose}) {
    const {attachments, initialPage, initialActiveSource, initialItem} = useMemo(() => extractAttachmentsFromReport(report, reportActions, source), [report, reportActions, source]);

    useEffect(() => {
        // Update the parent modal's state with the source and name from the mapped attachments
        onNavigate(initialItem);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialItem]);

    const pagerRef = useRef(null);

    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
    const [page, setPage] = useState(initialPage);
    const [activeSource, setActiveSource] = useState(initialActiveSource);
    const [isPinchGestureRunning, setIsPinchGestureRunning] = useState(true);
    const [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows] = useCarouselArrows();

    /**
     * Updates the page state when the user navigates between attachments
     * @param {Object} item
     * @param {number} index
     */
    const updatePage = useCallback(
        (newPageIndex) => {
            Keyboard.dismiss();
            setShouldShowArrows(true);

            const item = attachments[newPageIndex];

            setPage(newPageIndex);
            setActiveSource(item.source);

            onNavigate(item);
        },
        [setShouldShowArrows, attachments, onNavigate],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextPageIndex = page + deltaSlide;
            updatePage(nextPageIndex);
            pagerRef.current.setPage(nextPageIndex);

            autoHideArrows();
        },
        [autoHideArrows, page, updatePage],
    );

    /**
     * Defines how a single attachment should be rendered
     * @param {{ isAuthTokenRequired: Boolean, source: String, file: { name: String } }} item
     * @returns {JSX.Element}
     */
    const renderItem = useCallback(
        ({item}) => (
            <AttachmentView
                item={item}
                isFocused={activeSource === item.source}
                isUsedInCarousel
                onPress={() => setShouldShowArrows(!shouldShowArrows)}
            />
        ),
        [activeSource, setShouldShowArrows, shouldShowArrows],
    );

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onLayout={({nativeEvent}) =>
                setContainerDimensions({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)})
            }
            onMouseEnter={() => setShouldShowArrows(true)}
            onMouseLeave={() => setShouldShowArrows(false)}
        >
            <CarouselButtons
                shouldShowArrows={shouldShowArrows && !isPinchGestureRunning}
                page={page}
                attachments={attachments}
                onBack={() => cycleThroughAttachments(-1)}
                onForward={() => cycleThroughAttachments(1)}
                autoHideArrow={autoHideArrows}
                cancelAutoHideArrow={cancelAutoHideArrows}
            />

            {containerDimensions.width > 0 && containerDimensions.height > 0 && (
                <AttachmentCarouselPager
                    items={attachments}
                    renderItem={renderItem}
                    initialIndex={page}
                    onPageSelected={({nativeEvent: {position: newPage}}) => updatePage(newPage)}
                    onPinchGestureChange={(newIsPinchGestureRunning) => {
                        setIsPinchGestureRunning(newIsPinchGestureRunning);
                        if (!newIsPinchGestureRunning && !shouldShowArrows) setShouldShowArrows(true);
                    }}
                    onSwipeDown={onClose}
                    containerWidth={containerDimensions.width}
                    containerHeight={containerDimensions.height}
                    ref={pagerRef}
                />
            )}
        </View>
    );
}
AttachmentCarousel.propTypes = attachmentCarouselPropTypes;
AttachmentCarousel.defaultProps = attachmentCarouselDefaultProps;

export default compose(
    withOnyx({
        reportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            canEvict: false,
        },
    }),
    withLocalize,
    withWindowDimensions,
)(AttachmentCarousel);
