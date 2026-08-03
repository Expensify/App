import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {shouldExcludeAncestorReportAction} from '@libs/ReportUtils';

import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportNameValuePairs, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {conciergePersonalDetailSelector, personalDetailsSelector} from '@selectors/PersonalDetails';
import React from 'react';
import {View} from 'react-native';

import AncestorReportActionItem from './AncestorReportActionItem';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import RepliesDivider from './RepliesDivider';

type ReportActionItemParentActionProps = {
    /** All the data of the action item */
    action: ReportAction;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** The id of the report */

    reportID: string;

    /** The current report is displayed */
    report: OnyxEntry<Report>;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<Report>;

    /** Report actions belonging to the report's parent */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Whether we should display "Replies" divider */
    shouldDisplayReplyDivider: boolean;

    /** If this is the first visible report action */
    isFirstVisibleReportAction: boolean;

    /** If the thread divider line will be used */
    shouldUseThreadDividerLine?: boolean;
};

function ReportActionItemParentAction({
    report,
    action,
    transactionThreadReport,
    parentReportAction,
    shouldHideThreadDividerLine = false,
    shouldDisplayReplyDivider,
    isFirstVisibleReportAction = false,
    shouldUseThreadDividerLine = false,
}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const ancestors = useAncestors(report, shouldExcludeAncestorReportAction);
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const isReportArchived = useReportIsArchived(report?.reportID);

    const currentUserPersonalDetail = useCurrentUserPersonalDetails();
    const {accountID: currentUserAccountID} = currentUserPersonalDetail;
    const [conciergePersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: conciergePersonalDetailSelector});
    const [reportOwnerPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(report?.ownerAccountID)});

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        selector: (transaction: OnyxEntry<Transaction>) => {
            return transaction?.errorFields?.route;
        },
    });

    const [ancestorsReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        selector: (allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>) => {
            if (!allReportNameValuePairs) {
                return {};
            }
            const ancestorReportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
            for (const ancestor of ancestors) {
                ancestorReportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${ancestor.report.reportID}`] =
                    allReportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${ancestor.report.reportID}`];
            }
            return ancestorReportNameValuePairs;
        },
    });

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const onCloseParentReportActionItem = () => {
        navigateToConciergeChatAndDeleteReport(
            report?.reportID,
            conciergeReportID,
            currentUserAccountID,
            introSelected,
            isSelfTourViewed,
            allBetas,
            reportOwnerPersonalDetail,
            currentUserPersonalDetail,
            conciergePersonalDetail,
            undefined,
            true,
        );
    };

    return (
        <View style={[styles.pRelative]}>
            <AnimatedEmptyStateBackground />
            <OfflineWithFeedback
                shouldDisableOpacity
                errors={
                    report?.errorFields?.createChatThread ?? (report?.errorFields?.createChat ? getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage') : null)
                }
                errorRowStyles={[styles.ml10, styles.mr2]}
                onClose={onCloseParentReportActionItem}
            >
                {ancestors.map(({report: ancestorReport, reportAction: ancestorReportAction, shouldDisplayNewMarker}) => (
                    <AncestorReportActionItem
                        key={ancestorReportAction.reportActionID}
                        report={ancestorReport}
                        reportAction={ancestorReportAction}
                        shouldDisplayNewMarker={shouldDisplayNewMarker}
                        reportNameValuePairs={ancestorsReportNameValuePairs}
                        allBetas={allBetas}
                        conciergePersonalDetail={conciergePersonalDetail}
                        conciergeReportID={conciergeReportID}
                        currentUserAccountID={currentUserAccountID}
                        introSelected={introSelected}
                        isReportArchived={isReportArchived}
                        isSelfTourViewed={isSelfTourViewed}
                        parentReportAction={parentReportAction}
                        transactionThreadReport={transactionThreadReport}
                        isFirstVisibleReportAction={isFirstVisibleReportAction}
                        shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                        linkedTransactionRouteError={linkedTransactionRouteError}
                    />
                ))}
            </OfflineWithFeedback>
            {shouldDisplayReplyDivider && <RepliesDivider shouldHideThreadDividerLine={shouldHideThreadDividerLine} />}
        </View>
    );
}

export default ReportActionItemParentAction;
