import React, {useEffect, useRef, useState} from 'react';
import {View, FlatList, PixelRatio, Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import {Parser as HtmlParser} from 'htmlparser2';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import CarouselActions from './CarouselActions';
import Button from '../Button';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import AttachmentView from '../AttachmentView';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import tryResolveUrlFromApiRoot from '../../libs/tryResolveUrlFromApiRoot';
import Tooltip from '../Tooltip';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import withWindowDimensions from '../withWindowDimensions';
import reportPropTypes from '../../pages/reportPropTypes';

const propTypes = {
    /** source is used to determine the starting index in the array of attachments */
    source: PropTypes.string,

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate: PropTypes.func,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    source: '',
    reportActions: {},
    onNavigate: () => {},
};

const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 90% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

/**
 * Constructs the initial component state from report actions
 * @param {Object} props
 * @returns {{page: Number, attachments: Array}}
 */
function createInitialState(props) {
    const actions = [ReportActionsUtils.getParentReportAction(props.report), ...ReportActionsUtils.getSortedReportActions(_.values(props.reportActions))];
    const attachments = [];

    const htmlParser = new HtmlParser({
        onopentag: (name, attribs) => {
            if (name !== 'img' || !attribs.src) {
                return;
            }

            const expensifySource = attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];

            // By iterating actions in chronological order and prepending each attachment
            // we ensure correct order of attachments even across actions with multiple attachments.
            attachments.unshift({
                source: tryResolveUrlFromApiRoot(expensifySource || attribs.src),
                isAuthTokenRequired: Boolean(expensifySource),
                file: {name: attribs[CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE]},
            });
        },
    });

    _.forEach(actions, (action, key) => {
        if (!ReportActionsUtils.shouldReportActionBeVisible(action, key)) {
            return;
        }
        htmlParser.write(_.get(action, ['message', 0, 'html']));
    });
    htmlParser.end();

    // Inverting the list for touchscreen devices that can swipe or have an animation when scrolling
    // promotes the natural feeling of swiping left/right to go to the next/previous image
    // We don't want to invert the list for desktop/web because this interferes with mouse
    // wheel or trackpad scrolling (in cases like document preview where you can scroll vertically)
    if (canUseTouchScreen) {
        attachments.reverse();
    }

    const page = _.findIndex(attachments, (a) => a.source === props.source);
    if (page === -1) {
        throw new Error('Attachment not found');
    }

    // Update the parent modal's state with the source and name from the mapped attachments
    props.onNavigate(attachments[page]);

    return {
        page,
        attachments,
    };
}

