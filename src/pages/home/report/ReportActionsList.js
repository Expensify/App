import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {ActivityIndicator, View} from 'react-native';
import InvertedFlatList from '../../../components/InvertedFlatList';
import withDrawerState, {withDrawerPropTypes} from '../../../components/withDrawerState';
import compose from '../../../libs/compose';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as ReportUtils from '../../../libs/reportUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import ONYXKEYS from '../../../ONYXKEYS';
import {withPersonalDetails} from '../../../components/OnyxProvider';
import ReportActionItem from './ReportActionItem';
import variables from '../../../styles/variables';
import participantPropTypes from '../../../components/participantPropTypes';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';

const propTypes = {
    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: PropTypes.shape({
        /** Number of actions unread */
        unreadActionCount: PropTypes.number,

        /** The largest sequenceNumber on this report */
        maxSequenceNumber: PropTypes.number,

        /** The current position of the new marker */
        newMarkerSequenceNumber: PropTypes.number,

        /** Whether there is an outstanding amount in IOU */
        hasOutstandingIOU: PropTypes.bool,
    }).isRequired,

    ...withDrawerPropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    personalDetails: {},
};

class ReportActionsList extends React.Component {
    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.isConsecutiveActionMadeByPreviousActor = this.isConsecutiveActionMadeByPreviousActor.bind(this);
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
            - (styles.chatFooter.minHeight + variables.contentHeaderHeight);
        return Math.ceil(availableHeight / minimumReportActionHeight);
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
                displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(this.props.sortedReportActions, this.props.index)}
                shouldDisplayNewIndicator={shouldDisplayNewIndicator}
                isMostRecentIOUReportAction={item.action.sequenceNumber === this.props.mostRecentIOUReportSequenceNumber}
                hasOutstandingIOU={this.props.report.hasOutstandingIOU}
                index={index}
            />
        );
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

    render() {
        // Native mobile does not render updates flatlist the changes even though component did update called.
        // To notify there something changes we can use extraData prop to flatlist
        const extraData = (!this.props.isDrawerOpen && this.props.isSmallScreenWidth) ? this.props.report.newMarkerSequenceNumber : undefined;
        const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(this.props.personalDetails, this.props.report);
        return (
            <InvertedFlatList
                ref={ReportScrollManager.flatListRef}
                data={this.props.sortedReportActions}
                renderItem={this.renderItem}
                CellRendererComponent={this.renderCell}
                contentContainerStyle={[
                    styles.chatContentScrollView,
                    shouldShowReportRecipientLocalTime && styles.pt0,
                ]}
                keyExtractor={this.keyExtractor}
                initialRowHeight={32}
                initialNumToRender={this.calculateInitialNumToRender()}
                onEndReached={this.loadMoreChats}
                onEndReachedThreshold={0.75}
                ListFooterComponent={this.props.isLoadingReportActions
                    ? <ActivityIndicator size="small" color={themeColors.spinner} />
                    : null}
                keyboardShouldPersistTaps="handled"
                onLayout={this.props.onLayout}
                onScroll={this.props.onScroll}
                extraData={extraData}
            />
        );
    }
}

ReportActionsList.propTypes = propTypes;
ReportActionsList.defaultProps = defaultProps;

export default compose(
    withDrawerState,
    withWindowDimensions,
    withPersonalDetails(),
    withOnyx({
        isLoadingReportActions: {
            key: ONYXKEYS.IS_LOADING_REPORT_ACTIONS,
            initWithStoredValues: false,
        },
    }),
)(ReportActionsList);
