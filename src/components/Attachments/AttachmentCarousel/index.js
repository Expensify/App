import React, {useRef, useCallback, useState, useEffect, useMemo} from 'react';
import {View, FlatList, PixelRatio, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import styles from '../../../styles/styles';
import CarouselActions from './CarouselActions';
import AttachmentView from '../AttachmentView';
import withWindowDimensions from '../../withWindowDimensions';
import CarouselButtons from './CarouselButtons';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import {attachmentCarouselPropTypes, attachmentCarouselDefaultProps} from './propTypes';
import ONYXKEYS from '../../../ONYXKEYS';
import withLocalize from '../../withLocalize';
import compose from '../../../libs/compose';
import useCarouselArrows from './useCarouselArrows';

const VIEWABILITY_CONFIG = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

function AttachmentCarousel({report, reportActions, source, onNavigate, isSmallScreenWidth, windowWidth}) {
    const scrollRef = useRef(null);

    const canUseTouchScreen = useMemo(() => DeviceCapabilities.canUseTouchScreen(), []);

    const {attachments, initialPage, initialActiveSource, initialItem} = useMemo(() => extractAttachmentsFromReport(report, reportActions, source), [report, reportActions, source]);

    useEffect(() => {
        // Update the parent modal's state with the source and name from the mapped attachments
        onNavigate(initialItem);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialItem]);

    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
    const [isZoomed, setIsZoomed] = useState(false);
    const [page, setPage] = useState(initialPage);
    const [activeSource, setActiveSource] = useState(initialActiveSource);
    const [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows] = useCarouselArrows();

    /**
     * Updates the page state when the user navigates between attachments
     * @param {Object} item
     * @param {number} index
     */
    const updatePage = useRef(
        ({viewableItems}) => {
            Keyboard.dismiss();
            // Since we can have only one item in view at a time, we can use the first item in the array
            // to get the index of the current page
            const entry = _.first(viewableItems);
            if (!entry) {
                setActiveSource(null);
                return;
            }

            setPage(entry.index);
            setActiveSource(entry.item.source);
            setIsZoomed(false);

            onNavigate(entry.item);
        },
        [onNavigate],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            let delta = deltaSlide;
            if (canUseTouchScreen) {
                delta = deltaSlide * -1;
            }

            const nextIndex = page - delta;
            const nextItem = attachments[nextIndex];

            if (!nextItem || !scrollRef.current) {
                return;
            }

            scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        },
        [attachments, canUseTouchScreen, page],
    );

    /**
     * Updates zoomed state to enable/disable panning the PDF
     * @param {Number} scale current PDF scale
     */
    const updateZoomState = useCallback(
        (scale) => {
            const newIsZoomed = scale > 1;
            if (newIsZoomed === isZoomed) {
                return;
            }

            setShouldShowArrows(!newIsZoomed);
            setIsZoomed(newIsZoomed);
        },
        [isZoomed, setShouldShowArrows],
    );

    /**
     * Calculate items layout information to optimize scrolling performance
     * @param {*} data
     * @param {Number} index
     * @returns {{offset: Number, length: Number, index: Number}}
     */
    const getItemLayout = useCallback(
        (_data, index) => ({
            length: containerDimensions.width,
            offset: containerDimensions.height * index,
            index,
        }),
        [containerDimensions.height, containerDimensions.width],
    );

    /**
     * Defines how a container for a single attachment should be rendered
     * @param {Object} props
     * @returns {JSX.Element}
     */
    const renderCell = useCallback(
        (cellProps) => {
            // Use window width instead of layout width to address the issue in https://github.com/Expensify/App/issues/17760
            // considering horizontal margin and border width in centered modal
            const modalStyles = styles.centeredModalStyles(isSmallScreenWidth, true);
            const style = [cellProps.style, styles.h100, {width: PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2)}];

            return (
                <View
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...cellProps}
                    style={style}
                />
            );
        },
        [isSmallScreenWidth, windowWidth],
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
                onScaleChanged={canUseTouchScreen ? updateZoomState : undefined}
                isUsedInCarousel
            />
        ),
        [activeSource, canUseTouchScreen, updateZoomState],
    );

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onLayout={({nativeEvent}) =>
                setContainerDimensions({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)})
            }
            onMouseEnter={() => !isZoomed && !canUseTouchScreen && setShouldShowArrows(true)}
            onMouseLeave={() => !isZoomed && !canUseTouchScreen && setShouldShowArrows(false)}
        >
            <CarouselButtons
                shouldShowArrows={shouldShowArrows}
                page={page}
                attachments={attachments}
                onBack={() => cycleThroughAttachments(-1)}
                onForward={() => cycleThroughAttachments(1)}
                autoHideArrow={autoHideArrows}
                cancelAutoHideArrow={cancelAutoHideArrows}
            />

            {containerDimensions.width > 0 && (
                <FlatList
                    contentContainerStyle={{flex: 1}}
                    listKey="AttachmentCarousel"
                    horizontal
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    pagingEnabled
                    snapToAlignment="start"
                    snapToInterval={containerDimensions.width}
                    // scrollEnabled={canUseTouchScreen && !isZoomed}
                    ref={scrollRef}
                    initialScrollIndex={page}
                    initialNumToRender={3}
                    windowSize={5}
                    maxToRenderPerBatch={3}
                    data={attachments}
                    CellRendererComponent={renderCell}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    keyExtractor={(item) => item.source}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                    onViewableItemsChanged={updatePage.current}
                />
            )}

            <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
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
