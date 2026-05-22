import {hasSeenTourSelector} from '@selectors/Onboarding';
import {conciergePersonalDetailSelector, personalDetailByAccountIDSelector} from '@selectors/PersonalDetails';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {shouldExcludeAncestorReportAction} from '@libs/ReportUtils';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import AncestorReportActionItem from './AncestorReportActionItem';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import RepliesDivider from './RepliesDivider';

type ReportActionItemParentActionProps = {
    /** All the data of the action item */
    action: ReportAction;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Position index of the report parent action in the overall report FlatList view */
    index: number;

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

    /** User billing fund ID */
    userBillingFundID: number | undefined;

    /** Did the user dismiss trying out NewDot? If true, it means they prefer using OldDot */
    isTryNewDotNVPDismissed: boolean | undefined;

    /** Whether the report is archived */
    isReportArchived: boolean;
};

function ReportActionItemParentAction({
    report,
    action,
    transactionThreadReport,
    parentReportAction,
    index = 0,
    shouldHideThreadDividerLine = false,
    shouldDisplayReplyDivider,
    isFirstVisibleReportAction = false,
    shouldUseThreadDividerLine = false,
    userBillingFundID,
    isTryNewDotNVPDismissed = false,
    isReportArchived = false,
}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const ancestors = useAncestors(report, shouldExcludeAncestorReportAction);
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const currentUserPersonalDetail = useCurrentUserPersonalDetails();
    const {accountID: currentUserAccountID} = currentUserPersonalDetail;
    const [conciergePersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: conciergePersonalDetailSelector});
    const [reportOwnerPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailByAccountIDSelector(report?.ownerAccountID)});

    const getLinkedTransactionRouteError = useCallback((transaction: OnyxEntry<Transaction>) => {
        return transaction?.errorFields?.route;
    }, []);

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector: getLinkedTransactionRouteError});

    const ancestorReportNameValuePairsSelector = useCallback(
        (allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>) => {
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
        [ancestors],
    );

    const [ancestorsReportNameValuePairs] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        {
            selector: ancestorReportNameValuePairsSelector,
        },
        [ancestors],
    );

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
                        index={index}
                        introSelected={introSelected}
                        isReportArchived={isReportArchived}
                        isSelfTourViewed={isSelfTourViewed}
                        parentReportAction={parentReportAction}
                        transactionThreadReport={transactionThreadReport}
                        isFirstVisibleReportAction={isFirstVisibleReportAction}
                        shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                        linkedTransactionRouteError={linkedTransactionRouteError}
                        userBillingFundID={userBillingFundID}
                        isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
                    />
                ))}
            </OfflineWithFeedback>
            {shouldDisplayReplyDivider && <RepliesDivider shouldHideThreadDividerLine={shouldHideThreadDividerLine} />}
        </View>
    );
}

export default ReportActionItemParentAction;
