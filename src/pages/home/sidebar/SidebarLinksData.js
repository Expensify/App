import React, {useMemo, useRef} from 'react';
import _ from 'underscore';
import {deepEqual} from 'fast-equals';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import SidebarUtils from '../../../libs/SidebarUtils';
import SidebarLinks, {basePropTypes} from './SidebarLinks';
import withCurrentReportID from '../../../components/withCurrentReportID';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import reportPropTypes from '../../reportPropTypes';
import CONST from '../../../CONST';
import useLocalize from '../../../hooks/useLocalize';
import styles from '../../../styles/styles';
import withNavigationFocus from '../../../components/withNavigationFocus';

const propTypes = {
    ...basePropTypes,

    /* Onyx Props */
    /** List of reports */
    chatReports: PropTypes.objectOf(reportPropTypes),

    /** All report actions for all reports */
    allReportActions: PropTypes.objectOf(
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

    /** Whether the personal details are loading. When false it means they are ready to be used. */
    isPersonalDetailsLoading: PropTypes.bool,

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The policies which the user has access to */
    // eslint-disable-next-line react/forbid-prop-types
    policies: PropTypes.object,
};

const defaultProps = {
    chatReports: {},
    allReportActions: {},
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    isPersonalDetailsLoading: true,
    betas: [],
    policies: [],
};

function SidebarLinksData({isFocused, allReportActions, betas, chatReports, currentReportID, insets, isPersonalDetailsLoading, isSmallScreenWidth, onLinkClick, policies, priorityMode}) {
    const {translate} = useLocalize();

    const reportIDsRef = useRef([]);
    const optionListItems = useMemo(() => {
        const reportIDs = SidebarUtils.getOrderedReportIDs(currentReportID, chatReports, betas, policies, priorityMode, allReportActions);
        if (deepEqual(reportIDsRef.current, reportIDs)) {
            return reportIDsRef.current;
        }
        reportIDsRef.current = reportIDs;
        return reportIDs;
    }, [allReportActions, betas, chatReports, currentReportID, policies, priorityMode]);

    const isLoading = _.isEmpty(chatReports) || isPersonalDetailsLoading;

    return (
        <View
            accessibilityElementsHidden={!isFocused}
            accessibilityLabel={translate('sidebarScreen.listOfChats')}
            style={[styles.flex1, styles.h100]}
        >
            <SidebarLinks
                // Forwarded props:
                onLinkClick={onLinkClick}
                insets={insets}
                isSmallScreenWidth={isSmallScreenWidth}
                priorityMode={priorityMode}
                // Data props:
                isLoading={isLoading}
                optionListItems={optionListItems}
            />
        </View>
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
        total: report.total,
        hasOutstandingIOU: report.hasOutstandingIOU,
        statusNum: report.statusNum,
        stateNum: report.stateNum,
        chatType: report.chatType,
        type: report.type,
        policyID: report.policyID,
        visibility: report.visibility,
        lastReadTime: report.lastReadTime,
        // Needed for name sorting:
        reportName: report.reportName,
        policyName: report.policyName,
        oldPolicyName: report.oldPolicyName,
        // Other less obvious properites considered for sorting:
        ownerAccountID: report.ownerAccountID,
        currency: report.currency,
        managerID: report.managerID,
        // Other important less obivous properties for filtering:
        parentReportActionID: report.parentReportActionID,
        parentReportID: report.parentReportID,
    };

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
    withNavigationFocus,
    withOnyx({
        chatReports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: chatReportSelector,
        },
        isPersonalDetailsLoading: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            selector: _.isEmpty,
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        allReportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            selector: reportActionsSelector,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
        },
    }),
)(SidebarLinksData);
