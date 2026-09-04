import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {
    getChatRoomSubtitle,
    getPolicyName,
    isDefaultRoom,
    isExpenseReport,
    isGroupChat,
    isInvoiceRoom,
    isPolicyExpenseChat,
    isThread,
    isUserCreatedPolicyRoom,
    isWorkspaceChat,
    shouldDisableRename as shouldDisableRenameUtil,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';

import {clearPolicyRoomNameErrors} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {CaseID} from './types';

import {CASES} from './types';
import useReportDetailsReportName from './useReportDetailsReportName';

type ReportDetailsNameSectionProps = {
    report: Report;
    policy: OnyxEntry<Policy>;
    parentReport: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
    caseID: CaseID;
};

/** Name row (and workspace row for rooms) shown for chats, rooms, threads and tasks */
function ReportDetailsNameSection({report, policy, parentReport, parentReportAction, caseID}: ReportDetailsNameSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const {reportName} = useReportDetailsReportName(report, parentReport, parentReportAction);

    const isGroupChatReport = isGroupChat(report);
    const isThreadReport = isThread(report);
    const isWorkspaceChatReport = isWorkspaceChat(report?.chatType ?? '');
    const shouldDisableRename = shouldDisableRenameUtil(report, isReportArchived);
    const chatRoomSubtitle = getChatRoomSubtitle(report, policy, conciergeReportID, translate, false, isReportArchived) ?? '';
    const additionalRoomDetails = isExpenseReport(report) || isPolicyExpenseChat(report) || isInvoiceRoom(report) ? chatRoomSubtitle : `${translate('threads.in')} ${chatRoomSubtitle}`;

    let roomDescription: string;
    if (caseID === CASES.MONEY_REQUEST) {
        roomDescription = translate('common.name');
    } else if (isGroupChatReport) {
        roomDescription = translate('newRoomPage.groupName');
    } else {
        roomDescription = translate('newRoomPage.roomName');
    }

    const shouldDisplayGroupWorkspaceAsPushRow = !isThreadReport && (isGroupChatReport || isUserCreatedPolicyRoom(report) || isDefaultRoom(report));

    return (
        <OfflineWithFeedback
            pendingAction={report?.pendingFields?.reportName}
            errors={report?.errorFields?.reportName ?? null}
            errorRowStyles={[styles.ph5]}
            onClose={() => clearPolicyRoomNameErrors(report?.reportID)}
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
                    furtherDetails={chatRoomSubtitle && !isGroupChatReport && !shouldDisplayGroupWorkspaceAsPushRow ? additionalRoomDetails : ''}
                    furtherDetailsNumberOfLines={isWorkspaceChatReport ? 0 : undefined}
                    furtherDetailsStyle={isWorkspaceChatReport ? [styles.textAlignCenter, styles.breakWord] : undefined}
                    onPress={() => {
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_SETTINGS_NAME.path));
                    }}
                    numberOfLinesTitle={isThreadReport ? 2 : 0}
                    shouldBreakWord
                />
                {shouldDisplayGroupWorkspaceAsPushRow && !isGroupChatReport && (
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

export default ReportDetailsNameSection;
