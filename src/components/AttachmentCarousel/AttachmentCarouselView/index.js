import React, {useRef, useCallback} from 'react';
import {View, FlatList, PixelRatio} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import CarouselActions from '../CarouselActions';
import AttachmentView from '../../AttachmentView';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';
import CarouselButtons from '../CarouselButtons';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    carouselState: PropTypes.object.isRequired,

    updatePage: PropTypes.func.isRequired,
    toggleArrowsVisibility: PropTypes.func.isRequired,
    autoHideArrow: PropTypes.func.isRequired,
    cancelAutoHideArrow: PropTypes.func.isRequired,

    ...windowDimensionsPropTypes,
};

function AttachmentCarouselView(props) {
    const scrollRef = useRef(null);
    const viewabilityConfig = {
        // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
        // more than 90% visible. When that happens we update the page index in the state.
        itemVisiblePercentThreshold: 95,
    };

    /**
     * Calculate items layout information to optimize scrolling performance
     * @param {*} data
     * @param {Number} index
     * @returns {{offset: Number, length: Number, index: Number}}
     */
    const getItemLayout = useCallback(
        (data, index) => ({
            length: props.carouselState.containerWidth,
            offset: props.carouselState.containerWidth * index,
            index,
        }),
        [props.carouselState.containerWidth],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextIndex = props.carouselState.page - deltaSlide;
            const nextItem = props.carouselState.attachments[nextIndex];

            if (!nextItem || !scrollRef.current) {
                return;
            }

            // The sliding transition is a bit too much on web, because of the wider and bigger images,
            // so we only enable it for mobile
            scrollRef.current.scrollToIndex({index: nextIndex, animated: false});
        },
        [props.carouselState.attachments, props.carouselState.page],
    );

    /**
     * Defines how a container for a single attachment should be rendered
     * @param {Object} props
     * @returns {JSX.Element}
     */
    const renderCell = useCallback((cellProps) => {
        // Use window width instead of layout width to address the issue in https://github.com/Expensify/App/issues/17760
        // considering horizontal margin and border width in centered modal
        const modalStyles = styles.centeredModalStyles(cellProps.isSmallScreenWidth, true);
        const style = [cellProps.style, styles.h100, {width: PixelRatio.roundToNearestPixel(cellProps.windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2)}];

        return (
            <View
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...cellProps}
                style={style}
            />
        );
    }, []);

    /**
     * Defines how a single attachment should be rendered
     * @param {{ isAuthTokenRequired: Boolean, source: String, file: { name: String } }} item
     * @returns {JSX.Element}
     */
    const renderItem = useCallback(
        ({item}) => (
            <AttachmentView
                source={item.source}
                file={item.file}
                isAuthTokenRequired={item.isAuthTokenRequired}
            />
        ),
        [],
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

            {props.carouselState.containerWidth > 0 && (
                <FlatList
                    listKey="AttachmentCarousel"
                    horizontal
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    disableIntervalMomentum // Scroll only one image at a time no matter how fast the user swipes
                    pagingEnabled
                    snapToAlignment="start"
                    snapToInterval={props.carouselState.containerWidth}
                    scrollEnabled={false}
                    ref={scrollRef}
                    initialScrollIndex={props.carouselState.page}
                    initialNumToRender={3}
                    windowSize={5}
                    maxToRenderPerBatch={3}
                    data={props.carouselState.attachments}
                    CellRendererComponent={renderCell}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    keyExtractor={(item) => item.source}
                    viewabilityConfig={viewabilityConfig}
                    onViewableItemsChanged={props.updatePage}
                />
            )}

            <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
        </>
    );
}

AttachmentCarouselView.propTypes = propTypes;

export default withWindowDimensions(AttachmentCarouselView);
