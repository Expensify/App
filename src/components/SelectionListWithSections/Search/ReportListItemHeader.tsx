import React, {useContext, useMemo} from 'react';
import type {ColorValue} from 'react-native';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ReportSearchHeader from '@components/ReportSearchHeader';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem, TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy, Report} from '@src/types/onyx';
import ActionCell from './ActionCell';
import TotalCell from './TotalCell';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';

type ReportListItemHeaderProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: TransactionReportGroupListItemType;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

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

    /** Callback to fire when DEW modal should be opened */
    onDEWModalOpen?: () => void;

    /** Whether the DEW beta flag is enabled */
    isDEWBetaEnabled?: boolean;
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
    handleOnButtonPress?: () => void;

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
}: FirstRowReportHeaderProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const theme = useTheme();
    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportItem.reportID}`, {canBeMissing: true, selector: isActionLoadingSelector});

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
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!reportItem.isSelected, !!reportItem.isDisabled)]}
                        disabled={!!isDisabled || reportItem.isDisabledCheckbox}
                        accessibilityLabel={reportItem.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), reportItem.isDisabledCheckbox && styles.cursorDisabled]}
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
                        goToItem={handleOnButtonPress}
                        isSelected={reportItem.isSelected}
                        isLoading={isActionLoading}
                        policyID={reportItem.policyID}
                        reportID={reportItem.reportID}
                        hash={reportItem.hash}
                        amount={reportItem.total}
                        extraSmall={!isLargeScreenWidth}
                    />
                </View>
            )}
        </View>
    );
}

function ReportListItemHeader<TItem extends ListItem>({
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
    onDEWModalOpen,
    isDEWBetaEnabled,
}: ReportListItemHeaderProps<TItem>) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {currentSearchHash, currentSearchKey, currentSearchResults: snapshot} = useSearchContext();
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const thereIsFromAndTo = !!reportItem?.from && !!reportItem?.to;
    const showUserInfo = (reportItem.type === CONST.REPORT.TYPE.IOU && thereIsFromAndTo) || (reportItem.type === CONST.REPORT.TYPE.EXPENSE && !!reportItem?.from);
    const snapshotReport = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`] ?? {}) as Report;
    }, [snapshot, reportItem.reportID]);
    const snapshotPolicy = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] ?? {}) as Policy;
    }, [snapshot, reportItem.policyID]);
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const avatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(!!reportItem.isSelected, !!isFocused || !!isHovered, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ??
        theme.highlightBG;

    const handleOnButtonPress = () => {
        handleActionButtonPress({
            hash: currentSearchHash,
            item: reportItem,
            goToItem: () => onSelectRow(reportItem as unknown as TItem),
            snapshotReport,
            snapshotPolicy,
            lastPaymentMethod,
            currentSearchKey,
            onDEWModalOpen,
            isDEWBetaEnabled,
            isDelegateAccessRestricted,
            onDelegateAccessRestricted: showDelegateNoAccessModal,
            personalPolicyID,
        });
    };
    return !isLargeScreenWidth ? (
        <View style={[styles.pv1Half]}>
            <UserInfoAndActionButtonRow
                item={reportItem}
                handleActionButtonPress={handleOnButtonPress}
                shouldShowUserInfo={showUserInfo}
                containerStyles={[styles.pr3, styles.mb2]}
                isInMobileSelectionMode={shouldUseNarrowLayout && !!canSelectMultiple}
            />
            <HeaderFirstRow
                report={reportItem}
                onCheckboxPress={onCheckboxPress}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                avatarBorderColor={avatarBorderColor}
                isSelectAllChecked={isSelectAllChecked}
                isIndeterminate={isIndeterminate}
                onDownArrowClick={onDownArrowClick}
                isExpanded={isExpanded}
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
            />
        </View>
    );
}

export default ReportListItemHeader;
