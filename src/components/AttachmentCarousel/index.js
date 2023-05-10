import React from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import CarouselActions from './CarouselActions';
import Button from '../Button';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import AttachmentView from '../AttachmentView';
import addEncryptedAuthTokenToURL from '../../libs/addEncryptedAuthTokenToURL';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import tryResolveUrlFromApiRoot from '../../libs/tryResolveUrlFromApiRoot';
import Tooltip from '../Tooltip';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import withWindowDimensions from '../withWindowDimensions';

const propTypes = {
    /** source is used to determine the starting index in the array of attachments */
    source: PropTypes.string,

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate: PropTypes.func,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

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

        this.state = {
            attachments: [],
            source: this.props.source,
            shouldShowArrow: this.canUseTouchScreen,
            containerWidth: 0,
            isZoomed: false,
        };
    }

    componentDidMount() {
        this.makeStateWithReports();
        this.autoHideArrow();
    }

    componentDidUpdate(prevProps) {
        const previousReportActionsCount = _.size(prevProps.reportActions);
        const currentReportActionsCount = _.size(this.props.reportActions);
        if (previousReportActionsCount === currentReportActionsCount) {
            return;
        }

        this.makeStateWithReports();
    }

    /**
     * Helps to navigate between next/previous attachments
     * @param {Object} attachmentItem
     * @returns {Object}
     */
    getAttachment(attachmentItem) {
        const source = _.get(attachmentItem, 'source', '');
        const file = _.get(attachmentItem, 'file', {name: ''});

        return {
            source,
            file,
        };
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
     * Map report actions to attachment items
     */
    makeStateWithReports() {
        let page = 0;
        const actions = ReportActionsUtils.getSortedReportActions(_.values(this.props.reportActions), true);

        /**
         * Looping to filter out attachments and retrieve the src URL and name of attachments.
         */
        const attachments = [];
        _.forEach(actions, ({originalMessage, message}) => {
            // Check for attachment which hasn't been deleted
            if (!originalMessage || !originalMessage.html || _.some(message, (m) => m.isEdited)) {
                return;
            }
            const matches = [...originalMessage.html.matchAll(CONST.REGEX.ATTACHMENT_DATA)];

            // matchAll captured both source url and name of the attachment
            if (matches.length === 2) {
                const [originalSource, name] = _.map(matches, (m) => m[2]);

                // Update the image URL so the images can be accessed depending on the config environment.
                // Eg: while using Ngrok the image path is from an Ngrok URL and not an Expensify URL.
                const source = tryResolveUrlFromApiRoot(originalSource);
                if (source === this.state.source) {
                    page = attachments.length;
                }

                attachments.push({source, file: {name}});
            }
        });

        this.setState({
            page,
            attachments,
        });
    }

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    cycleThroughAttachments(deltaSlide) {
        const nextIndex = this.state.page - deltaSlide;
        const nextItem = this.state.attachments[nextIndex];

        if (!nextItem) {
            return;
        }

        // The sliding transition is a bit too much on web, because of the wider and bigger images,
        // so we only enable it for mobile
        this.scrollRef.current.scrollToIndex({index: nextIndex, animated: this.canUseTouchScreen});
    }

    /**
     * Updates the page state when the user navigates between attachments
     * @param {Array<{item: *, index: Number}>} viewableItems
     */
    updatePage({viewableItems}) {
        // Since we can have only one item in view at a time, we can use the first item in the array
        // to get the index of the current page
        const entry = _.first(viewableItems);
        if (!entry) {
            return;
        }

        const page = entry.index;
        const {source, file} = this.getAttachment(entry.item);
        this.props.onNavigate({source: addEncryptedAuthTokenToURL(source), file});
        this.setState({page, source, isZoomed: false});
    }

    /**
     * Defines how a container for a single attachment should be rendered
     * @param {Object} props
     * @returns {JSX.Element}
     */
    renderCell(props) {
        const style = [props.style, styles.h100, {width: this.state.containerWidth}];

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
     * @param {{ source: String, file: { name: String } }} item
     * @returns {JSX.Element}
     */
    renderItem({item}) {
        const authSource = addEncryptedAuthTokenToURL(item.source);
        if (!this.canUseTouchScreen) {
            return (
                <AttachmentView
                    source={authSource}
                    file={item.file}
                />
            );
        }

        return (
            <AttachmentView
                source={authSource}
                file={item.file}
                onScaleChanged={this.updateZoomState}
                onPress={this.toggleArrowsVisibility}
            />
        );
    }

    render() {
        const isForwardDisabled = this.state.page === 0;
        const isBackDisabled = this.state.page === _.size(this.state.attachments) - 1;

        return (
            <View
                style={[styles.attachmentModalArrowsContainer, styles.flex1]}
                onLayout={({nativeEvent}) => this.setState({containerWidth: nativeEvent.layout.width + 1})}
                onMouseEnter={() => !this.canUseTouchScreen && this.toggleArrowsVisibility(true)}
                onMouseLeave={() => !this.canUseTouchScreen && this.toggleArrowsVisibility(false)}
            >
                {this.state.shouldShowArrow && (
                    <>
                        {!isBackDisabled && (
                            <View style={[styles.attachmentArrow, this.props.isSmallScreenWidth ? styles.l2 : styles.l8]}>
                                <Tooltip text={this.props.translate('common.previous')}>
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
                                </Tooltip>
                            </View>
                        )}
                        {!isForwardDisabled && (
                            <View style={[styles.attachmentArrow, this.props.isSmallScreenWidth ? styles.r2 : styles.r8]}>
                                <Tooltip text={this.props.translate('common.next')}>
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
                                </Tooltip>
                            </View>
                        )}
                    </>
                )}

                {this.state.containerWidth > 0 && (
                    <FlatList
                        listKey="AttachmentCarousel"
                        horizontal
                        // Inverting the list for touchscreen devices that can swipe or have an animation when scrolling
                        // promotes the natural feeling of swiping left/right to go to the next/previous image
                        // We don't want to invert the list for desktop/web because this interferes with mouse
                        // wheel or trackpad scrolling (in cases like document preview where you can scroll vertically)
                        inverted={this.canUseTouchScreen}
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
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            canEvict: false,
        },
    }),
    withLocalize,
    withWindowDimensions,
)(AttachmentCarousel);
