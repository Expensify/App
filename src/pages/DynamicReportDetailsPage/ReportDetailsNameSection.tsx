import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {
    getChatRoomSubtitle,
    getPolicyName,
    isDefaultRoom as isDefaultRoomUtil,
    isExpenseReport as isExpenseReportUtil,
    isGroupChat as isGroupChatUtil,
    isInvoiceRoom as isInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isPolicyExpenseChat as isPolicyExpenseChatUtil,
    isThread as isThreadUtil,
    isTrackExpenseReportNew as isTrackExpenseReportUtil,
    isUserCreatedPolicyRoom as isUserCreatedPolicyRoomUtil,
    isWorkspaceChat as isWorkspaceChatUtil,
    shouldDisableRename as shouldDisableRenameUtil,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';

import {clearPolicyRoomNameErrors} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import getReportDetailsCaseID from './getReportDetailsCaseID';
import {CASES} from './types';
import useReportDetailsReportName from './useReportDetailsReportName';

type ReportDetailsNameSectionProps = {
    reportID: string;
};

type ReportDetailsNameSectionContentProps = {
    report: Report;
};

function ReportDetailsNameSectionContent({report}: ReportDetailsNameSectionContentProps) {
    const reportID = report.reportID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const parentReportAction = useParentReportAction(report);
    const isReportArchived = useReportIsArchived(reportID);
    const {reportName} = useReportDetailsReportName(report, parentReport, parentReportAction);

    const isGroupChat = isGroupChatUtil(report);
    const isThread = isThreadUtil(report);
    const isWorkspaceChat = isWorkspaceChatUtil(report.chatType ?? '');
    const shouldDisableRename = shouldDisableRenameUtil(report, isReportArchived, policy);
    const chatRoomSubtitle = getChatRoomSubtitle(report, policy, conciergeReportID, translate, rules, false, isReportArchived) ?? '';
    const additionalRoomDetails =
        isExpenseReportUtil(report) || isPolicyExpenseChatUtil(report) || isInvoiceRoomUtil(report) ? chatRoomSubtitle : `${translate('threads.in')} ${chatRoomSubtitle}`;
    const caseID = getReportDetailsCaseID({
        isMoneyRequestReport: isMoneyRequestReportUtil(report),
        isInvoiceReport: isInvoiceReportUtil(report),
        isMoneyRequest: isMoneyRequestUtil(report),
        isTrackExpenseReport: isTrackExpenseReportUtil(report, parentReport, parentReportAction),
    });

    let roomDescription: string | undefined;
    if (caseID === CASES.MONEY_REQUEST) {
        roomDescription = translate('common.name');
    } else if (isGroupChat) {
        roomDescription = translate('newRoomPage.groupName');
    } else {
        roomDescription = translate('newRoomPage.roomName');
    }

    const shouldDisplayGroupWorkspaceAsPushRow = !isThread && (isGroupChat || isUserCreatedPolicyRoomUtil(report) || isDefaultRoomUtil(report));

    return (
        <OfflineWithFeedback
            pendingAction={report.pendingFields?.reportName}
            errors={report.errorFields?.reportName ?? null}
            errorRowStyles={[styles.ph5]}
            onClose={() => clearPolicyRoomNameErrors(report.reportID)}
        >
            <View style={[styles.flex1, !shouldDisableRename && styles.mt3]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!shouldDisableRename}
                    interactive={!shouldDisableRename}
                    title={StringUtils.lineBreaksToSpaces(reportName)}
                    titleStyle={[styles.newKansasLarge, !shouldDisplayGroupWorkspaceAsPushRow && styles.textAlignCenter]}
                    titleContainerStyle={!shouldDisplayGroupWorkspaceAsPushRow && styles.alignItemsCenter}
                    shouldCheckActionAllowedOnPress={false}
                    description={shouldDisplayGroupWorkspaceAsPushRow ? roomDescription : ''}
                    furtherDetails={chatRoomSubtitle && !isGroupChat && !shouldDisplayGroupWorkspaceAsPushRow ? additionalRoomDetails : ''}
                    furtherDetailsNumberOfLines={isWorkspaceChat ? 0 : undefined}
                    furtherDetailsStyle={isWorkspaceChat ? [styles.textAlignCenter, styles.breakWord] : undefined}
                    onPress={() => {
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_SETTINGS_NAME.path));
                    }}
                    numberOfLinesTitle={isThread ? 2 : 0}
                    shouldBreakWord
                />
                {shouldDisplayGroupWorkspaceAsPushRow && !isGroupChat && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon={false}
                        interactive={false}
                        description={translate('workspace.common.workspace')}
                        title={getPolicyName({report, unavailableTranslation: translate('workspace.common.unavailable')})}
                        numberOfLinesTitle={2}
                        shouldBreakWord
                    />
                )}
            </View>
        </OfflineWithFeedback>
    );
}

/** Name row, plus the workspace row for rooms, rendered for every report that is not an expense, invoice or money request report */
function ReportDetailsNameSection({reportID}: ReportDetailsNameSectionProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    if (!report?.reportID) {
        return null;
    }

    return <ReportDetailsNameSectionContent report={report} />;
}

export default ReportDetailsNameSection;
