import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashFindLast from 'lodash/findLast';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import ArchivedReportFooter from '../../../components/ArchivedReportFooter';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import OfflineIndicator from '../../../components/OfflineIndicator';
import ReportActionCompose from './ReportActionCompose';
import SwipeableView from '../../../components/SwipeableView';
import CONST from '../../../CONST';
import reportActionPropTypes from './reportActionPropTypes';
import reportPropTypes from './reportPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';

const propTypes = {
    /** Current offline status */
    isOffline: PropTypes.bool.isRequired,

    /** Current report object */
    report: reportPropTypes.isRequired,

    /** Callback to call when the composer is submitted */
    onSubmit: PropTypes.func.isRequired,

    /** Whether the composer is expanded */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Whether or not to show the Compose Input */
    shouldShowComposeInput: PropTypes.bool.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)).isRequired,

    /** Pending action for the workspace room if one exists */
    addWorkspaceRoomPendingAction: PropTypes.string,

    /** Any workspace room errors that might exist */
    addWorkspaceRoomErrors: PropTypes.object,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    addWorkspaceRoomPendingAction: null,
    addWorkspaceRoomErrors: {},
};

class ReportFooter extends React.Component {
    /**
     * @returns {Object}
     */
    setChatFooterStyles() {
        return {...styles.chatFooter, minHeight: !this.props.isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    }

    render() {
        const isArchivedRoom = ReportUtils.isArchivedRoom(this.props.report);
        let reportClosedAction;
        if (isArchivedRoom) {
            reportClosedAction = lodashFindLast(this.props.reportActions, action => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
        }
        const hideComposer = isArchivedRoom || !_.isEmpty(this.props.addWorkspaceRoomErrors);
        return (
            <>
                {(isArchivedRoom || hideComposer) && (
                    <View style={[styles.chatFooter]}>
                        {isArchivedRoom && (
                            <ArchivedReportFooter
                                reportClosedAction={reportClosedAction}
                                report={this.props.report}
                            />
                        )}
                        {!this.props.isSmallScreenWidth && (
                            <View style={styles.offlineIndicatorRow}>
                                {hideComposer && (
                                    <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />
                                )}
                            </View>
                        )}
                    </View>
                )}
                {(!hideComposer && this.props.shouldShowComposeInput) && (
                    <View style={[this.setChatFooterStyles(), this.props.isComposerFullSize && styles.chatFooterFullCompose]}>
                        <SwipeableView onSwipeDown={Keyboard.dismiss}>
                            <OfflineWithFeedback
                                pendingAction={this.props.addWorkspaceRoomPendingAction}
                            >
                                <ReportActionCompose
                                    onSubmit={this.props.onSubmit}
                                    reportID={this.props.report.reportID.toString()}
                                    reportActions={this.props.reportActions}
                                    report={this.props.report}
                                    isComposerFullSize={this.props.isComposerFullSize}
                                />
                            </OfflineWithFeedback>
                        </SwipeableView>
                    </View>
                )}
            </>
        );
    }
}

ReportFooter.propTypes = propTypes;
ReportFooter.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        shouldShowComposeInput: {
            key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
        },
    }),
)(ReportFooter);
