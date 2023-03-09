import PropTypes from 'prop-types';
import React from 'react';
import {Animated} from 'react-native';
import _ from 'underscore';
import InvertedFlatList from '../../../components/InvertedFlatList';
import withDrawerState, {withDrawerPropTypes} from '../../../components/withDrawerState';
import compose from '../../../libs/compose';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import styles from '../../../styles/styles';
import * as ReportUtils from '../../../libs/ReportUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import {withNetwork, withPersonalDetails} from '../../../components/OnyxProvider';
import ReportActionItem from './ReportActionItem';
import ReportActionsSkeletonView from '../../../components/ReportActionsSkeletonView';
import variables from '../../../styles/variables';
import participantPropTypes from '../../../components/participantPropTypes';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportActionPropTypes from './reportActionPropTypes';
import CONST from '../../../CONST';
import * as StyleUtils from '../../../styles/StyleUtils';
import reportPropTypes from '../../reportPropTypes';
import networkPropTypes from '../../../components/networkPropTypes';
import FloatingMessageCounter from './FloatingMessageCounter';

const propTypes = {
    /** Position of the "New" line marker */
    newMarkerReportActionID: PropTypes.string,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Sorted actions prepared for display */
    sortedReportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)).isRequired,

    /** The ID of the most recent IOU report action connected with the shown report */
    mostRecentIOUReportActionID: PropTypes.string,

    /** Are we loading more report actions? */
    isLoadingMoreReportActions: PropTypes.bool,

    /** Callback executed on list layout */
    onLayout: PropTypes.func.isRequired,

    /** Callback executed on scroll */
    onScroll: PropTypes.func.isRequired,

    /** Function to load more chats */
    loadMoreChats: PropTypes.func.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withDrawerPropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    newMarkerReportActionID: '',
    personalDetails: {},
    mostRecentIOUReportActionID: '',
    isLoadingMoreReportActions: false,
};

