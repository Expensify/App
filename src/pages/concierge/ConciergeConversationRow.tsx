/** A row of the Concierge page list. Each row reads its own data, so a change to one conversation only redraws that row. */
import MenuItem from '@components/MenuItem';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ConciergeConversation} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportActionMessageText} from '@libs/ReportActionsUtils';
import {isUnread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';

type ConciergeConversationRowProps = {
    conversation: ConciergeConversation;

    /** Whether the conversation is the one open next to the list */
    isSelected: boolean;

    onOpenThread: (reportID: string) => void;

    /** Opens a thread on a Concierge message that has none yet */
    onOpenMessage: (message: ReportAction) => void;
};

type ConciergeConversationRowContentProps = {
    title: string;
    isUnread: boolean;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    isSelected: boolean;
    onPress: () => void;
};

function ConciergeConversationRowContent({title, isUnread: isConversationUnread, brickRoadIndicator, isSelected, onPress}: ConciergeConversationRowContentProps) {
    const styles = useThemeStyles();

    return (
        <MenuItem.Root
            onPress={onPress}
            style={isSelected && styles.sidebarLinkActive}
            accessibilityState={{selected: isSelected}}
            sentryLabel={CONST.SENTRY_LABEL.CONCIERGE_SIDEBAR.CONVERSATION}
        >
            <MenuItem.Row>
                <MenuItem.Content>
                    <MenuItem.Title style={isConversationUnread && styles.sidebarLinkTextBold}>{title}</MenuItem.Title>
                </MenuItem.Content>
                {!!brickRoadIndicator && (
                    <MenuItem.Trailing>
                        <MenuItem.BrickRoadIndicator status={brickRoadIndicator} />
                    </MenuItem.Trailing>
                )}
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

function ConciergeThreadRow({conversation, isSelected, onOpenThread}: ConciergeConversationRowProps) {
    const reportID = conversation.reportID;
    const threadAttributesSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>) => {
        const threadAttributes = reportID ? attributes?.reports?.[reportID] : undefined;
        return {reportName: threadAttributes?.reportName ?? '', brickRoadStatus: threadAttributes?.brickRoadStatus};
    };
    const [threadAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: threadAttributesSelector});
    const isThreadUnreadSelector = (report: OnyxEntry<Report>) => isUnread(report, undefined, false, undefined);
    const [isThreadUnread = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: isThreadUnreadSelector});

    return (
        <ConciergeConversationRowContent
            title={threadAttributes?.reportName ?? ''}
            isUnread={isThreadUnread}
            brickRoadIndicator={threadAttributes?.brickRoadStatus}
            isSelected={isSelected}
            onPress={() => {
                if (!reportID) {
                    return;
                }
                onOpenThread(reportID);
            }}
        />
    );
}

function ConciergeMessageRow({conversation, isSelected, onOpenMessage}: ConciergeConversationRowProps) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const messageSelector = (reportActions: OnyxEntry<ReportActions>) => (conversation.reportActionID ? reportActions?.[conversation.reportActionID] : undefined);
    const [message] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: messageSelector});

    // A message posted after the user last read the DM stays unread until they open it, which turns it into a thread row
    const isMessageUnreadSelector = (report: OnyxEntry<Report>) => !report?.lastReadTime || conversation.lastActivity > report.lastReadTime;
    const [isMessageUnread = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: isMessageUnreadSelector});

    return (
        <ConciergeConversationRowContent
            title={getReportActionMessageText(message)}
            isUnread={isMessageUnread}
            isSelected={isSelected}
            onPress={() => {
                if (!message) {
                    return;
                }
                onOpenMessage(message);
            }}
        />
    );
}

function ConciergeConversationRow(props: ConciergeConversationRowProps) {
    if (props.conversation.reportID) {
        // eslint-disable-next-line react/jsx-props-no-spreading -- Both rows take the same props
        return <ConciergeThreadRow {...props} />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- Both rows take the same props
    return <ConciergeMessageRow {...props} />;
}

export default ConciergeConversationRow;
