import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from 'react';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import _ from 'underscore';
import InvertedFlatList from '../../../components/InvertedFlatList';
import compose from '../../../libs/compose';
import styles from '../../../styles/styles';
import * as ReportUtils from '../../../libs/ReportUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import {withNetwork, withPersonalDetails} from '../../../components/OnyxProvider';
import ReportActionItem from './ReportActionItem';
import ReportActionItemParentAction from './ReportActionItemParentAction';
import ReportActionsSkeletonView from '../../../components/ReportActionsSkeletonView';
import variables from '../../../styles/variables';
import participantPropTypes from '../../../components/participantPropTypes';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportActionPropTypes from './reportActionPropTypes';
import CONST from '../../../CONST';
import reportPropTypes from '../../reportPropTypes';
import networkPropTypes from '../../../components/networkPropTypes';
import withLocalize from '../../../components/withLocalize';
import useReportScrollManager from '../../../hooks/useReportScrollManager';

const propTypes = {
    /** Position of the "New" line marker */
    newMarkerReportActionID: PropTypes.string,

    /** Personal details of all the users */
    personalDetailsList: PropTypes.objectOf(participantPropTypes),

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

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    newMarkerReportActionID: '',
    personalDetails: {},
    mostRecentIOUReportActionID: '',
    isLoadingMoreReportActions: false,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

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

function ReportActionsList(props) {
    const reportScrollManager = useReportScrollManager();
    const opacity = useSharedValue(0);
    const animatedStyles = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));
    useEffect(() => {
        opacity.value = withTiming(1, {duration: 100});
    }, [opacity]);
    const [skeletonViewHeight, setSkeletonViewHeight] = useState(0);

    const windowHeight = props.windowHeight;

    /**
     * Calculates the ideal number of report actions to render in the first render, based on the screen height and on
     * the height of the smallest report action possible.
     * @return {Number}
     */
    const calculateInitialNumToRender = useCallback(() => {
        const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom + variables.fontSizeNormalHeight;
        const availableHeight = windowHeight - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
        return Math.ceil(availableHeight / minimumReportActionHeight);
    }, [windowHeight]);

    const report = props.report;
    const hasOutstandingIOU = props.report.hasOutstandingIOU;
    const newMarkerReportActionID = props.newMarkerReportActionID;
    const sortedReportActions = props.sortedReportActions;
    const mostRecentIOUReportActionID = props.mostRecentIOUReportActionID;

    /**
     * @param {Object} args
     * @param {Number} args.index
     * @returns {React.Component}
     */
    const renderItem = useCallback(
        ({item: reportAction, index}) => {
            // When the new indicator should not be displayed we explicitly set it to null
            const shouldDisplayNewMarker = reportAction.reportActionID === newMarkerReportActionID;
            const shouldDisplayParentAction =
                reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED &&
                ReportUtils.isChatThread(report) &&
                !ReportActionsUtils.isTransactionThread(ReportActionsUtils.getParentReportAction(report));
            const shouldHideThreadDividerLine =
                shouldDisplayParentAction && sortedReportActions.length > 1 && sortedReportActions[sortedReportActions.length - 2].reportActionID === newMarkerReportActionID;
            return shouldDisplayParentAction ? (
                <ReportActionItemParentAction
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    reportID={report.reportID}
                    parentReportID={`${report.parentReportID}`}
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                />
            ) : (
                <ReportActionItem
                    report={report}
                    action={reportAction}
                    displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(sortedReportActions, index)}
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                    shouldShowSubscriptAvatar={
                        (ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isExpenseReport(report)) &&
                        _.contains([CONST.REPORT.ACTIONS.TYPE.IOU, CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW], reportAction.actionName)
                    }
                    isMostRecentIOUReportAction={reportAction.reportActionID === mostRecentIOUReportActionID}
                    hasOutstandingIOU={hasOutstandingIOU}
                    index={index}
                    isOnlyReportAction={sortedReportActions.length === 1}
                />
            );
        },
        [report, hasOutstandingIOU, newMarkerReportActionID, sortedReportActions, mostRecentIOUReportActionID],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = [props.isSmallScreenWidth ? props.newMarkerReportActionID : undefined, ReportUtils.isArchivedRoom(props.report)];
    const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(props.personalDetailsList, props.report, props.currentUserPersonalDetails.accountID);
    return (
        <Animated.View style={[animatedStyles, styles.flex1]}>
            <InvertedFlatList
                accessibilityLabel={props.translate('sidebarScreen.listOfChatMessages')}
                ref={reportScrollManager.ref}
                data={props.sortedReportActions}
                renderItem={renderItem}
                contentContainerStyle={[styles.chatContentScrollView, shouldShowReportRecipientLocalTime]}
                keyExtractor={keyExtractor}
                initialRowHeight={32}
                initialNumToRender={calculateInitialNumToRender()}
                onEndReached={props.loadMoreChats}
                onEndReachedThreshold={0.75}
                ListFooterComponent={() => {
                    if (props.report.isLoadingMoreReportActions) {
                        return <ReportActionsSkeletonView containerHeight={CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT * 3} />;
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
}

ReportActionsList.propTypes = propTypes;
ReportActionsList.defaultProps = defaultProps;
ReportActionsList.displayName = 'ReportActionsList';

export default compose(withWindowDimensions, withLocalize, withPersonalDetails(), withNetwork(), withCurrentUserPersonalDetails)(ReportActionsList);
