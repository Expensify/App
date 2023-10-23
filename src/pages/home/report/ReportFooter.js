import React, {memo, useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Onyx from 'react-native-onyx';
import {View, Keyboard} from 'react-native';
import {isEqual} from 'underscore';
import CONST from '../../../CONST';
import ReportActionCompose from './ReportActionCompose/ReportActionCompose';
import AnonymousReportFooter from '../../../components/AnonymousReportFooter';
import SwipeableView from '../../../components/SwipeableView';
import OfflineIndicator from '../../../components/OfflineIndicator';
import ArchivedReportFooter from '../../../components/ArchivedReportFooter';
import ONYXKEYS from '../../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import useNetwork from '../../../hooks/useNetwork';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import reportActionPropTypes from './reportActionPropTypes';
import reportPropTypes from '../../reportPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as Session from '../../../libs/actions/Session';
import participantPropTypes from '../../../components/participantPropTypes';
import * as Report from '../../../libs/actions/Report';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    lastReportAction: PropTypes.shape(reportActionPropTypes),

    isEmptyChat: PropTypes.bool,

    /** The pending action when we are adding a chat */
    pendingAction: PropTypes.string,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Whether user interactions should be disabled */
    shouldDisableCompose: PropTypes.bool,

    /** Height of the list which the composer is part of */
    listHeight: PropTypes.number,

    /** Whetjer the report is ready for display */
    isReportReadyForDisplay: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: {reportID: '0'},
    pendingAction: null,
    personalDetails: {},
    shouldDisableCompose: false,
    listHeight: 0,
    isReportReadyForDisplay: true,
    lastReportAction: null,
    isEmptyChat: true,
};

function ReportFooter(props) {
    const {isOffline} = useNetwork();
    const chatFooterStyles = {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    const isArchivedRoom = ReportUtils.isArchivedRoom(props.report);
    const isAnonymousUser = Session.isAnonymousUser();

    const isSmallSizeLayout = props.windowWidth - (props.isSmallScreenWidth ? 0 : variables.sideBarWidth) < variables.anonymousReportFooterBreakpoint;
    const hideComposer = ReportUtils.shouldDisableWriteActions(props.report);

    const [shouldShowComposeInput, setShouldShowComposeInput] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
        const connID = Onyx.connect({
            key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
            callback: (val) => {
                if (val === shouldShowComposeInput) {
                    return;
                }
                setShouldShowComposeInput(val);
            },
        });

        return () => {
            Onyx.disconnect(connID);
        };
    }, [shouldShowComposeInput]);

    const onSubmitComment = useCallback(
        (text) => {
            Report.addComment(props.reportID, text);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <>
            {hideComposer && (
                <View style={[styles.chatFooter, isArchivedRoom || isAnonymousUser ? styles.mt4 : {}, props.isSmallScreenWidth ? styles.mb5 : null]}>
                    {isAnonymousUser && !isArchivedRoom && (
                        <AnonymousReportFooter
                            report={props.report}
                            isSmallSizeLayout={isSmallSizeLayout}
                            personalDetails={props.personalDetails}
                        />
                    )}
                    {isArchivedRoom && <ArchivedReportFooter report={props.report} />}
                    {!props.isSmallScreenWidth && (
                        <View style={styles.offlineIndicatorRow}>{hideComposer && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}</View>
                    )}
                </View>
            )}
            {!hideComposer && (shouldShowComposeInput || !props.isSmallScreenWidth) && (
                <View style={[chatFooterStyles, props.isComposerFullSize && styles.chatFooterFullCompose]}>
                    <SwipeableView onSwipeDown={Keyboard.dismiss}>
                        <ReportActionCompose
                            onSubmit={onSubmitComment}
                            reportID={props.reportID}
                            isEmptyChat={props.isEmptyChat}
                            lastReportAction={props.lastReportAction}
                            pendingAction={props.pendingAction}
                            isComposerFullSize={props.isComposerFullSize}
                            disabled={props.shouldDisableCompose}
                            listHeight={props.listHeight}
                            isReportReadyForDisplay={props.isReportReadyForDisplay}
                        />
                    </SwipeableView>
                </View>
            )}
        </>
    );
}

ReportFooter.displayName = 'ReportFooter';
ReportFooter.propTypes = propTypes;
ReportFooter.defaultProps = defaultProps;

export default withWindowDimensions(
    memo(
        ReportFooter,
        (prevProps, nextProps) =>
            isEqual(prevProps.report, nextProps.report) &&
            isEqual(prevProps.reportActions, nextProps.reportActions) &&
            isEqual(prevProps.personalDetails, nextProps.personalDetails) &&
            prevProps.pendingAction === nextProps.pendingAction &&
            prevProps.shouldDisableCompose === nextProps.shouldDisableCompose &&
            prevProps.listHeight === nextProps.listHeight &&
            prevProps.isReportReadyForDisplay === nextProps.isReportReadyForDisplay,
    ),
);
