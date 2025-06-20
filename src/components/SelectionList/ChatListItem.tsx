import React from 'react';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isInvoiceRoom, isPolicyExpenseChat} from '@libs/ReportUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseListItem from './BaseListItem';
import type {ChatListItemProps, ListItem, ReportActionListItemType} from './types';

function ChatListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    policies,
    allReports,
}: ChatListItemProps<TItem>) {
    const reportActionItem = item as unknown as ReportActionListItemType;
    const reportID = Number(reportActionItem?.reportID ?? CONST.DEFAULT_NUMBER_ID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        canBeMissing: true,
    });
    const styles = useThemeStyles();
    const theme = useTheme();
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    const pressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.p0,
        styles.textAlignLeft,
        styles.overflowHidden,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
        item.cursorStyle,
    ];

    return (
        <BaseListItem
            item={item}
            pressableStyle={pressableStyle}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.userSelectNone]}
            containerStyle={styles.mb2}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onLongPressRow={onLongPressRow}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            <ReportActionItem
                allReports={allReports}
                action={reportActionItem}
                report={report}
                reportActions={[]}
                onPress={() => onSelectRow(item)}
                parentReportAction={undefined}
                displayAsGroup={false}
                isMostRecentIOUReportAction={false}
                shouldDisplayNewMarker={false}
                index={item.index ?? 0}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
                shouldShowDraftMessage={false}
                shouldShowSubscriptAvatar={
                    (isPolicyExpenseChat(report) || isInvoiceRoom(report)) &&
                    [
                        CONST.REPORT.ACTIONS.TYPE.IOU,
                        CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                        CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                        CONST.REPORT.ACTIONS.TYPE.APPROVED,
                        CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    ].some((type) => type === reportActionItem.actionName)
                }
                policies={policies}
                shouldShowBorder
            />
        </BaseListItem>
    );
}

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem;
