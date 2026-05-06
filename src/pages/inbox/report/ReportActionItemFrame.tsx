import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isPendingRemove} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {emptyHTML, isEmptyHTML} from './actionContents/emptyHTML';
import ReportActionItemDraft from './ReportActionItemDraft';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionItemSingle from './ReportActionItemSingle';

type ReportActionItemFrameProps = {
    /** Action-content JSX produced by ActionContentRouter */
    children: React.JSX.Element;

    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Report for this action */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxTypes.Report;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** ReportAction draft message */
    draftMessage: string | undefined;

    /** Whether the report action is a whisper */
    isWhisper: boolean;

    /** Whether the search-page UI is active */
    isOnSearch: boolean;

    /** Whether this row is being hovered */
    hovered: boolean;

    /** Whether the report action context menu is active */
    isContextMenuActive: boolean;

    /** Whether the report action is currently active (linked) */
    isReportActionActive: boolean;

    /** Latest moderation decision used to compute hasBeenFlagged */
    moderationDecision: OnyxTypes.DecisionName;

    /** Whether the renderer should bail out for this action type (table-view conditional) */
    shouldRenderViewBasedOnAction: boolean;

    /** Whether the provided report is a closed expense report with no expenses */
    isClosedExpenseReportWithNoExpenses?: boolean;
};

function ReportActionItemFrame({
    children,
    action,
    report,
    iouReport,
    displayAsGroup,
    draftMessage,
    isWhisper,
    isOnSearch,
    hovered,
    isContextMenuActive,
    isReportActionActive,
    moderationDecision,
    shouldRenderViewBasedOnAction,
    isClosedExpenseReportWithNoExpenses,
}: ReportActionItemFrameProps): React.JSX.Element {
    const styles = useThemeStyles();

    if (isEmptyHTML(children) || (!shouldRenderViewBasedOnAction && !isClosedExpenseReportWithNoExpenses)) {
        return emptyHTML;
    }

    if (draftMessage !== undefined) {
        return <ReportActionItemDraft>{children}</ReportActionItemDraft>;
    }

    if (!displayAsGroup) {
        return (
            <ReportActionItemSingle
                action={action}
                showHeader={draftMessage === undefined}
                wrapperStyle={{
                    ...(isOnSearch && styles.p0),
                    ...(isWhisper && styles.pt1),
                }}
                report={report}
                iouReport={iouReport}
                isHovered={hovered || isContextMenuActive}
                isActive={isReportActionActive && !isContextMenuActive}
                hasBeenFlagged={
                    ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision) && !isPendingRemove(action)
                }
            >
                {children}
            </ReportActionItemSingle>
        );
    }

    return <ReportActionItemGrouped wrapperStyle={isWhisper ? styles.pt1 : {}}>{children}</ReportActionItemGrouped>;
}

export default ReportActionItemFrame;
