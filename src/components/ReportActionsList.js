import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';

import * as ReportScrollManager from '../libs/ReportScrollManager';
import InvertedFlatList from './InvertedFlatList';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';
import ReportActionItem from '../pages/home/report/ReportActionItem';
import CONST from '../CONST';
import Timing from '../libs/actions/Timing';
import variables from '../styles/variables';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import Performance from '../libs/Performance';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import * as Report from '../libs/actions/Report';
import {withPersonalDetails} from './OnyxProvider';
import * as ReportUtils from '../libs/reportUtils';
import participantPropTypes from './participantPropTypes';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import reportPropTypes from './reportPropTypes';

let initMeasured = false;

const propTypes = {
    /** Whether we are loading the current report's Report actions */
    isLoadingReportActions: PropTypes.bool,

    /** A list of sorted report actions */
    sortedReportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** Report object */
    report: reportPropTypes.isRequired,

    /** Report ID */
    reportID: PropTypes.number.isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    sortedReportActions: [],
    personalDetails: {},
    isLoadingReportActions: false,
};

class ReportActionsList extends React.Component {
    constructor(props) {
        super(props);

        this.didLayout = false;
        this.renderItem = this.renderItem.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.loadMoreChats = this.loadMoreChats.bind(this);
        this.recordTimeToMeasureItemLayout = this.recordTimeToMeasureItemLayout.bind(this);
    }

    /**
     * Runs when the FlatList finishes laying out
     */
    recordTimeToMeasureItemLayout() {
        if (this.didLayout) {
            return;
        }

        this.didLayout = true;
        Timing.end(CONST.TIMING.SWITCH_REPORT, CONST.TIMING.COLD);

        // Capture the init measurement only once not per each chat switch as the value gets overwritten
        if (!initMeasured) {
            Performance.markEnd(CONST.TIMING.REPORT_INITIAL_RENDER);
            initMeasured = true;
        } else {
            Performance.markEnd(CONST.TIMING.SWITCH_REPORT);
        }
    }

    /**
     * Returns true when the report action immediately before the
     * specified index is a comment made by the same actor who who
     * is leaving a comment in the action at the specified index.
     * Also checks to ensure that the comment is not too old to
     * be considered part of the same comment
     *
     * @param {Number} actionIndex - index of the comment item in state to check
     *
     * @return {Boolean}
     */
    isConsecutiveActionMadeByPreviousActor(actionIndex) {
        const previousAction = this.props.sortedReportActions[actionIndex + 1];
        const currentAction = this.props.sortedReportActions[actionIndex];

        // It's OK for there to be no previous action, and in that case, false will be returned
        // so that the comment isn't grouped
        if (!currentAction || !previousAction) {
            return false;
        }

        // Comments are only grouped if they happen within 5 minutes of each other
        if (currentAction.action.timestamp - previousAction.action.timestamp > 300) {
            return false;
        }

        // Do not group if previous or current action was a renamed action
        if (previousAction.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED
            || currentAction.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
            return false;
        }

        return currentAction.action.actorEmail === previousAction.action.actorEmail;
    }

    /**
     * Create a unique key for Each Action in the FlatList.
     * We use a combination of sequenceNumber and clientID in case the clientID are the same - which
     * shouldn't happen, but might be possible in some rare cases.
     * @param {Object} item
     * @return {String}
     */
    keyExtractor(item) {
        return `${item.action.sequenceNumber}${item.action.clientID}`;
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
            - (styles.chatItemCompose.minHeight + variables.contentHeaderHeight);
        return Math.ceil(availableHeight / minimumReportActionHeight);
    }

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    loadMoreChats() {
        // Only fetch more if we are not already fetching so that we don't initiate duplicate requests.
        if (this.props.isLoadingReportActions) {
            return;
        }

        const minSequenceNumber = _.chain(this.props.reportActions)
            .pluck('sequenceNumber')
            .min()
            .value();

        if (minSequenceNumber === 0) {
            return;
        }

        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments, unless we're near the beginning, in which
        // case just get everything starting from 0.
        const offset = Math.max(minSequenceNumber - CONST.REPORT.ACTIONS.LIMIT, 0);
        Report.fetchActionsWithLoadingState(this.props.reportID, offset);
    }

    /**
     * This function overrides the CellRendererComponent (defaults to a plain View), giving each ReportActionItem a
     * higher z-index than the one below it. This prevents issues where the ReportActionContextMenu overlapping between
     * rows is hidden beneath other rows.
     *
     * @param {Object} index - The ReportAction item in the FlatList.
     * @param {Object|Array} style – The default styles of the CellRendererComponent provided by the CellRenderer.
     * @param {Object} props – All the other Props provided to the CellRendererComponent by default.
     * @returns {React.Component}
     */
    renderCell({item, style, ...props}) {
        const cellStyle = [
            style,
            {zIndex: item.action.sequenceNumber},
        ];
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <View style={cellStyle} {...props} />;
    }

    /**
     * Do not move this or make it an anonymous function it is a method
     * so it will not be recreated each time we render an item
     *
     * See: https://reactnative.dev/docs/optimizing-flatlist-configuration#avoid-anonymous-function-on-renderitem
     *
     * @param {Object} args
     * @param {Object} args.item
     * @param {Number} args.index
     *
     * @returns {React.Component}
     */
    renderItem({
        item,
        index,
    }) {
        const shouldDisplayNewIndicator = this.props.report.newMarkerSequenceNumber > 0
            && item.action.sequenceNumber === this.props.report.newMarkerSequenceNumber;
        return (
            <ReportActionItem
                reportID={this.props.reportID}
                action={item.action}
                displayAsGroup={this.isConsecutiveActionMadeByPreviousActor(index)}
                shouldDisplayNewIndicator={shouldDisplayNewIndicator}
                isMostRecentIOUReportAction={item.action.sequenceNumber === this.mostRecentIOUReportSequenceNumber}
                hasOutstandingIOU={this.props.report.hasOutstandingIOU}
                index={index}
            />
        );
    }

    render() {
        const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(this.props.personalDetails, this.props.report);

        return (
            <InvertedFlatList
                ref={ReportScrollManager.flatListRef}
                data={this.props.sortedReportActions}
                renderItem={this.renderItem}
                CellRendererComponent={this.renderCell}
                contentContainerStyle={[styles.chatContentScrollView, shouldShowReportRecipientLocalTime && styles.pt0]}
                keyExtractor={this.keyExtractor}
                initialRowHeight={32}
                initialNumToRender={this.calculateInitialNumToRender()}
                onEndReached={this.loadMoreChats}
                onEndReachedThreshold={0.75}
                ListFooterComponent={this.props.isLoadingReportActions
                    ? <ActivityIndicator size="small" color={themeColors.spinner} />
                    : null}
                keyboardShouldPersistTaps="handled"
                onLayout={this.recordTimeToMeasureItemLayout}
                onScroll={this.props.onScroll}
                extraData={this.props.extraData}
            />
        );
    }
}

ReportActionsList.defaultProps = defaultProps;
ReportActionsList.propTypes = propTypes;

export default compose(
    withPersonalDetails(),
    withWindowDimensions,
    withOnyx({
        isLoadingReportActions: {
            key: ONYXKEYS.IS_LOADING_REPORT_ACTIONS,
            initWithStoredValues: false,
        },
    }),
)(ReportActionsList);
