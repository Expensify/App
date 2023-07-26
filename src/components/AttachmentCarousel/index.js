import React from 'react';
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

class AttachmentCarousel extends React.Component {
    constructor(props) {
        super(props);

        this.scrollRef = React.createRef();
        this.canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
        this.viewabilityConfig = {
            // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
            // more than 90% visible. When that happens we update the page index in the state.
            itemVisiblePercentThreshold: 95,
        };

        this.cycleThroughAttachments = this.cycleThroughAttachments.bind(this);
        this.autoHideArrow = this.autoHideArrow.bind(this);
        this.cancelAutoHideArrow = this.cancelAutoHideArrow.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.updatePage = this.updatePage.bind(this);
        this.updateZoomState = this.updateZoomState.bind(this);
        this.toggleArrowsVisibility = this.toggleArrowsVisibility.bind(this);

        this.state = this.createInitialState();
    }

    componentDidMount() {
        this.autoHideArrow();
    }

    /**
     * Calculate items layout information to optimize scrolling performance
     * @param {*} data
     * @param {Number} index
     * @returns {{offset: Number, length: Number, index: Number}}
     */
    getItemLayout(data, index) {
        return {
            length: this.state.containerWidth,
            offset: this.state.containerWidth * index,
            index,
        };
    }

    /**
     * On a touch screen device, automatically hide the arrows
     * if there is no interaction for 3 seconds.
     */
    autoHideArrow() {
        if (!this.canUseTouchScreen) {
            return;
        }
        this.cancelAutoHideArrow();
        this.autoHideArrowTimeout = setTimeout(() => {
            this.toggleArrowsVisibility(false);
        }, CONST.ARROW_HIDE_DELAY);
    }

    /**
     * Cancels the automatic hiding of the arrows.
     */
    cancelAutoHideArrow() {
        clearTimeout(this.autoHideArrowTimeout);
    }

    /**
     * Toggles the visibility of the arrows
     * @param {Boolean} shouldShowArrow
     */
    toggleArrowsVisibility(shouldShowArrow) {
        // Don't toggle arrows in a zoomed state
        if (this.state.isZoomed) {
            return;
        }
        this.setState(
            (current) => {
                const newShouldShowArrow = _.isBoolean(shouldShowArrow) ? shouldShowArrow : !current.shouldShowArrow;
                return {shouldShowArrow: newShouldShowArrow};
            },
            () => {
                if (this.state.shouldShowArrow) {
                    this.autoHideArrow();
                } else {
                    this.cancelAutoHideArrow();
                }
            },
        );
    }

    /**
     * Updates zoomed state to enable/disable panning the PDF
     * @param {Number} scale current PDF scale
     */
    updateZoomState(scale) {
        const isZoomed = scale > 1;
        if (isZoomed === this.state.isZoomed) {
            return;
        }
        if (isZoomed) {
            this.toggleArrowsVisibility(false);
        }
        this.setState({isZoomed});
    }

    /**
     * Constructs the initial component state from report actions
     * @returns {{page: Number, attachments: Array, shouldShowArrow: Boolean, containerWidth: Number, isZoomed: Boolean}}
     */
    createInitialState() {
        const actions = [ReportActionsUtils.getParentReportAction(this.props.report), ...ReportActionsUtils.getSortedReportActions(_.values(this.props.reportActions))];
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
        if (this.canUseTouchScreen) {
            attachments.reverse();
        }

        const page = _.findIndex(attachments, (a) => a.source === this.props.source);
        if (page === -1) {
            throw new Error('Attachment not found');
        }

        // Update the parent modal's state with the source and name from the mapped attachments
        this.props.onNavigate(attachments[page]);

        return {
            page,
            attachments,
            shouldShowArrow: this.canUseTouchScreen,
            containerWidth: 0,
            isZoomed: false,
            activeSource: null,
        };
    }

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    cycleThroughAttachments(deltaSlide) {
        let delta = deltaSlide;
        if (this.canUseTouchScreen) {
            delta = deltaSlide * -1;
        }

        const nextIndex = this.state.page - delta;
        const nextItem = this.state.attachments[nextIndex];

        if (!nextItem || !this.scrollRef.current) {
            return;
        }

        // The sliding transition is a bit too much on web, because of the wider and bigger images,
        // so we only enable it for mobile
        this.scrollRef.current.scrollToIndex({index: nextIndex, animated: this.canUseTouchScreen});
    }

    /**
     * Updates the page state when the user navigates between attachments
     * @param {Array<{item: {source, file}, index: Number}>} viewableItems
     */
    updatePage({viewableItems}) {
        Keyboard.dismiss();
        // Since we can have only one item in view at a time, we can use the first item in the array
        // to get the index of the current page
        const entry = _.first(viewableItems);
        if (!entry) {
            this.setState({activeSource: null});
            return;
        }

        const page = entry.index;
        this.props.onNavigate(entry.item);
        this.setState({page, isZoomed: false, activeSource: entry.item.source});
    }

