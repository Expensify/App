import Checkbox from '@components/Checkbox';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ReportSearchHeader from '@components/ReportSearchHeader';
import {
    ReportSubmitToPopoverAnchor,
    SEARCH_REPORT_SUBMIT_TO_POPOVER_ANCHOR_ALIGNMENT,
    useOpenReportSubmitToPopover,
    useSearchSubmitPopoverGuard,
} from '@components/ReportSubmitToPopoverAnchor';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import type {ListItem} from '@components/SelectionList/types';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useReportPaymentContext} from '@hooks/usePaymentContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {showPendingCardTransactionsBlockModal} from '@libs/TransactionUtils';

import {handleActionButtonPress} from '@userActions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report} from '@src/types/onyx';

import type {ColorValue} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useMemo} from 'react';
import {View} from 'react-native';
// Use the original useOnyx hook to get the real-time personal details list data from Onyx and not from the snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';

import type {SearchListActionProps, TransactionReportGroupListItemType} from './types';

import ActionCell from './ActionCell';
import TotalCell from './TotalCell';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';

type ReportListItemHeaderProps<TItem extends ListItem> = SearchListActionProps & {
    /** The report currently being looked at */
    report: TransactionReportGroupListItemType;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem, event?: ModifiedMouseEvent) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether the item is focused */
    isFocused?: boolean;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    /** Callback for when the down arrow is clicked */
    onDownArrowClick?: () => void;

    /** Whether the down arrow is expanded */
    isExpanded?: boolean;

    /** Whether the item is hovered */
    isHovered?: boolean;
};

type FirstRowReportHeaderProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: TransactionReportGroupListItemType;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Callback passed as goToItem in actionCell, triggered by clicking actionButton */
    handleOnButtonPress?: (event?: ModifiedMouseEvent) => void;

    /** Color of the secondary avatar border, usually should match the container background */
    avatarBorderColor?: ColorValue;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    /** Callback for when the down arrow is clicked */
    onDownArrowClick?: () => void;

    /** Whether the down arrow is expanded */
    isExpanded?: boolean;

    /** Whether the action button should be disabled */
    shouldDisableActionPointerEvents?: boolean;

    /** Parent chat report resolved from live Onyx with search snapshot fallback */
    chatReport?: OnyxEntry<Report>;
};