class ReportActionsList extends React.Component {
    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.currentUnreadMarker = React.createRef(null);
        this.currentScrollOffset = 0;
        this.toggleFloatingMessageCounter = this.toggleFloatingMessageCounter.bind(this);
        this.trackScroll = this.trackScroll.bind(this);
        console.log('<<<<<ReportActionsList constructor>>>>>');
        this.state = {
            fadeInAnimation: new Animated.Value(0),
            skeletonViewHeight: 0,
            isFloatingMessageCounterVisible: false,
        };
    }

    componentDidMount() {
        this.fadeIn();
    }

    /**
     * Create a unique key for each action in the FlatList.
     * We use the reportActionID that is a string representation of a random 64-bit int, which should be
     * random enough to avoid collisions
     * @param {Object} item
     * @param {Object} item.action
     * @return {String}
     */
    keyExtractor(item) {
        return item.reportActionID;
    }

    /**
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     */
    toggleFloatingMessageCounter() {
        if (this.currentScrollOffset < -200 && !this.state.isFloatingMessageCounterVisible) {
            this.setState({isFloatingMessageCounterVisible: true});
        }

        if (this.currentScrollOffset > -200 && this.state.isFloatingMessageCounterVisible) {
            this.setState({isFloatingMessageCounterVisible: false});
        }
    }

    /**
     * keeps track of the Scroll offset of the main messages list
     *
     * @param {Object} {nativeEvent}
     */
    trackScroll({nativeEvent}) {
        this.currentScrollOffset = -nativeEvent.contentOffset.y;
        this.toggleFloatingMessageCounter();
    }

    componentWillUnmount() {
        console.log('<<<<<ReportActionsList componentWillUnmount>>>>>');
        this.currentUnreadMarker = null;
    }

    /**
     * Calculates the ideal number of report actions to render in the first render, based on the screen height and on
     * the height of the smallest report action possible.
     * @return {Number}
     */
    calculateInitialNumToRender() {
        const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom
            + variables.fontSizeNormalHeight;
        const availableHeight = this.props.windowHeight
            - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
        return Math.ceil(availableHeight / minimumReportActionHeight);
    }

    fadeIn() {
        Animated.timing(this.state.fadeInAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    isUnreadMsg(message, lastRead) {
        // console.log(`lastRead ${lastRead} < message ${message?.created}`, message);
        return message && lastRead && message.created && lastRead < message.created;
    }

    /**
     * Do not move this or make it an anonymous function it is a method
     * so it will not be recreated each time we render an item
     *
     * See: https://reactnative.dev/docs/optimizing-flatlist-configuration#avoid-anonymous-function-on-renderitem
     *
     * @param {Object} args
     * @param {Number} args.index
     *
     * @returns {React.Component}
     */
    renderItem({
        item: reportAction,
        index,
    }) {
        // console.log('----------Start renderItem----------');
        let shouldDisplayNewMarker = false;

        // console.log('this.currentUnreadMarker.current', this.currentUnreadMarker.current);
        if (!this.currentUnreadMarker.current) {
            // When the new indicator should not be displayed we explicitly set it to null
            const lastMessage = this.props.sortedReportActions?.[index + 1];

            // console.log('lastMessage', lastMessage);
            const showUnreadUnderlay = !!this.isUnreadMsg(reportAction, this.props.report.lastReadTime);

            // console.log('showUnreadUnderlay', showUnreadUnderlay);
            shouldDisplayNewMarker = showUnreadUnderlay && !this.isUnreadMsg(lastMessage, this.props.report.lastReadTime);

            // console.log('shouldDisplayNewMarker', shouldDisplayNewMarker);

            if (!this.currentUnreadMarker.current && shouldDisplayNewMarker) {
                this.currentUnreadMarker.current = {id: reportAction.reportActionID, index};
            }
        } else {
            shouldDisplayNewMarker = reportAction.reportActionID === this.currentUnreadMarker.current.id;
        }

        // const shouldDisplayNewMarker = reportAction.reportActionID === this.props.newMarkerReportActionID;
        return (
            <ReportActionItem
                report={this.props.report}
                action={reportAction}
                displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(this.props.sortedReportActions, index)}
                shouldDisplayNewMarker={shouldDisplayNewMarker}
                isMostRecentIOUReportAction={reportAction.reportActionID === this.props.mostRecentIOUReportActionID}
                hasOutstandingIOU={this.props.report.hasOutstandingIOU}
                index={index}
            />
        );
    }

    render() {
        // Native mobile does not render updates flatlist the changes even though component did update called.
        // To notify there something changes we can use extraData prop to flatlist
        const extraData = (!this.props.isDrawerOpen && this.props.isSmallScreenWidth) ? this.props.newMarkerReportActionID : undefined;
        const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(this.props.personalDetails, this.props.report);
        return (
            <Animated.View style={[StyleUtils.fade(this.state.fadeInAnimation), styles.flex1]}>
                <FloatingMessageCounter
                    isActive={this.state.isFloatingMessageCounterVisible && this.currentUnreadMarker.current != null}
                    onClick={() => {
                        console.log('FloatingMessageCounter onClick: ', this.currentUnreadMarker.current);
                        this.setState({isFloatingMessageCounterVisible: false});
                        ReportScrollManager.scrollToIndex(this.currentUnreadMarker.current.index, false);
                    }}
                />
                <InvertedFlatList
                    accessibilityLabel="List of chat messages"
                    ref={ReportScrollManager.flatListRef}
                    data={this.props.sortedReportActions}
                    renderItem={this.renderItem}
                    contentContainerStyle={[
                        styles.chatContentScrollView,
                        shouldShowReportRecipientLocalTime && styles.pt0,
                    ]}
                    keyExtractor={this.keyExtractor}
                    initialRowHeight={32}
                    initialNumToRender={this.calculateInitialNumToRender()}
                    onEndReached={this.props.loadMoreChats}
                    onEndReachedThreshold={0.75}
                    ListFooterComponent={() => {
                        if (this.props.report.isLoadingMoreReportActions) {
                            return (
                                <ReportActionsSkeletonView
                                    containerHeight={CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT * 3}
                                />
                            );
                        }

                        // Make sure the oldest report action loaded is not the first. This is so we do not show the
                        // skeleton view above the created action in a newly generated optimistic chat or one with not
                        // that many comments.
                        const lastReportAction = _.last(this.props.sortedReportActions) || {};
                        if (this.props.report.isLoadingReportActions && lastReportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
                            return (
                                <ReportActionsSkeletonView
                                    containerHeight={this.state.skeletonViewHeight}
                                    animate={!this.props.network.isOffline}
                                />
                            );
                        }

                        return null;
                    }}
                    keyboardShouldPersistTaps="handled"
                    onLayout={(event) => {
                        this.setState({
                            skeletonViewHeight: event.nativeEvent.layout.height,
                        });
                        this.props.onLayout(event);
                    }}
                    onScroll={this.trackScroll}
                    extraData={extraData}
                />
            </Animated.View>
        );
    }
}

ReportActionsList.propTypes = propTypes;
ReportActionsList.defaultProps = defaultProps;

export default compose(
    withDrawerState,
    withWindowDimensions,
    withPersonalDetails(),
    withNetwork(),
)(ReportActionsList);
