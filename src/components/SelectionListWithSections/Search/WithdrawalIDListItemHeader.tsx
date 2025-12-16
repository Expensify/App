import React, {useMemo} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import {PressableWithFeedback} from '@components/Pressable';
import RenderHTML from '@components/RenderHTML';
import type {ListItem, TransactionWithdrawalIDGroupListItemType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getSettlementStatus, getSettlementStatusBadgeProps} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
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
}: WithdrawalIDListItemHeaderProps<TItem>) {
    const {isLargeScreenWidth} = useResponsiveLayout();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow', 'DotIndicator']);

    const {icon, iconSize, iconStyles} = getBankIcon({bankName: withdrawalIDItem.bankName, styles});
    const formattedBankName = CONST.BANK_NAMES_USER_FRIENDLY[withdrawalIDItem.bankName] ?? CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.GENERIC_BANK];
    const formattedWithdrawalDate = DateUtils.formatWithUTCTimeZone(
        withdrawalIDItem.debitPosted,
        DateUtils.doesDateBelongToAPastYear(withdrawalIDItem.debitPosted) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
    );
    const badgeProps = useMemo(() => getSettlementStatusBadgeProps(withdrawalIDItem.state, translate, theme), [withdrawalIDItem.state, translate, theme]);
    const settlementStatus = useMemo(() => getSettlementStatus(withdrawalIDItem.state), [withdrawalIDItem.state]);
    const withdrawalInfoText = translate('settlement.withdrawalInfo', {date: formattedWithdrawalDate, withdrawalID: withdrawalIDItem.entryID});
    const failedErrorHTML = useMemo(() => {
        if (settlementStatus !== CONST.SEARCH.SETTLEMENT_STATUS.FAILED) {
            return '';
        }
        const walletLink = `${environmentURL}/${ROUTES.SETTINGS_WALLET}`;
        return translate('settlement.failedError', {link: walletLink});
    }, [settlementStatus, environmentURL, translate]);

    return (
        <View>
            <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
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
                </View>
                <View style={[styles.flexShrink0, styles.mr3, styles.gap1]}>
                    <TotalCell
                        total={withdrawalIDItem.total}
                        currency={withdrawalIDItem.currency}
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
                                        src={isExpanded ? expensifyIcons.UpArrow : expensifyIcons.DownArrow}
                                        fill={theme.icon}
                                        additionalStyles={!hovered && styles.opacitySemiTransparent}
                                        small
                                    />
                                )}
                            </PressableWithFeedback>
                        </View>
                    )}
                </View>
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

WithdrawalIDListItemHeader.displayName = 'WithdrawalIDListItemHeader';

export default WithdrawalIDListItemHeader;