function HeaderFirstRow<TItem extends ListItem>({
    report: reportItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    handleOnButtonPress = () => {},
    avatarBorderColor,
    isSelectAllChecked,
    isIndeterminate,
    onDownArrowClick,
    isExpanded,
    shouldDisableActionPointerEvents = false,
    chatReport,
}: FirstRowReportHeaderProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const theme = useTheme();
    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportItem.reportID}`, {selector: isActionLoadingSelector});
    const {isSelected} = useRowSelection(reportItem.keyForList);

    let total = reportItem.total ?? 0;
    if (total) {
        if (reportItem.type === CONST.REPORT.TYPE.IOU) {
            total = Math.abs(total);
        } else {
            total *= reportItem.type === CONST.REPORT.TYPE.EXPENSE || reportItem.type === CONST.REPORT.TYPE.INVOICE ? -1 : 1;
        }
    }
    const currency = reportItem.currency ?? CONST.CURRENCY.USD;

    return (
        <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart, styles.pl3]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={() => onCheckboxPress?.(reportItem as unknown as TItem)}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        containerStyle={styles.m0}
                        disabled={!!isDisabled || reportItem.isDisabledCheckbox}
                        accessibilityLabel={reportItem.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, reportItem.isDisabledCheckbox && styles.cursorDisabled]}
                    />
                )}
                <View style={[{flexShrink: 1, flexGrow: 1, minWidth: 0}, styles.mr2]}>
                    <ReportSearchHeader
                        report={reportItem}
                        style={[{maxWidth: 700}]}
                        transactions={reportItem.transactions}
                        avatarBorderColor={avatarBorderColor}
                    />
                </View>
            </View>
            <View style={[styles.flexShrink0, styles.gap1, styles.pr3]}>
                <TotalCell
                    total={total}
                    currency={currency}
                />
                {!isLargeScreenWidth && !!onDownArrowClick && (
                    <View>
                        <PressableWithFeedback
                            onPress={onDownArrowClick}
                            style={[styles.pl3, styles.justifyContentCenter, styles.alignItemsEnd]}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={isExpanded ? CONST.ACCESSIBILITY_LABELS.COLLAPSE : CONST.ACCESSIBILITY_LABELS.EXPAND}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.REPORT_EXPAND_COLLAPSE}
                        >
                            {({hovered}) => (
                                <Icon
                                    src={isExpanded ? icons.UpArrow : icons.DownArrow}
                                    fill={theme.icon}
                                    additionalStyles={!hovered && styles.opacitySemiTransparent}
                                    small
                                />
                            )}
                        </PressableWithFeedback>
                    </View>
                )}
            </View>
            {isLargeScreenWidth && (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                    <ActionCell
                        action={reportItem.action}
                        onButtonPress={handleOnButtonPress}
                        isSelected={isSelected}
                        isLoading={isActionLoading}
                        policyID={reportItem.policyID}
                        reportID={reportItem.reportID}
                        hash={reportItem.hash}
                        amount={reportItem.total}
                        shouldDisablePointerEvents={shouldDisableActionPointerEvents}
                        chatReport={chatReport}
                    />
                </View>
            )}
        </View>
    );
}

function ReportListItemHeader<TItem extends ListItem>(props: ReportListItemHeaderProps<TItem>) {
    return (
        <ReportSubmitToPopoverAnchor
            reportID={props.report.reportID}
            anchorAlignment={SEARCH_REPORT_SUBMIT_TO_POPOVER_ANCHOR_ALIGNMENT}
        >
            <ReportListItemHeaderInner {...props} />
        </ReportSubmitToPopoverAnchor>
    );
}

function ReportListItemHeaderInner<TItem extends ListItem>({
    report: reportItem,
    onSelectRow,
    onCheckboxPress,
    isDisabled,
    isFocused,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    onDownArrowClick,
    isExpanded,
    isHovered,
    lastPaymentMethod,
    personalPolicyID,
    userBillingGracePeriodEnds,
    ownerBillingGracePeriodEnd,
}: ReportListItemHeaderProps<TItem>) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {currentSearchHash, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults: snapshot} = useSearchResultsContext();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const thereIsFromAndTo = !!reportItem?.from && !!reportItem?.to;
    const showUserInfo = (reportItem.type === CONST.REPORT.TYPE.IOU && thereIsFromAndTo) || (reportItem.type === CONST.REPORT.TYPE.EXPENSE && !!reportItem?.from);
    const snapshotReport = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`] ?? {}) as Report;
    }, [snapshot, reportItem.reportID]);
    const snapshotPolicy = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] ?? {}) as Policy;
    }, [snapshot, reportItem.policyID]);
    const snapshotChatReport = useMemo(() => {
        const chatReportID = snapshotReport?.chatReportID ?? reportItem.parentReportID;
        return chatReportID ? snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] : undefined;
    }, [snapshot, snapshotReport?.chatReportID, reportItem.parentReportID]);
    const [parentPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(snapshotReport?.policyID ?? reportItem.policyID)}`);
    const [submitterLogin] = originalUseOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(reportItem.ownerAccountID)});
    const [parentChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(snapshotReport?.chatReportID ?? reportItem.parentReportID)}`);
    const chatReport = parentChatReport ?? snapshotChatReport;
    const [chatReportActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(chatReport?.reportID ?? snapshotReport?.chatReportID ?? snapshotReport.parentReportID)}`,
    );
    const {currentUserAccountID, currentUserLogin, introSelected, betas, isSelfTourViewed, activePolicy, nextStep, chatReportPolicy, amountOwed, delegateEmail} = useReportPaymentContext({
        reportID: reportItem.reportID,
        chatReportPolicyID: chatReport?.policyID,
    });
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {isSelected} = useRowSelection(reportItem.keyForList);
    const avatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(isSelected, !!isFocused || !!isHovered, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ?? theme.highlightBG;

    const openReportSubmitToPopover = useOpenReportSubmitToPopover();
    const {shouldDisableSearchSubmitPress, consumeIgnoreNextSearchSubmitPress} = useSearchSubmitPopoverGuard();

    const handleOnButtonPress = (event?: ModifiedMouseEvent) => {
        handleActionButtonPress({
            hash: currentSearchHash,
            item: reportItem,
            goToItem: () => onSelectRow(reportItem as unknown as TItem, event),
            snapshotReport,
            snapshotPolicy,
            submitterLogin,
            policy: parentPolicy,
            lastPaymentMethod,
            userBillingGracePeriodEnds,
            currentSearchKey,
            isDelegateAccessRestricted,
            onDelegateAccessRestricted: showDelegateNoAccessModal,
            personalPolicyID,
            ownerBillingGracePeriodEnd,
            amountOwed,
            openReportSubmitToPopover,
            shouldDisableSearchSubmitPress,
            consumeIgnoreNextSearchSubmitPress,
            onPendingCardTransactionsBlock: () => showPendingCardTransactionsBlockModal(showConfirmModal, translate),
            currentUserAccountID,
            currentUserLogin,
            introSelected,
            betas,
            isSelfTourViewed,
            activePolicy,
            chatReport,
            chatReportPolicy,
            iouReportCurrentNextStepDeprecated: nextStep,
            searchData: snapshot?.data,
            chatReportActions,
            delegateEmail,
        });
    };
    return !isLargeScreenWidth ? (
        <View style={[styles.pv1Half]}>
            <UserInfoAndActionButtonRow
                item={reportItem}
                shouldShowUserInfo={showUserInfo}
                containerStyles={[styles.pr3, styles.mb2]}
                stateNum={reportItem.stateNum}
                statusNum={reportItem.statusNum}
                isSelected={isSelected}
            />
            <HeaderFirstRow
                report={reportItem}
                onCheckboxPress={onCheckboxPress}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                handleOnButtonPress={handleOnButtonPress}
                avatarBorderColor={avatarBorderColor}
                isSelectAllChecked={isSelectAllChecked}
                isIndeterminate={isIndeterminate}
                onDownArrowClick={onDownArrowClick}
                isExpanded={isExpanded}
                shouldDisableActionPointerEvents={shouldDisableSearchSubmitPress}
            />
        </View>
    ) : (
        <View>
            <HeaderFirstRow
                report={reportItem}
                onCheckboxPress={onCheckboxPress}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                handleOnButtonPress={handleOnButtonPress}
                avatarBorderColor={avatarBorderColor}
                isSelectAllChecked={isSelectAllChecked}
                isIndeterminate={isIndeterminate}
                onDownArrowClick={onDownArrowClick}
                isExpanded={isExpanded}
                shouldDisableActionPointerEvents={shouldDisableSearchSubmitPress}
                chatReport={chatReport}
            />
        </View>
    );
}

export default ReportListItemHeader;
