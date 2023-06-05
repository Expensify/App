import React, {useMemo, useCallback} from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View, Keyboard} from 'react-native';
import CONST from '../../../CONST';
import ReportActionCompose from './ReportActionCompose';
import AnonymousReportFooter from '../../../components/AnonymousReportFooter';
import SwipeableView from '../../../components/SwipeableView';
import OfflineIndicator from '../../../components/OfflineIndicator';
import ArchivedReportFooter from '../../../components/ArchivedReportFooter';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles from '../../../styles/styles';
import reportActionPropTypes from './reportActionPropTypes';
import reportPropTypes from '../../reportPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as Session from '../../../libs/actions/Session';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    /** Report actions for the current report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

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
    reportActions: [],
    onSubmitComment: () => {},
    errors: {},
    pendingAction: null,
    shouldShowComposeInput: true,
    shouldDisableCompose: false,
};

const ReportFooter = ({report, reportActions, isOffline, onSubmitComment, errors, pendingAction, shouldShowComposeInput, shouldDisableCompose, isSmallScreenWidth, isComposerFullSize}) => {
    /**
     * @returns {Object}
     */
    const getChatFooterStyles = useCallback(
        () => ({
            ...styles.chatFooter,
            minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0,
        }),
        [isOffline],
    );

    const isArchivedRoom = useMemo(() => ReportUtils.isArchivedRoom(report), [report]);
    const isAllowedToComment = useMemo(() => ReportUtils.isAllowedToComment(report), [report]);
    const hideComposer = useMemo(() => isArchivedRoom || !_.isEmpty(errors) || !isAllowedToComment, [isArchivedRoom, errors, isAllowedToComment]);

    return (
        <>
            {(isArchivedRoom || hideComposer) && (
                <View style={[styles.chatFooter, isSmallScreenWidth ? styles.mb5 : null]}>
                    {isArchivedRoom && <ArchivedReportFooter report={report} />}
                    {!isSmallScreenWidth && <View style={styles.offlineIndicatorRow}>{hideComposer && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}</View>}
                </View>
            )}
            {!hideComposer && (shouldShowComposeInput || !isSmallScreenWidth) && (
                <View style={[getChatFooterStyles(), isComposerFullSize && styles.chatFooterFullCompose]}>
                    <SwipeableView onSwipeDown={Keyboard.dismiss}>
                        {Session.isAnonymousUser() ? (
                            <AnonymousReportFooter report={report} />
                        ) : (
                            <ReportActionCompose
                                onSubmit={onSubmitComment}
                                reportID={report.reportID.toString()}
                                reportActions={reportActions}
                                report={report}
                                pendingAction={pendingAction}
                                isComposerFullSize={isComposerFullSize}
                                disabled={shouldDisableCompose}
                            />
                        )}
                    </SwipeableView>
                </View>
            )}
        </>
    );
};

ReportFooter.displayName = 'ReportFooter';
ReportFooter.propTypes = propTypes;
ReportFooter.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withOnyx({
        shouldShowComposeInput: {key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT},
    }),
)(ReportFooter);
