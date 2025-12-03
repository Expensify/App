import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import type {ListItem, TransactionMemberGroupListItemType} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import ExpensesCell from './ExpensesCell';
import TotalCell from './TotalCell';

type MemberListItemHeaderProps<TItem extends ListItem> = {
    /** The member currently being looked at */
    member: TransactionMemberGroupListItemType;

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

function MemberListItemHeader<TItem extends ListItem>({
    member: memberItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
}: MemberListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {translate, formatPhoneNumber} = useLocalize();
    const [formattedDisplayName, formattedLogin] = useMemo(
        () => [formatPhoneNumber(getDisplayNameOrDefault(memberItem)), formatPhoneNumber(memberItem.login ?? '')],
        [memberItem, formatPhoneNumber],
    );

    if (!isLargeScreenWidth) {
        return (
            <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    <Checkbox
                        onPress={() => onCheckboxPress?.(memberItem as unknown as TItem)}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        disabled={!!isDisabled || memberItem.isDisabledCheckbox}
                        accessibilityLabel={translate('common.select')}
                    />
                    <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                        <UserDetailsTooltip accountID={memberItem.accountID}>
                            <View>
                                <Avatar
                                    source={memberItem.avatar}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    name={formattedDisplayName}
                                    avatarID={memberItem.accountID}
                                />
                            </View>
                        </UserDetailsTooltip>
                        <View style={[styles.gap1, styles.flexShrink1]}>
                            <TextWithTooltip
                                text={formattedDisplayName}
                                style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                            />
                            <TextWithTooltip
                                text={formattedLogin || formattedDisplayName}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        </View>
                    </View>
                </View>
                <View style={[styles.flexShrink0, styles.mr3, styles.gap1]}>
                    <TotalCell
                        total={memberItem.total}
                        currency={memberItem.currency}
                    />
                    {!!onDownArrowClick && (
                        <ExpandCollapseArrowButton
                            isExpanded={isExpanded ?? false}
                            onPress={onDownArrowClick}
                        />
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pl3]}>
            <Checkbox
                onPress={() => onCheckboxPress?.(memberItem as unknown as TItem)}
                isChecked={isSelectAllChecked}
                isIndeterminate={isIndeterminate}
                disabled={!!isDisabled || memberItem.isDisabledCheckbox}
                accessibilityLabel={translate('common.select')}
                style={[styles.mr1]}
            />
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)]}>
                <UserDetailsTooltip accountID={memberItem.accountID}>
                    <View>
                        <Avatar
                            source={memberItem.avatar}
                            type={CONST.ICON_TYPE_AVATAR}
                            name={formattedDisplayName}
                            avatarID={memberItem.accountID}
                        />
                    </View>
                </UserDetailsTooltip>
            </View>
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                <View style={[styles.gap1, styles.flexShrink1]}>
                    <TextWithTooltip
                        text={formattedDisplayName}
                        style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                    />
                    <TextWithTooltip
                        text={formattedLogin || formattedDisplayName}
                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                    />
                </View>
            </View>
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPENSES)]}>
                <ExpensesCell count={memberItem.count} />
            </View>
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL)]}>
                <TotalCell
                    total={memberItem.total}
                    currency={memberItem.currency}
                />
            </View>
        </View>
    );
}

MemberListItemHeader.displayName = 'MemberListItemHeader';

export default MemberListItemHeader;
