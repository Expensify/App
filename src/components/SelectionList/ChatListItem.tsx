import React from 'react';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import PureReportActionItem from '@pages/home/report/PureReportActionItem';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchPersonalDetails} from '@src/types/onyx/SearchResults';
import BaseListItem from './BaseListItem';
import type {ChatListItemProps, ListItem, ReportActionListItemType} from './types';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';

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
}: ChatListItemProps<TItem>) {
    const reportActionItem = item as unknown as ReportActionListItemType;
    const from = reportActionItem.from;
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

    const personalDetails: Record<string, SearchPersonalDetails | null> = {
        [from.accountID]: from,
    };

    // const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${ReportActionsUtils.getIOUReportIDFromReportActionPreview(reportActionItem)}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportActionItem?.reportID}`);

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
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            <ReportActionItem
                action={reportActionItem}
                report={report}
                onPress={() => onSelectRow(item)}
                reportActions={[]}
                parentReportAction={undefined}
                displayAsGroup={false}
                isMostRecentIOUReportAction={false}
                shouldDisplayNewMarker={false}
                index={0}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
            />

            {/* <PureReportActionItem
                action={reportActionItem}
                onPress={() => onSelectRow(item)}
                report={undefined}
                reportActions={[]}
                parentReportAction={undefined}
                displayAsGroup={false}
                isMostRecentIOUReportAction={false}
                shouldDisplayNewMarker={false}
                index={item.index ?? 0}
                isFirstVisibleReportAction={false}
                personalDetails={personalDetails}
                shouldDisplayContextMenu={false}
                attachmentContextValueType={CONST.ATTACHMENT_TYPE.SEARCH}
                iouReport={iouReport}
            /> */}
        </BaseListItem>
    );
}

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem;
