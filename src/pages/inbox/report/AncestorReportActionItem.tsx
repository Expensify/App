import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useOpenAncestorReport from '@hooks/useOpenAncestorReport';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isArchivedReport} from '@libs/ReportUtils';

import type {ReportHierarchyInfo} from '@userActions/ClearReportActionErrors';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {getStableReportSelector} from '@src/selectors/Report';
import {getLatestFeedbackActionIDByAuthorSelector} from '@src/selectors/ReportAction';
import type {IntroSelected, PersonalDetails, Report, ReportAction, ReportNameValuePairs} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import React from 'react';

import ReportActionItem from './ReportActionItem';

type AncestorReportActionItemProps = {
    /** Report for this action */
    report: Report;

    reportAction: ReportAction;

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: boolean;

    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

    conciergePersonalDetail: OnyxEntry<PersonalDetails>;
    conciergeReportID: string | undefined;
    currentUserAccountID: number;

    /** Model of onboarding */
    introSelected: OnyxEntry<IntroSelected>;

    isFirstVisibleReportAction: boolean;
    isReportArchived: boolean;

    /** Whether the user has viewed the self-guided tour */
    isSelfTourViewed: boolean | undefined;

    /** Whether the user has completed the guided setup (onboarding) flow */
    hasCompletedGuidedSetupFlow: boolean | undefined;

    linkedTransactionRouteError: Errors | undefined;
    parentReportAction: OnyxEntry<ReportAction>;
    shouldUseThreadDividerLine: boolean;
    transactionThreadReport: OnyxEntry<Report>;

    /** Parent links of the thread and its ancestors, used to clear related errors on dismiss */
    reportsParentHierarchy: OnyxCollection<ReportHierarchyInfo>;

    /** Shown above the message, such as the divider between the message and the thread */
    children?: React.ReactNode;
};

function AncestorReportActionItem({
    report,
    reportAction,
    shouldDisplayNewMarker,
    reportNameValuePairs,
    conciergePersonalDetail,
    conciergeReportID,
    currentUserAccountID,
    introSelected,
    isFirstVisibleReportAction,
    isReportArchived,
    isSelfTourViewed,
    hasCompletedGuidedSetupFlow,
    linkedTransactionRouteError,
    parentReportAction,
    shouldUseThreadDividerLine,
    transactionThreadReport,
    reportsParentHierarchy,
    children,
}: AncestorReportActionItemProps) {
    const styles = useThemeStyles();
    const currentUserPersonalDetail = useCurrentUserPersonalDetails();
    const [reportOwnerPersonalDetail] = usePersonalDetail(report?.ownerAccountID);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {selector: getStableReportSelector});

    const ancestorReportNameValuePairs = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
    const isConciergeFeedbackThread = !!ancestorReportNameValuePairs?.conciergeFeedbackForReportActionID;
    const authorAccountID = reportAction.actorAccountID;
    const [isAuthorCustomAgent = false] = usePersonalDetail(authorAccountID, (personalDetail) => !!personalDetail?.isCustomAgent);

    // An agent account can be opened through Copilot, and the agent must not rate its own replies
    const canAuthorCollectFeedback = !isConciergeFeedbackThread && (authorAccountID === CONST.ACCOUNT_ID.CONCIERGE || (isAuthorCustomAgent && authorAccountID !== currentUserAccountID));

    // The message shown above a thread belongs to the parent report, so its own actions decide whether it is the author's newest answer.
    // The viewed thread's feedback marker is deliberately left out of that decision: the marker outlives the reaction, so consulting it would keep the prompt
    // away here after the user takes their thumbs down back, while the same message offers it again in the chat.
    const [latestConciergeFeedbackActionID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.reportID)}`, {
        selector: getLatestFeedbackActionIDByAuthorSelector(canAuthorCollectFeedback ? authorAccountID : undefined),
    });

    const {canOpenAncestorReport, openAncestorReport} = useOpenAncestorReport(report, reportAction, shouldDisplayNewMarker, isArchivedReport(ancestorReportNameValuePairs));

    const deleteAncestorReportAndNavigateToConcierge = () => {
        navigateToConciergeChatAndDeleteReport(
            report?.reportID,
            conciergeReportID,
            currentUserAccountID,
            introSelected,
            isSelfTourViewed,
            hasCompletedGuidedSetupFlow,
            reportOwnerPersonalDetail,
            currentUserPersonalDetail,
            conciergePersonalDetail,
        );
    };

    return (
        <OfflineWithFeedback
            shouldDisableOpacity={!!reportAction?.pendingAction}
            pendingAction={report?.pendingFields?.addWorkspaceRoom ?? report?.pendingFields?.createChat}
            errors={report?.errorFields?.addWorkspaceRoom ?? report?.errorFields?.createChat}
            errorRowStyles={styles.ml10}
            onClose={deleteAncestorReportAndNavigateToConcierge}
        >
            {children}
            <ReportActionItem
                report={report}
                action={reportAction}
                onPress={canOpenAncestorReport ? () => openAncestorReport(isReportArchived) : undefined}
                parentReportAction={parentReportAction}
                transactionThreadReport={transactionThreadReport}
                chatReport={chatReport}
                displayAsGroup={false}
                shouldDisplayNewMarker={shouldDisplayNewMarker}
                isFirstVisibleReportAction={isFirstVisibleReportAction}
                shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                isThreadReportParentAction
                isLatestConciergeFeedbackAction={!!latestConciergeFeedbackActionID && latestConciergeFeedbackActionID === reportAction.reportActionID}
                linkedTransactionRouteError={linkedTransactionRouteError}
                reportsParentHierarchy={reportsParentHierarchy}
            />
        </OfflineWithFeedback>
    );
}

export default AncestorReportActionItem;
