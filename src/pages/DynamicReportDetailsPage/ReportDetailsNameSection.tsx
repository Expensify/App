import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
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

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';

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
    const shouldDisableRename = shouldDisableRenameUtil(report, isReportArchived);
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
    const title = StringUtils.lineBreaksToSpaces(reportName);
    const furtherDetails = chatRoomSubtitle && !isGroupChat && !shouldDisplayGroupWorkspaceAsPushRow ? additionalRoomDetails : '';
    const titleStyle = [
        styles.flexShrink1,
        styles.popoverMenuText,
        styles.preWrap,
        styles.ltr,
        styles.breakWord,
        styles.mw100,
        styles.newKansasLarge,
        !shouldDisplayGroupWorkspaceAsPushRow && styles.textAlignCenter,
    ];

    return (
        <OfflineWithFeedback
            pendingAction={report.pendingFields?.reportName}
            errors={report.errorFields?.reportName ?? null}
            errorRowStyles={[styles.ph5]}
            onClose={() => clearPolicyRoomNameErrors(report.reportID)}
        >
            <View style={[styles.flex1, !shouldDisableRename && styles.mt3]}>
                <MenuItem.Root
                    onPress={shouldDisableRename ? undefined : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_SETTINGS_NAME.path))}
                    accessibilityLabel={shouldDisplayGroupWorkspaceAsPushRow ? `${roomDescription}, ${title}` : title}
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            {shouldDisplayGroupWorkspaceAsPushRow && <MenuItem.FieldName>{roomDescription}</MenuItem.FieldName>}
                            {/* Extends under the Row gap so a centered title centers against the chevron's edge, not the gap's */}
                            <View
                                style={[
                                    styles.gap1,
                                    !shouldDisplayGroupWorkspaceAsPushRow && styles.alignItemsCenter,
                                    !shouldDisplayGroupWorkspaceAsPushRow && !shouldDisableRename && styles.mrn3,
                                ]}
                            >
                                <Text
                                    style={titleStyle}
                                    numberOfLines={isThread ? 2 : undefined}
                                >
                                    {containsCustomEmoji(title) && !containsOnlyCustomEmoji(title) ? (
                                        <TextWithEmojiFragment
                                            message={convertToLTR(title)}
                                            style={titleStyle}
                                            alignCustomEmoji
                                        />
                                    ) : (
                                        convertToLTR(title)
                                    )}
                                </Text>
                                {!!furtherDetails && (
                                    <Text
                                        style={[styles.textLabelSupporting, isWorkspaceChat && [styles.textAlignCenter, styles.breakWord]]}
                                        numberOfLines={isWorkspaceChat ? 0 : 2}
                                    >
                                        {furtherDetails}
                                    </Text>
                                )}
                            </View>
                        </MenuItem.Content>
                        {!shouldDisableRename && (
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        )}
                    </MenuItem.Row>
                </MenuItem.Root>
                {shouldDisplayGroupWorkspaceAsPushRow && !isGroupChat && (
                    <MenuItemField
                        name={translate('workspace.common.workspace')}
                        value={getPolicyName({report, unavailableTranslation: translate('workspace.common.unavailable')})}
                        numberOfLinesValue={2}
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
