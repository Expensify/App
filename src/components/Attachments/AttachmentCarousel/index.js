import React, {useRef, useCallback, useState, useEffect, useMemo} from 'react';
import {View, FlatList, PixelRatio, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import CarouselActions from './CarouselActions';
import AttachmentView from '../AttachmentView';
import withWindowDimensions from '../../withWindowDimensions';
import CarouselButtons from './CarouselButtons';
import extractAttachments from './extractAttachments';
import {attachmentCarouselPropTypes, attachmentCarouselDefaultProps} from './propTypes';
import ONYXKEYS from '../../../ONYXKEYS';
import withLocalize from '../../withLocalize';
import compose from '../../../libs/compose';

function AttachmentCarousel({report, reportActions, source, onNavigate, isSmallScreenWidth, windowWidth}) {
    const scrollRef = useRef(null);

    const {attachments, initialPage, initialActiveSource, initialItem} = useMemo(() => extractAttachments(report, reportActions, source), [report, reportActions, source]);

    useEffect(() => {
        // Update the parent modal's state with the source and name from the mapped attachments
        onNavigate(initialItem);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialItem]);

    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
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
                setActiveSource(null);
                return;
            }

            setPage(index);
            setActiveSource(item.source);

            onNavigate(item);
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

            updatePage({item: nextItem, index: nextIndex});

            scrollRef.current.scrollToIndex({index: nextIndex, animated: false});
        },
        [attachments, page, updatePage],
    );

    console.log({page});

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
                isUsedInCarousel
            />
        ),
        [activeSource],
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
                shouldShowArrows={shouldShowArrows}
                page={page}
                attachments={attachments}
                onBack={() => cycleThroughAttachments(-1)}
                onForward={() => cycleThroughAttachments(1)}
            />

            {containerDimensions.width > 0 && containerDimensions.height > 0 && (
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
                    // scrollEnabled={false}
                    // ref={scrollRef}
                    ref={(ref) => {
                        scrollRef.current = ref;
                    }}
                    initialScrollIndex={initialPage}
                    initialNumToRender={3}
                    windowSize={5}
                    maxToRenderPerBatch={3}
                    data={attachments}
                    CellRendererComponent={renderCell}
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    keyExtractor={(item) => item.source}
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
