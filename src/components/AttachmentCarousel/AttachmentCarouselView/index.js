import React, {useRef, useCallback} from 'react';
import {View, FlatList, PixelRatio} from 'react-native';
import _ from 'underscore';
import styles from '../../../styles/styles';
import CarouselActions from '../CarouselActions';
import AttachmentView from '../../AttachmentView';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';
import CarouselButtons from '../CarouselButtons';
import attachmentCarouselViewPropTypes from './propTypes';

const VIEWABILITY_CONFIG = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

const propTypes = {
    ...attachmentCarouselViewPropTypes,
    ...windowDimensionsPropTypes,
};

function AttachmentCarouselView(props) {
    const scrollRef = useRef(null);

    /**
     * Calculate items layout information to optimize scrolling performance
     * @param {*} data
     * @param {Number} index
     * @returns {{offset: Number, length: Number, index: Number}}
     */
    const getItemLayout = useCallback(
        (_data, index) => ({
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
    const renderCell = useCallback(
        (cellProps) => {
            // Use window width instead of layout width to address the issue in https://github.com/Expensify/App/issues/17760
            // considering horizontal margin and border width in centered modal
            const modalStyles = styles.centeredModalStyles(props.isSmallScreenWidth, true);
            const style = [cellProps.style, styles.h100, {width: PixelRatio.roundToNearestPixel(props.windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2)}];

            return (
                <View
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...cellProps}
                    style={style}
                />
            );
        },
        [props.isSmallScreenWidth, props.windowWidth],
    );

    /**
     * Defines how a single attachment should be rendered
     * @param {{ isAuthTokenRequired: Boolean, source: String, file: { name: String } }} item
     * @returns {JSX.Element}
     */
    const renderItem = useCallback(
        ({item}) => (
            <AttachmentView
                isFocused={props.carouselState.activeSource === item.source}
                source={item.source}
                file={item.file}
                isAuthTokenRequired={item.isAuthTokenRequired}
            />
        ),
        [props.carouselState.activeSource],
    );

    const handleViewableItemsChange = useCallback(
        ({viewableItems}) => {
            // Since we can have only one item in view at a time, we can use the first item in the array
            // to get the index of the current page
            const entry = _.first([...viewableItems]);
            props.updatePage({item: entry.item, index: entry.index});
        },
        [props],
    );

    const viewabilityConfigCallbackPairs = useRef([{viewabilityConfig: VIEWABILITY_CONFIG, onViewableItemsChanged: handleViewableItemsChange}]);

    return (
        <View
            onMouseEnter={() => props.toggleArrowsVisibility(true)}
            onMouseLeave={() => props.toggleArrowsVisibility(false)}
            style={[styles.flex1, styles.attachmentCarouselButtonsContainer]}
        >
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
                    viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                />
            )}

            <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
        </View>
    );
}

AttachmentCarouselView.propTypes = propTypes;

export default withWindowDimensions(AttachmentCarouselView);
