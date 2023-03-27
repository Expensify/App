import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from 'react';
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

const ReportActionsList = (props) => {
    const [fadeInAnimation] = useState(() => new Animated.Value(0));
    const [skeletonViewHeight, setSkeletonViewHeight] = useState(0);

    /**
     * Calculates the ideal number of report actions to render in the first render, based on the screen height and on
     * the height of the smallest report action possible.
     * @return {Number}
     */
    const calculateInitialNumToRender = useCallback(() => {
        const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom
            + variables.fontSizeNormalHeight;
        const availableHeight = props.windowHeight
            - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
        return Math.ceil(availableHeight / minimumReportActionHeight);
    }, [props.windowHeight]);

    /**
     * Create a unique key for each action in the FlatList.
     * We use the reportActionID that is a string representation of a random 64-bit int, which should be
     * random enough to avoid collisions
     * @param {Object} item
     * @param {Object} item.action
     * @return {String}
     */
    function keyExtractor(item) {
        return item.reportActionID;
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
    function renderItem({
        item: reportAction,
        index,
    }) {
        // When the new indicator should not be displayed we explicitly set it to null
        const shouldDisplayNewMarker = reportAction.reportActionID === props.newMarkerReportActionID;
        return (
            <ReportActionItem
                report={props.report}
                action={reportAction}
                displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(props.sortedReportActions, index)}
                shouldDisplayNewMarker={shouldDisplayNewMarker}
                isMostRecentIOUReportAction={reportAction.reportActionID === props.mostRecentIOUReportActionID}
                hasOutstandingIOU={props.report.hasOutstandingIOU}
                index={index}
            />
        );
    }

    const fadeIn = useCallback(() => {
        Animated.timing(fadeInAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [fadeInAnimation]);

    useEffect(() => {
        fadeIn();
    }, []);

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = (!props.isDrawerOpen && props.isSmallScreenWidth) ? props.newMarkerReportActionID : undefined;
    const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(props.personalDetails, props.report);
    return (
        <Animated.View style={[StyleUtils.fade(fadeInAnimation), styles.flex1]}>
            <InvertedFlatList
                accessibilityLabel="List of chat messages"
                ref={ReportScrollManager.flatListRef}
                data={props.sortedReportActions}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.chatContentScrollView,
                    shouldShowReportRecipientLocalTime && styles.pt0,
                ]}
                keyExtractor={keyExtractor}
                initialRowHeight={32}
                initialNumToRender={calculateInitialNumToRender()}
                onEndReached={props.loadMoreChats}
                onEndReachedThreshold={0.75}
                ListFooterComponent={() => {
                    if (props.report.isLoadingMoreReportActions) {
                        return (
                            <ReportActionsSkeletonView
                                containerHeight={CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT * 3}
                            />
                        );
                    }

                    // Make sure the oldest report action loaded is not the first. This is so we do not show the
                    // skeleton view above the created action in a newly generated optimistic chat or one with not
                    // that many comments.
                    const lastReportAction = _.last(props.sortedReportActions) || {};
                    if (props.report.isLoadingReportActions && lastReportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
                        return (
                            <ReportActionsSkeletonView
                                containerHeight={skeletonViewHeight}
                                animate={!props.network.isOffline}
                            />
                        );
                    }

                    return null;
                }}
                keyboardShouldPersistTaps="handled"
                onLayout={(event) => {
                    setSkeletonViewHeight(event.nativeEvent.layout.height);
                    props.onLayout(event);
                }}
                onScroll={props.onScroll}
                extraData={extraData}
            />
        </Animated.View>
    );
};

ReportActionsList.propTypes = propTypes;
ReportActionsList.defaultProps = defaultProps;
ReportActionsList.displayName = 'ReportActionsList';

export default compose(
    withDrawerState,
    withWindowDimensions,
    withPersonalDetails(),
    withNetwork(),
)(ReportActionsList);
