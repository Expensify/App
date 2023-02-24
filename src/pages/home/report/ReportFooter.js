import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View, Keyboard} from 'react-native';

import CONST from '../../../CONST';
import ReportActionCompose from './ReportActionCompose';
import * as ReportUtils from '../../../libs/ReportUtils';
import SwipeableView from '../../../components/SwipeableView';
import OfflineIndicator from '../../../components/OfflineIndicator';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import ArchivedReportFooter from '../../../components/ArchivedReportFooter';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles from '../../../styles/styles';
import reportActionPropTypes from './reportActionPropTypes';
import reportPropTypes from '../../reportPropTypes';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    /** Report actions for the current report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Offline status */
    isOffline: PropTypes.bool.isRequired,

    /** Callback fired when the comment is submitted */
    onSubmitComment: PropTypes.func,

    /** Any errors associated with an attempt to create a chat */
    // eslint-disable-next-line react/forbid-prop-types
    errors: PropTypes.object,

    /** The pending action when we are adding a chat */
    pendingAction: PropTypes.string,

    /** Whether the composer input should be shown */
    shouldShowComposeInput: PropTypes.bool,

    /** Whether user interactions should be disabled */
    shouldDisableCompose: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: {reportID: '0'},
    reportActions: {},
    onSubmitComment: () => {},
    errors: {},
    pendingAction: null,
    shouldShowComposeInput: true,
    shouldDisableCompose: false,
};

class ReportFooter extends React.Component {
    /**
     * @returns {Object}
     */
    getChatFooterStyles() {
        return {...styles.chatFooter, minHeight: !this.props.isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    }

    render() {
        const isArchivedRoom = ReportUtils.isArchivedRoom(this.props.report);
        let reportClosedAction;
        if (isArchivedRoom) {
            reportClosedAction = ReportActionsUtils.getLastClosedReportAction(this.props.reportActions);
        }
        const hideComposer = isArchivedRoom || !_.isEmpty(this.props.errors);
        return (
            <>
                {(isArchivedRoom || hideComposer) && (
                    <View style={[styles.chatFooter, this.props.isSmallScreenWidth ? styles.mb5 : null]}>
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
                    <View style={[this.getChatFooterStyles(), this.props.isComposerFullSize && styles.chatFooterFullCompose]}>
                        <SwipeableView onSwipeDown={Keyboard.dismiss}>
                            <OfflineWithFeedback
                                pendingAction={this.props.pendingAction}
                                style={this.props.isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                                contentContainerStyle={this.props.isComposerFullSize ? styles.flex1 : {}}
                            >
                                <ReportActionCompose
                                    onSubmit={this.props.onSubmitComment}
                                    reportID={this.props.report.reportID.toString()}
                                    reportActions={this.props.reportActions}
                                    report={this.props.report}
                                    isComposerFullSize={this.props.isComposerFullSize}
                                    disabled={this.props.shouldDisableCompose}
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
        shouldShowComposeInput: {key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT},
    }),
)(ReportFooter);
