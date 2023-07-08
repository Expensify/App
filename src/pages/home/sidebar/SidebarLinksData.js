import React, {useMemo, useRef} from 'react';
import _ from 'underscore';
import {deepEqual} from 'fast-equals';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import SidebarUtils from '../../../libs/SidebarUtils';
import SidebarLinks, {basePropTypes} from './SidebarLinks';
import withCurrentReportID from '../../../components/withCurrentReportID';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import reportPropTypes from '../../reportPropTypes';
import participantPropTypes from '../../../components/participantPropTypes';
import CONST from '../../../CONST';
import * as UserUtils from '../../../libs/UserUtils';

const propTypes = {
    ...basePropTypes,

    /* Onyx Props */
    /** List of reports */
    chatReports: PropTypes.objectOf(reportPropTypes),

    // TODO: i think this can be removed?
    /** All report actions for all reports */
    reportActions: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                error: PropTypes.string,
                message: PropTypes.arrayOf(
                    PropTypes.shape({
                        moderationDecisions: PropTypes.arrayOf(
                            PropTypes.shape({
                                decision: PropTypes.string,
                            }),
                        ),
                    }),
                ),
            }),
        ),
    ),

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    betas: PropTypes.arrayOf(PropTypes.string),
    policies: PropTypes.shape({}),

    // TODO: this can maybe be removed
    preferredLocale: PropTypes.string,
};

const defaultProps = {
    chatReports: {},
    reportActions: {},
    personalDetails: {},
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    betas: [],
    policies: [],
    preferredLocale: CONST.DEFAULT_LOCALE,
};

function SidebarLinksData(props) {
    const prevReportIDs = useRef([]);
    const optionListItems = useMemo(() => {
        const reportIDs = SidebarUtils.getOrderedReportIDs(props.currentReportID, props.chatReports, props.betas, props.policies, props.priorityMode);
        if (deepEqual(prevReportIDs.current, reportIDs)) {
            return prevReportIDs.current;
        }
        prevReportIDs.current = reportIDs;
        return reportIDs;
    }, [props.betas, props.chatReports, props.currentReportID, props.policies, props.priorityMode]);

    const isLoading = _.isEmpty(props.personalDetails) || _.isEmpty(props.chatReports);

    console.count('HannoDebug render SidebarLinksData');
    return (
        <SidebarLinks
            // Forwarded props:
            onLinkClick={props.onLinkClick}
            insets={props.insets}
            isSmallScreenWidth={props.isSmallScreenWidth}
            onLayout={props.onLayout}
            priorityMode={props.priorityMode}
            // Data props:
            isLoading={isLoading}
            optionListItems={optionListItems}
        />
    );
}

SidebarLinksData.propTypes = propTypes;
SidebarLinksData.defaultProps = defaultProps;
SidebarLinksData.displayName = 'SidebarLinksData';

/**
 * This function (and the few below it), narrow down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 * @param {Object} [report]
 * @returns {Object|undefined}
 */
const chatReportSelector = (report) =>
    report && {
        reportID: report.reportID,
        participants: report.participants,
        participantAccountIDs: report.participantAccountIDs,
        hasDraft: report.hasDraft,
        isPinned: report.isPinned,
        errorFields: {
            addWorkspaceRoom: report.errorFields && report.errorFields.addWorkspaceRoom,
        },
        lastMessageText: report.lastMessageText,
        lastVisibleActionCreated: report.lastVisibleActionCreated,
        iouReportID: report.iouReportID,
        hasOutstandingIOU: report.hasOutstandingIOU,
        statusNum: report.statusNum,
        stateNum: report.stateNum,
        chatType: report.chatType,
        type: report.type,
        policyID: report.policyID,
        reportName: report.reportName,
        visibility: report.visibility,
        lastReadTime: report.lastReadTime,
    };

/**
 * @param {Object} [personalDetails]
 * @returns {Object|undefined}
 */
const personalDetailsSelector = (personalDetails) =>
    _.reduce(
        personalDetails,
        (finalPersonalDetails, personalData, accountID) => {
            // It's OK to do param-reassignment in _.reduce() because we absolutely know the starting state of finalPersonalDetails
            // eslint-disable-next-line no-param-reassign
            finalPersonalDetails[accountID] = {
                accountID: Number(accountID),
                login: personalData.login,
                displayName: personalData.displayName,
                firstName: personalData.firstName,
                avatar: UserUtils.getAvatar(personalData.avatar, personalData.accountID),
            };
            return finalPersonalDetails;
        },
        {},
    );

/**
 * @param {Object} [reportActions]
 * @returns {Object|undefined}
 */
const reportActionsSelector = (reportActions) =>
    reportActions &&
    _.map(reportActions, (reportAction) => ({
        errors: reportAction.errors,
        message: [
            {
                moderationDecisions: [{decision: lodashGet(reportAction, 'message[0].moderationDecisions[0].decision')}],
            },
        ],
    }));

/**
 * @param {Object} [policy]
 * @returns {Object|undefined}
 */
const policySelector = (policy) =>
    policy && {
        type: policy.type,
        name: policy.name,
        avatar: policy.avatar,
    };

export default compose(
    withCurrentReportID,
    withOnyx({
        // Note: It is very important that the keys subscribed to here are the same
        // keys that are subscribed to at the top of SidebarUtils.js. If there was a key missing from here and data was updated
        // for that key, then there would be no re-render and the options wouldn't reflect the new data because SidebarUtils.getOrderedReportIDs() wouldn't be triggered.
        // This could be changed if each OptionRowLHN used withOnyx() to connect to the Onyx keys, but if you had 10,000 reports
        // with 10,000 withOnyx() connections, it would have unknown performance implications.
        chatReports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: chatReportSelector,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            selector: personalDetailsSelector,
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        reportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            selector: reportActionsSelector,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
        },
        // TODO: why do we need this?
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(SidebarLinksData);