function AttachmentCarousel(props) {
    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState([]);
    const [shouldShowArrow, setShouldShowArrow] = useState(canUseTouchScreen);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [activeSource, setActiveSource] = useState(null);

    const scrollRef = useRef(null);

    let autoHideArrowTimeout;

    useEffect(() => {
        const initialState = createInitialState(props);
        setPage(initialState.page);
        setAttachments(initialState.attachments);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Calculate items layout information to optimize scrolling performance
     * @param {*} data
     * @param {Number} index
     * @returns {{offset: Number, length: Number, index: Number}}
     */
    function getItemLayout(data, index) {
        return {
            length: containerWidth,
            offset: containerWidth * index,
            index,
        };
    }

    /**
     * Cancels the automatic hiding of the arrows.
     */
    function cancelAutoHideArrow() {
        clearTimeout(autoHideArrowTimeout);
    }

    /**
     * Toggles the visibility of the arrows
     * @param {Boolean} areArrowsVisible
     */
    function toggleArrowsVisibility(areArrowsVisible) {
        // Don't toggle arrows in a zoomed state
        if (isZoomed) {
            return;
        }

        setShouldShowArrow((prevState) => (_.isBoolean(areArrowsVisible) ? areArrowsVisible : !prevState));
    }

    /**
     * On a touch screen device, automatically hide the arrows
     * if there is no interaction for 3 seconds.
     */
    function autoHideArrow() {
        if (!canUseTouchScreen) {
            return;
        }
        cancelAutoHideArrow();
        autoHideArrowTimeout = setTimeout(() => {
            toggleArrowsVisibility(false);
        }, CONST.ARROW_HIDE_DELAY);
    }

    useEffect(() => {
        autoHideArrow();
    }, []);

    useEffect(() => {
        if (shouldShowArrow) {
            autoHideArrow();
        } else {
            cancelAutoHideArrow();
        }
    }, [shouldShowArrow]);

    /**
     * Updates zoomed state to enable/disable panning the PDF
     * @param {Number} scale current PDF scale
     */
    function updateZoomState(scale) {
        const newIsZoomed = scale > 1;
        if (newIsZoomed === isZoomed) {
            return;
        }
        if (newIsZoomed) {
            toggleArrowsVisibility(false);
        }
        setIsZoomed(newIsZoomed);
    }

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    function cycleThroughAttachments(deltaSlide) {
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
    }

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
        props.onNavigate(entry.item);
        setPage(pageToSet);
        setIsZoomed(false);
        setActiveSource(entry.item.source);
    }).current;

    /**
     * Defines how a container for a single attachment should be rendered
     * @param {Object} cellRendererProps
     * @returns {JSX.Element}
     */
    function renderCell(cellRendererProps) {
        // Use window width instead of layout width to address the issue in https://github.com/Expensify/App/issues/17760
        // considering horizontal margin and border width in centered modal
        const modalStyles = styles.centeredModalStyles(props.isSmallScreenWidth, true);
        const style = [cellRendererProps.style, styles.h100, {width: PixelRatio.roundToNearestPixel(props.windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2)}];

        return (
            <View
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...cellRendererProps}
                style={style}
            />
        );
    }

    /**
     * Defines how a single attachment should be rendered
     * @param {{ isAuthTokenRequired: Boolean, source: String, file: { name: String } }} item
     * @returns {JSX.Element}
     */
    function renderItem({item}) {
        return (
            <AttachmentView
                isFocused={activeSource === item.source}
                source={item.source}
                file={item.file}
                isAuthTokenRequired={item.isAuthTokenRequired}
                onScaleChanged={canUseTouchScreen ? updateZoomState : undefined}
                onPress={canUseTouchScreen ? toggleArrowsVisibility : undefined}
            />
        );
    }

    let isForwardDisabled = page === 0;
    let isBackDisabled = page === _.size(attachments) - 1;

    if (canUseTouchScreen) {
        isForwardDisabled = isBackDisabled;
        isBackDisabled = page === 0;
    }

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
                        <Tooltip text={props.translate('common.previous')}>
                            <View style={[styles.attachmentArrow, props.isSmallScreenWidth ? styles.l2 : styles.l8]}>
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
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onPressIn={cancelAutoHideArrow}
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onPressOut={autoHideArrow}
                                />
                            </View>
                        </Tooltip>
                    )}
                    {!isForwardDisabled && (
                        <Tooltip text={props.translate('common.next')}>
                            <View style={[styles.attachmentArrow, props.isSmallScreenWidth ? styles.r2 : styles.r8]}>
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
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onPressIn={cancelAutoHideArrow}
                                    // eslint-disable-next-line react/jsx-no-bind
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
                    // eslint-disable-next-line react/jsx-no-bind
                    CellRendererComponent={renderCell}
                    // eslint-disable-next-line react/jsx-no-bind
                    renderItem={renderItem}
                    // eslint-disable-next-line react/jsx-no-bind
                    getItemLayout={getItemLayout}
                    keyExtractor={(item) => item.source}
                    viewabilityConfig={viewabilityConfig}
                    onViewableItemsChanged={updatePage}
                />
            )}
            <CarouselActions
                // eslint-disable-next-line react/jsx-no-bind
                onCycleThroughAttachments={cycleThroughAttachments}
            />
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
