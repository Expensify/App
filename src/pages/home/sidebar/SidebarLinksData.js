import {deepEqual} from 'fast-equals';
import lodashGet from 'lodash/get';
import lodashMap from 'lodash/map';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import withCurrentReportID from '@components/withCurrentReportID';
import withNavigationFocus from '@components/withNavigationFocus';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import SidebarUtils from '@libs/SidebarUtils';
import reportPropTypes from '@pages/reportPropTypes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SidebarLinks, {basePropTypes} from './SidebarLinks';

const propTypes = {
    ...basePropTypes,

    /* Onyx Props */
    /** List of reports */
    chatReports: PropTypes.objectOf(reportPropTypes),

    /** All report actions for all reports */

    /** Object of report actions for this report */
    allReportActions: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                error: PropTypes.string,
                message: PropTypes.arrayOf(
                    PropTypes.shape({
                        moderationDecision: PropTypes.shape({
                            decision: PropTypes.string,
                        }),
                    }),
                ),
            }),
        ),
    ),

    /** Whether the reports are loading. When false it means they are ready to be used. */
    isLoadingApp: PropTypes.bool,

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    network: networkPropTypes.isRequired,

    /** The policies which the user has access to */
    // eslint-disable-next-line react/forbid-prop-types
    policies: PropTypes.object,

    /** All of the transaction violations */
    transactionViolations: PropTypes.shape({
        violations: PropTypes.arrayOf(
            PropTypes.shape({
                /** The transaction ID */
                transactionID: PropTypes.number,

                /** The transaction violation type */
                type: PropTypes.string,

                /** The transaction violation message */
                message: PropTypes.string,

                /** The transaction violation data */
                data: PropTypes.shape({
                    /** The transaction violation data field */
                    field: PropTypes.string,

                    /** The transaction violation data value */
                    value: PropTypes.string,
                }),
            }),
        ),
    }),
};

const defaultProps = {
    chatReports: {},
    allReportActions: {},
    isLoadingApp: true,
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    betas: [],
    policies: {},
    transactionViolations: {},
};

function SidebarLinksData({isFocused, allReportActions, betas, chatReports, currentReportID, insets, isLoadingApp, onLinkClick, policies, priorityMode, network, transactionViolations}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const prevPriorityMode = usePrevious(priorityMode);

    const reportIDsRef = useRef(null);
    const isLoading = isLoadingApp;
    const optionListItems = useMemo(() => {
        const reportIDs = SidebarUtils.getOrderedReportIDs(null, chatReports, betas, policies, priorityMode, allReportActions, transactionViolations);

        if (deepEqual(reportIDsRef.current, reportIDs)) {
            return reportIDsRef.current;
        }

        // 1. We need to update existing reports only once while loading because they are updated several times during loading and causes this regression: https://github.com/Expensify/App/issues/24596#issuecomment-1681679531
        // 2. If the user is offline, we need to update the reports unconditionally, since the loading of report data might be stuck in this case.
        // 3. Changing priority mode to Most Recent will call OpenApp. If there is an existing reports and the priority mode is updated, we want to immediately update the list instead of waiting the OpenApp request to complete
        if (!isLoading || !reportIDsRef.current || network.isOffline || (reportIDsRef.current && prevPriorityMode !== priorityMode)) {
            reportIDsRef.current = reportIDs;
        }
        return reportIDsRef.current || [];
    }, [allReportActions, betas, chatReports, policies, prevPriorityMode, priorityMode, isLoading, network.isOffline, transactionViolations]);

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then here we check if
    // the current report is missing from the list, which should very rarely happen. In this
    // case we re-generate the list a 2nd time with the current report included.
    const optionListItemsWithCurrentReport = useMemo(() => {
        if (currentReportID && !_.contains(optionListItems, currentReportID)) {
            return SidebarUtils.getOrderedReportIDs(currentReportID, chatReports, betas, policies, priorityMode, allReportActions, transactionViolations);
        }
        return optionListItems;
    }, [currentReportID, optionListItems, chatReports, betas, policies, priorityMode, allReportActions, transactionViolations]);

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID) => currentReportIDRef.current === reportID, []);

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
                priorityMode={priorityMode}
                // Data props:
                isActiveReport={isActiveReport}
                isLoading={isLoading}
                optionListItems={optionListItemsWithCurrentReport}
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
        participantAccountIDs: report.participantAccountIDs,
        hasDraft: report.hasDraft,
        isPinned: report.isPinned,
        isHidden: report.isHidden,
        errorFields: {
            addWorkspaceRoom: report.errorFields && report.errorFields.addWorkspaceRoom,
        },
        lastMessageText: report.lastMessageText,
        lastVisibleActionCreated: report.lastVisibleActionCreated,
        iouReportID: report.iouReportID,
        total: report.total,
        nonReimbursableTotal: report.nonReimbursableTotal,
        hasOutstandingChildRequest: report.hasOutstandingChildRequest,
        isWaitingOnBankAccount: report.isWaitingOnBankAccount,
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
        isDeletedParentAction: report.isDeletedParentAction,
    };

/**
 * @param {Object} [reportActions]
 * @returns {Object|undefined}
 */
const reportActionsSelector = (reportActions) =>
    reportActions &&
    lodashMap(reportActions, (reportAction) => {
        const {reportActionID, parentReportActionID, actionName, errors = []} = reportAction;
        const decision = lodashGet(reportAction, 'message[0].moderationDecision.decision');

        return {
            reportActionID,
            parentReportActionID,
            actionName,
            errors,
            message: [
                {
                    moderationDecision: {decision},
                },
            ],
        };
    });

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
    withNetwork(),
    withOnyx({
        chatReports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: chatReportSelector,
            initialValue: {},
        },
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
            initialValue: CONST.PRIORITY_MODE.DEFAULT,
        },
        betas: {
            key: ONYXKEYS.BETAS,
            initialValue: [],
        },
        allReportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            selector: reportActionsSelector,
            initialValue: {},
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
            initialValue: {},
        },
        transactionViolations: {
            key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
            initialValue: {},
        },
    }),
)(SidebarLinksData);
