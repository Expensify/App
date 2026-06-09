import React from 'react';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import type {ListItem} from '@components/SelectionList/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import FS from '@libs/Fullstory';
import ReportActionItem from '@pages/inbox/report/ReportActionItem';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import {getStableReportSelector} from '@src/selectors/Report';
import type {ChatListItemProps, ReportActionListItemType} from './types';

/**
 * A chat message (report action) row in search results.
 */
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
    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportActionItem?.reportID}`, {selector: getStableReportSelector});
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportActionItem?.childReportID}`);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isSelected} = useRowSelection(item.keyForList);
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.appBG,
    });
    const pressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.p0,
        styles.textAlignLeft,
        styles.overflowHidden,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        isSelected && styles.searchRowSelectedBG,
        styles.mh0,
        item.cursorStyle,
    ];

    const fsClass = FS.getChatFSClass(reportStable);

    const handlePress = () => onSelectRow(item);

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
            hoverStyle={isSelected && styles.searchRowSelectedBG}
            forwardedFSClass={fsClass}
        >
            <ReportActionItem
                action={reportActionItem}
                report={reportStable}
                transactionThreadReport={transactionThreadReport}
                onPress={handlePress}
                parentReportAction={undefined}
                displayAsGroup={false}
                shouldDisplayNewMarker={false}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
                shouldShowBorder
            />
        </BaseListItem>
    );
}

export default ChatListItem;
