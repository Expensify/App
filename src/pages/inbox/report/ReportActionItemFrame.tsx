import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type * as OnyxTypes from '@src/types/onyx';
import ReportActionItemDraft from './ReportActionItemDraft';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionItemSingle from './ReportActionItemSingle';

type ReportActionItemFrameProps = {
    /** Action content */
    children: React.ReactNode;

    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Report for this action */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** True when this message is edited inline on a wide layout; right-aligns the reaction row under the composer. */
    isEditingInline: boolean;

    /** Whether the report action is a whisper */
    isWhisper: boolean;

    /** Whether the search-page UI is active */
    isOnSearch: boolean;

    /** Whether the report action is hovered (or context menu / emoji picker active) */
    hovered: boolean;

    /** Whether the report action is currently active (linked, not occluded by context menu) */
    isActive: boolean;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxTypes.Report;
};

function ReportActionItemFrame({
    children,
    action,
    report,
    displayAsGroup,
    isEditingInline,
    isWhisper,
    isOnSearch,
    hovered,
    isActive,
    iouReport,
}: ReportActionItemFrameProps): React.JSX.Element {
    const styles = useThemeStyles();

    if (isEditingInline) {
        return <ReportActionItemDraft>{children}</ReportActionItemDraft>;
    }

    if (!displayAsGroup) {
        return (
            <ReportActionItemSingle
                action={action}
                showHeader={!isEditingInline}
                wrapperStyle={{
                    ...(isOnSearch && styles.p0),
                    ...(isWhisper && styles.pt1),
                }}
                report={report}
                iouReport={iouReport}
                isHovered={hovered}
                isActive={isActive}
            >
                {children}
            </ReportActionItemSingle>
        );
    }

    return <ReportActionItemGrouped wrapperStyle={isWhisper ? styles.pt1 : {}}>{children}</ReportActionItemGrouped>;
}

export default ReportActionItemFrame;
