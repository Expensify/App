import React from 'react';
import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import FS from '@libs/Fullstory';
import ReportActionItem from '@pages/inbox/report/ReportActionItem';
import variables from '@styles/variables';
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
}: ChatListItemProps<TItem>) {
    const reportActionItem = item as unknown as ReportActionListItemType;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportActionItem?.reportID)}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector, canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
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

    const fsClass = FS.getChatFSClass(report);

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
            forwardedFSClass={fsClass}
        >
            <ReportActionItem
                action={reportActionItem}
                report={report ?? undefined}
                onPress={() => onSelectRow(item)}
                parentReportAction={undefined}
                displayAsGroup={false}
                isMostRecentIOUReportAction={false}
                shouldDisplayNewMarker={false}
                index={item.index ?? 0}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
                shouldShowDraftMessage={false}
                shouldShowBorder
                userWalletTierName={userWalletTierName}
                isUserValidated={isUserValidated}
                personalDetails={personalDetails}
                userBillingFundID={userBillingFundID}
            />
        </BaseListItem>
    );
}

export default ChatListItem;
