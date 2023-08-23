import React, {useRef, useCallback, useState, useEffect} from 'react';
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
import {propTypes, defaultProps} from './attachmentCarouselPropTypes';
import ONYXKEYS from '../../../ONYXKEYS';
import withLocalize from '../../withLocalize';
import compose from '../../../libs/compose';
import useCarouselArrows from './useCarouselArrows';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import Navigation from '../../../libs/Navigation/Navigation';
import BlockingView from '../../BlockingViews/BlockingView';
import * as Illustrations from '../../Icon/Illustrations';
import variables from '../../../styles/variables';

const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

function AttachmentCarousel({report, reportActions, source, onNavigate, setDownloadButtonVisibility, translate}) {
    const scrollRef = useRef(null);

    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();

    const [containerWidth, setContainerWidth] = useState(0);
    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState([]);
    const [activeSource, setActiveSource] = useState(source);
    const [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows] = useCarouselArrows();

    useEffect(() => {
        const attachmentsFromReport = extractAttachmentsFromReport(report, reportActions);

        const initialPage = _.findIndex(attachmentsFromReport, (a) => a.source === source);

        // Dismiss the modal when deleting an attachment during its display in preview.
        if (initialPage === -1 && _.find(attachments, (a) => a.source === source)) {
            Navigation.dismissModal();
        } else {
            setPage(initialPage);
            setAttachments(attachmentsFromReport);

            // Update the download button visibility in the parent modal
            setDownloadButtonVisibility(initialPage !== -1);

            // Update the parent modal's state with the source and name from the mapped attachments
            if (!_.isUndefined(attachmentsFromReport[initialPage])) onNavigate(attachmentsFromReport[initialPage]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report, reportActions, source]);

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
            const nextIndex = page + deltaSlide;
            const nextItem = attachments[nextIndex];

            if (!nextItem || !scrollRef.current) {
                return;
            }

            scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        },
        [attachments, page],
    );

    /**
     * Calculate items layout information to optimize scrolling performance
     * @param {*} data
     * @param {Number} index
     * @returns {{offset: Number, length: Number, index: Number}}
     */
    const getItemLayout = useCallback(
        (_data, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
        }),
        [containerWidth],
    );

    /**
     * Defines how a container for a single attachment should be rendered
     * @param {Object} cellRendererProps
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
     * @param {Object} item
     * @param {Boolean} item.isAuthTokenRequired
     * @param {String} item.source
     * @param {Object} item.file
     * @param {String} item.file.name
     * @returns {JSX.Element}
     */
    const renderItem = useCallback(
        ({item}) => (
            <AttachmentView
                source={item.source}
                file={item.file}
                isAuthTokenRequired={item.isAuthTokenRequired}
                isFocused={activeSource === item.source}
                onPress={() => canUseTouchScreen && setShouldShowArrows(!shouldShowArrows)}
                isUsedInCarousel
            />
        ),
        [activeSource, setShouldShowArrows, shouldShowArrows],
    );

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onLayout={({nativeEvent}) => setContainerWidth(PixelRatio.roundToNearestPixel(nativeEvent.layout.width))}
            onMouseEnter={() => !canUseTouchScreen && setShouldShowArrows(true)}
            onMouseLeave={() => !canUseTouchScreen && setShouldShowArrows(false)}
        >
            {page === -1 ? (
                <BlockingView
                    icon={Illustrations.ToddBehindCloud}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate('notFound.notHere')}
                />
            ) : (
                <>
                    <CarouselButtons
                        shouldShowArrows={shouldShowArrows}
                        page={page}
                        attachments={attachments}
                        onBack={() => cycleThroughAttachments(-1)}
                        onForward={() => cycleThroughAttachments(1)}
                        autoHideArrow={autoHideArrows}
                        cancelAutoHideArrow={cancelAutoHideArrows}
                    />

                    {containerWidth > 0 && (
                        <FlatList
                            keyboardShouldPersistTaps="handled"
                            listKey="AttachmentCarousel"
                            horizontal
                            decelerationRate="fast"
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            // Scroll only one image at a time no matter how fast the user swipes
                            disableIntervalMomentum
                            pagingEnabled
                            snapToAlignment="start"
                            snapToInterval={containerWidth}
                            // Enable scrolling by swiping on mobile (touch) devices only
                            // disable scroll for desktop/browsers because they add their scrollbars
                            // Enable scrolling FlatList only when PDF is not in a zoomed state
                            scrollEnabled={canUseTouchScreen}
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
                            viewabilityConfig={viewabilityConfig}
                            onViewableItemsChanged={updatePage.current}
                        />
                    )}

                    <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
                </>
            )}
        </View>
    );
}
AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;

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
