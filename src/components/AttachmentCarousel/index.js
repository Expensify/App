import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, FlatList, PixelRatio, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import CarouselActions from './CarouselActions';
import Button from '../Button';
import AttachmentView from '../AttachmentView';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import Tooltip from '../Tooltip';
import useLocalize from '../../hooks/useLocalize';
import createInitialState from './createInitialState';
import {propTypes, defaultProps} from './attachmentCarouselPropTypes';

const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 90% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

function AttachmentCarousel(props) {
    const {onNavigate} = props;

    const {translate} = useLocalize();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();

    const scrollRef = useRef(null);
    const autoHideArrowTimeout = useRef(null);

    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState([]);
    const [shouldShowArrow, setShouldShowArrow] = useState(canUseTouchScreen);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [activeSource, setActiveSource] = useState(null);

    let isForwardDisabled = page === 0;
    let isBackDisabled = page === _.size(attachments) - 1;

    if (canUseTouchScreen) {
        isForwardDisabled = isBackDisabled;
        isBackDisabled = page === 0;
    }

    useEffect(() => {
        const initialState = createInitialState(props);
        setPage(initialState.page);
        setAttachments(initialState.attachments);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.reportActions]);

    useEffect(() => {
        if (!scrollRef || !scrollRef.current) {
            return;
        }
        scrollRef.current.scrollToIndex({index: page, animated: false});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attachments]);

    /**
     * Calculate items layout information to optimize scrolling performance
     * @param {*} data
     * @param {Number} index
     * @returns {{offset: Number, length: Number, index: Number}}
     */
    const getItemLayout = useCallback(
        (data, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
        }),
        [containerWidth],
    );

    /**
     * Cancels the automatic hiding of the arrows.
     */
    const cancelAutoHideArrow = useCallback(() => {
        clearTimeout(autoHideArrowTimeout.current);
    }, []);

    /**
     * Toggles the visibility of the arrows
     * @param {Boolean} newShouldShowArrow
     */
    const toggleArrowsVisibility = useCallback(
        (newShouldShowArrow) => {
            // Don't toggle arrows in a zoomed state
            if (isZoomed) {
                return;
            }

            setShouldShowArrow((prevState) => (_.isBoolean(newShouldShowArrow) ? newShouldShowArrow : !prevState));
        },
        [isZoomed],
    );

    /**
     * On a touch screen device, automatically hide the arrows
     * if there is no interaction for 3 seconds.
     */
    const autoHideArrow = useCallback(() => {
        if (!canUseTouchScreen) {
            return;
        }
        cancelAutoHideArrow();
        autoHideArrowTimeout.current = setTimeout(() => {
            toggleArrowsVisibility(false);
        }, CONST.ARROW_HIDE_DELAY);
    }, [cancelAutoHideArrow, toggleArrowsVisibility]);

    useEffect(() => {
        if (shouldShowArrow) {
            autoHideArrow();
        } else {
            cancelAutoHideArrow();
        }
    }, [shouldShowArrow, autoHideArrow, cancelAutoHideArrow]);

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
            if (newIsZoomed) {
                toggleArrowsVisibility(false);
            }
            setIsZoomed(newIsZoomed);
        },
        [isZoomed, toggleArrowsVisibility],
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

            // The sliding transition is a bit too much on web, because of the wider and bigger images,
            // so we only enable it for mobile
            scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        },
        [attachments, page],
    );

    /**
     * Updates the page state when the user navigates between attachments
     * @param {Array<{item: {source, file}, index: Number}>} viewableItems
     */
    const updatePage = useRef(({viewableItems}) => {
        Keyboard.dismiss();
        // Since we can have only one item in view at a time, we can use the first item in the array
        // to get the index of the current page
        const entry = _.first(viewableItems);
        if (!entry) {
            setActiveSource(null);
            return;
        }

        const pageToSet = entry.index;
        onNavigate(entry.item);
        setPage(pageToSet);
        setIsZoomed(false);
        setActiveSource(entry.item.source);
    }).current;

    /**
     * Defines how a container for a single attachment should be rendered
     * @param {Object} cellRendererProps
     * @returns {JSX.Element}
     */
    const renderCell = useCallback(
        (cellRendererProps) => {
            // Use window width instead of layout width to address the issue in https://github.com/Expensify/App/issues/17760
            // considering horizontal margin and border width in centered modal
            const modalStyles = styles.centeredModalStyles(isSmallScreenWidth, true);
            const style = [cellRendererProps.style, styles.h100, {width: PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2)}];

            return (
                <View
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...cellRendererProps}
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
                isFocused={activeSource === item.source}
                source={item.source}
                file={item.file}
                isAuthTokenRequired={item.isAuthTokenRequired}
                onScaleChanged={canUseTouchScreen ? updateZoomState : undefined}
                onPress={canUseTouchScreen ? toggleArrowsVisibility : undefined}
            />
        ),
        [activeSource, toggleArrowsVisibility, updateZoomState],
    );

    return (
        <View
            style={[styles.attachmentModalArrowsContainer, styles.flex1]}
            onLayout={({nativeEvent}) => setContainerWidth(PixelRatio.roundToNearestPixel(nativeEvent.layout.width))}
            onMouseEnter={() => !canUseTouchScreen && toggleArrowsVisibility(true)}
            onMouseLeave={() => !canUseTouchScreen && toggleArrowsVisibility(false)}
        >
            {shouldShowArrow && (
                <>
                    {!isBackDisabled && (
                        <Tooltip text={translate('common.previous')}>
                            <View style={[styles.attachmentArrow, isSmallScreenWidth ? styles.l2 : styles.l8]}>
                                <Button
                                    small
                                    innerStyles={[styles.arrowIcon]}
                                    icon={Expensicons.BackArrow}
                                    iconFill={themeColors.text}
                                    iconStyles={[styles.mr0]}
                                    onPress={() => {
                                        cycleThroughAttachments(-1);
                                        autoHideArrow();
                                    }}
                                    onPressIn={cancelAutoHideArrow}
                                    onPressOut={autoHideArrow}
                                />
                            </View>
                        </Tooltip>
                    )}
                    {!isForwardDisabled && (
                        <Tooltip text={translate('common.next')}>
                            <View style={[styles.attachmentArrow, isSmallScreenWidth ? styles.r2 : styles.r8]}>
                                <Button
                                    small
                                    innerStyles={[styles.arrowIcon]}
                                    icon={Expensicons.ArrowRight}
                                    iconFill={themeColors.text}
                                    iconStyles={[styles.mr0]}
                                    onPress={() => {
                                        cycleThroughAttachments(1);
                                        autoHideArrow();
                                    }}
                                    onPressIn={cancelAutoHideArrow}
                                    onPressOut={autoHideArrow}
                                />
                            </View>
                        </Tooltip>
                    )}
                </>
            )}

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
                    scrollEnabled={canUseTouchScreen && !isZoomed}
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
                    onViewableItemsChanged={updatePage}
                />
            )}
            <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
        </View>
    );
}

AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;

export default withOnyx({
    reportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
        canEvict: false,
    },
})(AttachmentCarousel);
