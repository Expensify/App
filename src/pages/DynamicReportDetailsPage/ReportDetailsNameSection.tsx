import MenuItem from '@components/MenuItem';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
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
    isPolicyExpenseChat as isPolicyExpenseChatUtil,
    isThread as isThreadUtil,
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

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import useReportDetailsReportName from './useReportDetailsReportName';

type ReportDetailsNameSectionProps = {
    reportID: string;
};

type ReportDetailsNameSectionContentProps = {
    report: Report;
};

type ReportNameTextProps = {
    name: string;
    numberOfLines?: number;
    style?: StyleProp<TextStyle>;
};

function ReportNameText({name, numberOfLines, style}: ReportNameTextProps) {
    const styles = useThemeStyles();
    const textStyle = [styles.flexShrink1, styles.popoverMenuText, styles.preWrap, styles.ltr, styles.breakWord, styles.mw100, styles.newKansasLarge, style];
    const message = convertToLTR(name);

    return (
        <Text
            style={textStyle}
            numberOfLines={numberOfLines}
        >
            {containsCustomEmoji(name) && !containsOnlyCustomEmoji(name) ? (
                <TextWithEmojiFragment
                    message={message}
                    style={textStyle}
                    alignCustomEmoji
                />
            ) : (
                message
            )}
        </Text>
    );
}

type CenteredReportNameContentProps = {
    report: Report;

    /** Display name of the report, with line breaks already flattened to spaces */
    name: string;
};

/** The name as a centered header, with the chat it lives in underneath, for threads, workspace chats, trip rooms and other non-room chats */
function CenteredReportNameContent({report, name}: CenteredReportNameContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isInteractive} = useMenuItemConfig();
    const isReportArchived = useReportIsArchived(report.reportID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const isWorkspaceChat = isWorkspaceChatUtil(report.chatType ?? '');
    let subtitle = '';
    if (!isGroupChatUtil(report)) {
        const chatRoomSubtitle = getChatRoomSubtitle(report, policy, conciergeReportID, translate, rules, false, isReportArchived) ?? '';
        const isSubtitleBare = isExpenseReportUtil(report) || isPolicyExpenseChatUtil(report) || isInvoiceRoomUtil(report);
        subtitle = chatRoomSubtitle && (isSubtitleBare ? chatRoomSubtitle : `${translate('threads.in')} ${chatRoomSubtitle}`);
    }

    return (
        <MenuItem.Content>
            {/* An interactive row shows a chevron, so this extends under the Row gap to center the name against the chevron's edge, not the gap's */}
            <View style={[styles.gap1, styles.alignItemsCenter, isInteractive && styles.mrn3]}>
                <ReportNameText
                    name={name}
                    numberOfLines={isThreadUtil(report) ? 2 : undefined}
                    style={styles.textAlignCenter}
                />
                {!!subtitle && (
                    <Text
                        style={[styles.textLabelSupporting, isWorkspaceChat && [styles.textAlignCenter, styles.breakWord]]}
                        numberOfLines={isWorkspaceChat ? 0 : 2}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>
        </MenuItem.Content>
    );
}

function ReportDetailsNameSectionContent({report}: ReportDetailsNameSectionContentProps) {
    const reportID = report.reportID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
    const parentReportAction = useParentReportAction(report);
    const isReportArchived = useReportIsArchived(reportID);
    const {reportName} = useReportDetailsReportName(report, parentReport, parentReportAction);

    const isGroupChat = isGroupChatUtil(report);
    const canRename = !shouldDisableRenameUtil(report, isReportArchived);
    const name = StringUtils.lineBreaksToSpaces(reportName);

    // Group chats and rooms show their name as a labeled field, every other report as a centered header
    const isNameField = !isThreadUtil(report) && (isGroupChat || isUserCreatedPolicyRoomUtil(report) || isDefaultRoomUtil(report));
    const fieldName = translate(isGroupChat ? 'newRoomPage.groupName' : 'newRoomPage.roomName');

    return (
        <OfflineWithFeedback
            pendingAction={report.pendingFields?.reportName}
            errors={report.errorFields?.reportName ?? null}
            errorRowStyles={[styles.ph5]}
            onClose={() => clearPolicyRoomNameErrors(report.reportID)}
        >
            <View style={[styles.flex1, canRename && styles.mt3]}>
                <MenuItem.Root
                    onPress={canRename ? () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_SETTINGS_NAME.path)) : undefined}
                    accessibilityLabel={isNameField ? `${fieldName}, ${name}` : name}
                >
                    <MenuItem.Row>
                        {isNameField ? (
                            <MenuItemField.Content name={fieldName}>
                                <ReportNameText name={name} />
                            </MenuItemField.Content>
                        ) : (
                            <CenteredReportNameContent
                                report={report}
                                name={name}
                            />
                        )}
                        {canRename && (
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        )}
                    </MenuItem.Row>
                </MenuItem.Root>
                {isNameField && !isGroupChat && (
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