    /**
     * Defines how a container for a single attachment should be rendered
     * @param {Object} props
     * @returns {JSX.Element}
     */
    renderCell(props) {
        // Use window width instead of layout width to address the issue in https://github.com/Expensify/App/issues/17760
        // considering horizontal margin and border width in centered modal
        const modalStyles = styles.centeredModalStyles(this.props.isSmallScreenWidth, true);
        const style = [props.style, styles.h100, {width: PixelRatio.roundToNearestPixel(this.props.windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2)}];

        return (
            <View
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                style={style}
            />
        );
    }

    /**
     * Defines how a single attachment should be rendered
     * @param {Object} item
     * @param {Boolean} item.isAuthTokenRequired
     * @param {String} item.source
     * @param {Object} item.file
     * @param {String} item.file.name
     * @returns {JSX.Element}
     */
    renderItem({item}) {
        return (
            <AttachmentView
                isFocused={this.state.activeSource === item.source}
                source={item.source}
                file={item.file}
                isAuthTokenRequired={item.isAuthTokenRequired}
                onScaleChanged={this.canUseTouchScreen ? this.updateZoomState : undefined}
                onPress={this.canUseTouchScreen ? this.toggleArrowsVisibility : undefined}
            />
        );
    }

    render() {
        let isForwardDisabled = this.state.page === 0;
        let isBackDisabled = this.state.page === _.size(this.state.attachments) - 1;

        if (this.canUseTouchScreen) {
            isForwardDisabled = isBackDisabled;
            isBackDisabled = this.state.page === 0;
        }

        return (
            <View
                style={[styles.attachmentModalArrowsContainer, styles.flex1]}
                onLayout={({nativeEvent}) => this.setState({containerWidth: PixelRatio.roundToNearestPixel(nativeEvent.layout.width)})}
                onMouseEnter={() => !this.canUseTouchScreen && this.toggleArrowsVisibility(true)}
                onMouseLeave={() => !this.canUseTouchScreen && this.toggleArrowsVisibility(false)}
            >
                {this.state.shouldShowArrow && (
                    <>
                        {!isBackDisabled && (
                            <Tooltip text={this.props.translate('common.previous')}>
                                <View style={[styles.attachmentArrow, this.props.isSmallScreenWidth ? styles.l2 : styles.l8]}>
                                    <Button
                                        small
                                        innerStyles={[styles.arrowIcon]}
                                        icon={Expensicons.BackArrow}
                                        iconFill={themeColors.text}
                                        iconStyles={[styles.mr0]}
                                        onPress={() => {
                                            this.cycleThroughAttachments(-1);
                                            this.autoHideArrow();
                                        }}
                                        onPressIn={this.cancelAutoHideArrow}
                                        onPressOut={this.autoHideArrow}
                                    />
                                </View>
                            </Tooltip>
                        )}
                        {!isForwardDisabled && (
                            <Tooltip text={this.props.translate('common.next')}>
                                <View style={[styles.attachmentArrow, this.props.isSmallScreenWidth ? styles.r2 : styles.r8]}>
                                    <Button
                                        small
                                        innerStyles={[styles.arrowIcon]}
                                        icon={Expensicons.ArrowRight}
                                        iconFill={themeColors.text}
                                        iconStyles={[styles.mr0]}
                                        onPress={() => {
                                            this.cycleThroughAttachments(1);
                                            this.autoHideArrow();
                                        }}
                                        onPressIn={this.cancelAutoHideArrow}
                                        onPressOut={this.autoHideArrow}
                                    />
                                </View>
                            </Tooltip>
                        )}
                    </>
                )}

                {this.state.containerWidth > 0 && (
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
                        snapToInterval={this.state.containerWidth}
                        // Enable scrolling by swiping on mobile (touch) devices only
                        // disable scroll for desktop/browsers because they add their scrollbars
                        // Enable scrolling FlatList only when PDF is not in a zoomed state
                        scrollEnabled={this.canUseTouchScreen && !this.state.isZoomed}
                        ref={this.scrollRef}
                        initialScrollIndex={this.state.page}
                        initialNumToRender={3}
                        windowSize={5}
                        maxToRenderPerBatch={3}
                        data={this.state.attachments}
                        CellRendererComponent={this.renderCell}
                        renderItem={this.renderItem}
                        getItemLayout={this.getItemLayout}
                        keyExtractor={(item) => item.source}
                        viewabilityConfig={this.viewabilityConfig}
                        onViewableItemsChanged={this.updatePage}
                    />
                )}

                <CarouselActions onCycleThroughAttachments={this.cycleThroughAttachments} />
            </View>
        );
    }
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
