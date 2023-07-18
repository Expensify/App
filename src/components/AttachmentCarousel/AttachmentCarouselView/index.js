import React, {useRef, useCallback, useState} from 'react';
import {View, FlatList, PixelRatio, Keyboard} from 'react-native';
import _ from 'underscore';
import styles from '../../../styles/styles';
import CarouselActions from '../CarouselActions';
import AttachmentView from '../../AttachmentView';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';
import CarouselButtons from '../CarouselButtons';
import {propTypes as attachmentCarouselViewPropTypes} from './propTypes';

const VIEWABILITY_CONFIG = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

const propTypes = {
    ...attachmentCarouselViewPropTypes,
    ...windowDimensionsPropTypes,
};

function AttachmentCarouselView({containerDimensions, attachments, initialPage, initialActiveSource, onNavigate, ...props}) {
    const scrollRef = useRef(null);

    const [shouldShowArrows, setShouldShowArrows] = useState(false);
    const [page, setPage] = useState(initialPage);
    const [activeSource, setActiveSource] = useState(initialActiveSource);

    /**
     * Updates the page state when the user navigates between attachments
     * @param {Object} item
     * @param {number} index
     */
    const updatePage = useCallback(
        ({item, index}) => {
            Keyboard.dismiss();

            if (!item) {
                // eslint-disable-next-line react/no-unused-state
                setActiveSource(null);
                return;
            }

            const pageIndex = index;

            setPage(pageIndex);
            setActiveSource(item.source);

            onNavigate(item);
        },
        [onNavigate],
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
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextIndex = page - deltaSlide;
            const nextItem = attachments[nextIndex];

            if (!nextItem || !scrollRef.current) {
                return;
            }

            // The sliding transition is a bit too much on web, because of the wider and bigger images,
            // so we only enable it for mobile
            scrollRef.current.scrollToIndex({index: nextIndex, animated: false});
        },
        [attachments, page],
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
                isFocused={activeSource === item.source}
                source={item.source}
                file={item.file}
                isAuthTokenRequired={item.isAuthTokenRequired}
            />
        ),
        [activeSource],
    );

    const handleViewableItemsChange = useCallback(
        ({viewableItems}) => {
            // Since we can have only one item in view at a time, we can use the first item in the array
            // to get the index of the current page
            const entry = _.first([...viewableItems]);
            updatePage({item: entry.item, index: entry.index});
        },
        [updatePage],
    );

    const viewabilityConfigCallbackPairs = useRef([{viewabilityConfig: VIEWABILITY_CONFIG, onViewableItemsChanged: handleViewableItemsChange}]);

    return (
        <View
            onMouseEnter={() => setShouldShowArrows(true)}
            onMouseLeave={() => setShouldShowArrows(false)}
            style={[styles.flex1, styles.attachmentCarouselButtonsContainer]}
        >
            <CarouselButtons
                shouldShowArrows={shouldShowArrows}
                page={page}
                attachments={attachments}
                onBack={() => cycleThroughAttachments(-1)}
                onForward={() => cycleThroughAttachments(1)}
            />

            {containerDimensions.width > 0 && containerDimensions.height > 0 && (
                <FlatList
                    listKey="AttachmentCarousel"
                    horizontal
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    disableIntervalMomentum // Scroll only one image at a time no matter how fast the user swipes
                    pagingEnabled
                    snapToAlignment="start"
                    snapToInterval={containerDimensions.width}
                    scrollEnabled={false}
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
                    viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                />
            )}

            <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
        </View>
    );
}

AttachmentCarouselView.propTypes = propTypes;

export default withWindowDimensions(AttachmentCarouselView);
