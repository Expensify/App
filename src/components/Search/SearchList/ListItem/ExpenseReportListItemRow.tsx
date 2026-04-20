import React, {Fragment} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import SearchReportAvatar from '@components/ReportActionAvatars/SearchReportAvatar';
import ReportSearchHeader from '@components/ReportSearchHeader';
import type {SearchColumnType} from '@components/Search/types';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getBase62ReportID from '@libs/getBase62ReportID';
import {getParentNavigationSubtitle, getReportStatusTranslation} from '@libs/ReportUtils';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import ActionCell from './ActionCell';
import DateCell from './DateCell';
import ExportedIconCell from './ExportedIconCell';
import StatusCell from './StatusCell';
import TextCell from './TextCell';
import TotalCell from './TotalCell';
import type {ExpenseReportListItemType} from './types';
import UserInfoCell from './UserInfoCell';
import UserInfoCellsWithArrow from './UserInfoCellsWithArrow';
import WorkspaceCell from './WorkspaceCell';

type ExpenseReportListItemRowProps = {
    item: ExpenseReportListItemType;
    reportActions?: ReportAction[];
    showTooltip: boolean;
    canSelectMultiple?: boolean;
    isActionLoading?: boolean;
    onButtonPress?: () => void;
    onCheckboxPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    isSelectAllChecked?: boolean;
    isIndeterminate?: boolean;
    isDisabledCheckbox?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    isPendingDelete?: boolean;
    columns?: SearchColumnType[];
    isLargeScreenWidth?: boolean;
};

