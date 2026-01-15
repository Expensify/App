import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import RenderHTML from '@components/RenderHTML';
import type {SearchColumnType} from '@components/Search/types';
import type {ListItem, TransactionWithdrawalIDGroupListItemType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getSettlementStatus, getSettlementStatusBadgeProps} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import ExpensesCell from './ExpensesCell';
import TotalCell from './TotalCell';

type WithdrawalIDListItemHeaderProps<TItem extends ListItem> = {
    /** The withdrawal ID currently being looked at */
    withdrawalID: TransactionWithdrawalIDGroupListItemType;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

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

    /** The visible columns for the header */
    columns?: SearchColumnType[];
};

function WithdrawalIDListItemHeader<TItem extends ListItem>({
    withdrawalID: withdrawalIDItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isIndeterminate,
    isSelectAllChecked,
    onDownArrowClick,
    isExpanded,
    columns,
}: WithdrawalIDListItemHeaderProps<TItem>) {
    const {isLargeScreenWidth} = useResponsiveLayout();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    const formattedBankName = CONST.BANK_NAMES_USER_FRIENDLY[withdrawalIDItem.bankName] ?? CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.GENERIC_BANK];
    const maskedNumber = withdrawalIDItem.accountNumber ? `xx${withdrawalIDItem.accountNumber.slice(-4)}` : '';
    const accountLabel = `${formattedBankName} ${maskedNumber}`;

    const {icon, iconSize, iconStyles} = getBankIcon({bankName: withdrawalIDItem.bankName, styles});
    const formattedWithdrawalDate = DateUtils.formatWithUTCTimeZone(
        withdrawalIDItem.debitPosted,
        DateUtils.doesDateBelongToAPastYear(withdrawalIDItem.debitPosted) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
    );
    const badgeProps = getSettlementStatusBadgeProps(withdrawalIDItem.state, translate, theme);
    const settlementStatus = getSettlementStatus(withdrawalIDItem.state);
    const withdrawalInfoText = translate('settlement.withdrawalInfo', {date: formattedWithdrawalDate, withdrawalID: withdrawalIDItem.entryID});

    const failedErrorHTML =
        settlementStatus !== CONST.SEARCH.SETTLEMENT_STATUS.FAILED
            ? ''
            : (() => {
                  const walletLink = `${environmentURL}/${ROUTES.SETTINGS_WALLET}`;
                  return translate('settlement.failedError', {link: walletLink});
              })();

    const columnComponents = {
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_BANK_ACCOUNT]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.BANK_ACCOUNT}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.BANK_ACCOUNT)}
            >
                <TextWithTooltip
                    text={accountLabel}
                    style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre]}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.WITHDRAWN}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.WITHDRAWN)}
            >
                <TextWithTooltip
                    text={formattedWithdrawalDate}
                    style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre]}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID)}
            >
                <TextWithTooltip
                    text={withdrawalIDItem.entryID?.toString() ?? ''}
                    style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre]}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.EXPENSES}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPENSES)}
            >
                <ExpensesCell count={withdrawalIDItem.count} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.TOTAL}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, false, false, false, false, false, false, false, true)}
            >
                <TotalCell
                    total={withdrawalIDItem.total}
                    currency={withdrawalIDItem.currency}
                />
            </View>
        ),
    };

    return (
        <View>
            <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, isLargeScreenWidth ? styles.gap3 : styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(withdrawalIDItem as unknown as TItem)}
                            isChecked={isSelectAllChecked}
                            disabled={!!isDisabled || withdrawalIDItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                            isIndeterminate={isIndeterminate}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <Icon
                                src={icon}
                                width={iconSize}
                                height={iconSize}
                                additionalStyles={iconStyles}
                            />
                            <View style={[styles.gapHalf, styles.flexShrink1]}>
                                <TextWithTooltip
                                    text={`${formattedBankName} xx${withdrawalIDItem.accountNumber.slice(-4)}`}
                                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                                />
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                                    {!!badgeProps && (
                                        <View style={[styles.reportStatusContainer, badgeProps.badgeStyles]}>
                                            <Text style={[styles.reportStatusText, badgeProps.textStyles]}>{badgeProps.text}</Text>
                                        </View>
                                    )}
                                    <TextWithTooltip
                                        text={withdrawalInfoText}
                                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                    {isLargeScreenWidth && (
                        <>
                            <View style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)}>
                                <Icon
                                    src={icon}
                                    width={iconSize}
                                    height={iconSize}
                                    additionalStyles={iconStyles}
                                />
                            </View>

                            {columns?.map((column) => columnComponents[column as keyof typeof columnComponents])}
                        </>
                    )}
                </View>
                {!isLargeScreenWidth && (
                    <View style={[[styles.flexShrink0, styles.mr3, styles.gap1]]}>
                        <TotalCell
                            total={withdrawalIDItem.total}
                            currency={withdrawalIDItem.currency}
                        />
                        {!!onDownArrowClick && (
                            <ExpandCollapseArrowButton
                                isExpanded={isExpanded ?? false}
                                onPress={onDownArrowClick}
                            />
                        )}
                    </View>
                )}
            </View>
            {settlementStatus === CONST.SEARCH.SETTLEMENT_STATUS.FAILED && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.ph3, styles.pb1]}>
                    <Icon
                        src={expensifyIcons.DotIndicator}
                        fill={theme.danger}
                        height={variables.iconSizeExtraSmall}
                        width={variables.iconSizeExtraSmall}
                    />
                    <View style={[styles.pre, styles.flexShrink1]}>
                        <RenderHTML html={`<rbr shouldShowEllipsis="1" issmall >${failedErrorHTML}</rbr>`} />
                    </View>
                </View>
            )}
        </View>
    );
}

export default WithdrawalIDListItemHeader;