function ExpenseReportListItemRow({
    item,
    reportActions,
    onCheckboxPress = () => {},
    onButtonPress = () => {},
    isActionLoading,
    containerStyle,
    showTooltip,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isDisabledCheckbox,
    columns = [],
    isHovered = false,
    isFocused = false,
    isPendingDelete = false,
    isLargeScreenWidth = false,
}: ExpenseReportListItemRowProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const shouldUseNarrowLayout = !isLargeScreenWidth;
    const policy = usePolicy(item.policyID);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const currency = item.currency ?? CONST.CURRENCY.USD;
    const {totalDisplaySpend = 0, nonReimbursableSpend = 0, reimbursableSpend = 0, isAllScanning: isScanning = false} = item;

    const columnComponents = {
        [CONST.SEARCH.TABLE_COLUMNS.DATE]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, {isDateColumnWide: item.shouldShowYear})]}>
                <DateCell
                    date={item.created ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.SUBMITTED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.SUBMITTED, {isSubmittedColumnWide: item.shouldShowYearSubmitted})]}>
                <DateCell
                    date={item.submitted ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.APPROVED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.APPROVED, {isApprovedColumnWide: item.shouldShowYearApproved})]}>
                <DateCell
                    date={item.approved ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.EXPORTED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED, {isExportedColumnWide: item.shouldShowYearExported})]}>
                <DateCell
                    date={item.exported ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.STATUS]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.STATUS)]}>
                <StatusCell
                    stateNum={item.stateNum}
                    statusNum={item.statusNum}
                    isPending={item.shouldShowStatusAsPending}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TITLE]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TITLE)]}>
                <TextCell
                    text={item.reportName ?? ''}
                    isLargeScreenWidth={isLargeScreenWidth}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.FROM]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                {!!item.from && (
                    <UserInfoCell
                        accountID={item.from.accountID}
                        avatar={item.from.avatar}
                        displayName={item.formattedFrom ?? ''}
                        isLargeScreenWidth={isLargeScreenWidth}
                    />
                )}
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TO]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TO)]}>
                {!!item.to && (
                    <UserInfoCell
                        accountID={item.to.accountID}
                        avatar={item.to.avatar}
                        displayName={item.formattedTo ?? ''}
                        isLargeScreenWidth={isLargeScreenWidth}
                    />
                )}
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL]: (
            <View
                style={[
                    StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL, {isAmountColumnWide: item.isAmountColumnWide, shouldRemoveTotalColumnFlex: true}),
                ]}
            >
                <TotalCell
                    total={reimbursableSpend}
                    currency={currency}
                    isScanning={isScanning}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL]: (
            <View
                style={[
                    StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL, {
                        isAmountColumnWide: item.isAmountColumnWide,
                        shouldRemoveTotalColumnFlex: true,
                    }),
                ]}
            >
                <TotalCell
                    total={nonReimbursableSpend}
                    currency={currency}
                    isScanning={isScanning}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, {isAmountColumnWide: item.isAmountColumnWide, shouldRemoveTotalColumnFlex: true})]}>
                <TotalCell
                    total={totalDisplaySpend}
                    currency={currency}
                    isScanning={isScanning}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.REPORT_ID]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.REPORT_ID)]}>
                <TextCell text={item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : item.reportID} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID)]}>
                <TextCell text={item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : getBase62ReportID(Number(item.reportID))} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO)]}>
                <ExportedIconCell reportActions={reportActions} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.ACTION]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                <ActionCell
                    action={item.action}
                    onButtonPress={onButtonPress}
                    isSelected={item.isSelected}
                    isLoading={isActionLoading}
                    policyID={item.policyID}
                    reportID={item.reportID}
                    hash={item.hash}
                    amount={item.total}
                    shouldDisablePointerEvents={isPendingDelete}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME)]}>
                <WorkspaceCell
                    policyID={item.policyID}
                    report={item}
                />
            </View>
        ),
    };

    const thereIsFromAndTo = !!item?.from && !!item?.to;
    const showUserInfo = (item.type === CONST.REPORT.TYPE.IOU && thereIsFromAndTo) || (item.type === CONST.REPORT.TYPE.EXPENSE && !!item?.from);

    // Calculate the correct border color for avatars based on hover and focus states
    const finalAvatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused || !!isHovered, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ??
        theme.highlightBG;

    if (!isLargeScreenWidth) {
        const hasFromSender = !!item?.from && !!item?.from?.accountID && !!item?.from?.displayName;
        const hasToRecipient = !!item?.to && !!item?.to?.accountID && !!item?.to?.displayName;
        const participantFromDisplayName = item.formattedFrom ?? item?.from?.displayName ?? '';
        const participantToDisplayName = item.formattedTo ?? item?.to?.displayName ?? '';
        const shouldShowToRecipient = hasFromSender && hasToRecipient && !!item?.to?.accountID && !!isCorrectSearchUserName(participantToDisplayName);
        const isInMobileSelectionMode = shouldUseNarrowLayout && !!canSelectMultiple;

        // Compute accessible group label (user name, subtitle, report title, status, amount)
        const parentNavigationSubtitleData = getParentNavigationSubtitle(item, policy, conciergeReportID);
        const subtitleLabel = translate('threads.parentNavigationSummary', parentNavigationSubtitleData);
        const statusLabel = getReportStatusTranslation({stateNum: item.stateNum, statusNum: item.statusNum, translate});
        const amountLabel = convertToDisplayString(totalDisplaySpend, currency);
        const groupAccessibilityLabel = [participantFromDisplayName, item.reportName, subtitleLabel, statusLabel, amountLabel].filter(Boolean).join(', ');

        return (
            <View style={styles.pRelative}>
                <View
                    accessible
                    accessibilityLabel={groupAccessibilityLabel}
                    role={CONST.ROLE.BUTTON}
                    style={{marginRight: variables.w72}}
                >
                    <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mb2]}>
                        {showUserInfo && (
                            <UserInfoCellsWithArrow
                                shouldShowToRecipient={shouldShowToRecipient}
                                participantFrom={item?.from}
                                participantFromDisplayName={participantFromDisplayName}
                                participantToDisplayName={participantToDisplayName}
                                participantTo={item?.to}
                                avatarSize={CONST.AVATAR_SIZE.SMALL_SUBSCRIPT}
                                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                                infoCellsTextStyle={{lineHeight: 14}}
                                infoCellsAvatarStyle={styles.pr1}
                                fromRecipientStyle={!shouldShowToRecipient ? styles.mw100 : {}}
                                shouldUseArrowIcon={false}
                            />
                        )}
                    </View>
                    <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart, {marginRight: -variables.w72}]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                            {!!canSelectMultiple && (
                                <Checkbox
                                    onPress={onCheckboxPress}
                                    isChecked={isSelectAllChecked}
                                    isIndeterminate={isIndeterminate}
                                    containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled), styles.m0]}
                                    disabled={isDisabledCheckbox}
                                    accessibilityLabel={item.text ?? ''}
                                    shouldStopMouseDownPropagation
                                    style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled]}
                                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.EXPENSE_REPORT_CHECKBOX}
                                />
                            )}
                            <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.mr2]}>
                                <ReportSearchHeader
                                    report={item}
                                    style={[{maxWidth: variables.reportSearchHeaderMaxWidth}]}
                                    transactions={item.transactions}
                                    avatarBorderColor={finalAvatarBorderColor}
                                />
                            </View>
                        </View>
                        <View style={[styles.flexShrink0, styles.flexColumn, styles.alignItemsEnd, styles.gap1]}>
                            <TotalCell
                                total={totalDisplaySpend}
                                currency={currency}
                                isScanning={isScanning}
                            />
                        </View>
                    </View>
                </View>
                <View style={[styles.pAbsolute, styles.t0, styles.r0, {width: variables.w72}, styles.alignItemsEnd]}>
                    <ActionCell
                        action={item.action}
                        onButtonPress={onButtonPress}
                        isSelected={item.isSelected}
                        isLoading={isActionLoading}
                        policyID={item.policyID}
                        reportID={item.reportID}
                        hash={item.hash}
                        amount={item.total}
                        extraSmall
                        shouldDisablePointerEvents={isInMobileSelectionMode || isPendingDelete}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={onCheckboxPress}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled), styles.m0]}
                        disabled={isDisabledCheckbox}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled]}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.EXPENSE_REPORT_CHECKBOX}
                    />
                )}
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR), {alignItems: 'stretch'}]}>
                    <SearchReportAvatar
                        primaryAvatar={item.primaryAvatar}
                        secondaryAvatar={item.secondaryAvatar}
                        avatarType={item.avatarType}
                        shouldShowTooltip={showTooltip}
                        subscriptAvatarBorderColor={finalAvatarBorderColor}
                        reportID={item.reportID}
                        isLargeScreenWidth={isLargeScreenWidth}
                    />
                </View>

                {columns.map((column) => {
                    const CellComponent = columnComponents[column as keyof typeof columnComponents];
                    return <Fragment key={column}>{CellComponent}</Fragment>;
                })}
            </View>
            <Icon
                src={expensifyIcons.ArrowRight}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
                fill={theme.icon}
                additionalStyles={!isHovered && styles.opacitySemiTransparent}
            />
        </View>
    );
}

export default ExpenseReportListItemRow;
