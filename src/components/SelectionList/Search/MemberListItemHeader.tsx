import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import type {ListItem, TransactionMemberGroupListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ActionCell from './ActionCell';
import TotalCell from './TotalCell';

type MemberListItemHeaderProps<TItem extends ListItem> = {
    /** The member currently being looked at */
    member: TransactionMemberGroupListItemType;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;
};

function MemberListItemHeader<TItem extends ListItem>({member: memberItem, onSelectRow, onCheckboxPress, isDisabled, canSelectMultiple}: MemberListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const [formattedDisplayName, formattedLogin] = useMemo(
        () => [formatPhoneNumber(getDisplayNameOrDefault(memberItem)), formatPhoneNumber(memberItem.login ?? '')],
        [memberItem, formatPhoneNumber],
    );
    const shouldShowAction = isLargeScreenWidth;

    return (
        <View>
            <View style={[styles.pv1Half, styles.ph3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(memberItem as unknown as TItem)}
                            isChecked={memberItem.isSelected}
                            disabled={!!isDisabled || memberItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                        />
                    )}
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
                        <View style={[styles.gapHalf, styles.flexShrink1]}>
                            <TextWithTooltip
                                text={formattedDisplayName}
                                style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}
                            />
                            <TextWithTooltip
                                text={formattedLogin || formattedDisplayName}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        </View>
                    </View>
                </View>
                <View style={[styles.flexShrink0, styles.mr3]}>
                    <TotalCell
                        total={memberItem.total}
                        currency={memberItem.currency}
                    />
                </View>
                {shouldShowAction && (
                    <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                        <ActionCell
                            action={CONST.SEARCH.ACTION_TYPES.VIEW}
                            goToItem={() => onSelectRow(memberItem as unknown as TItem)}
                            isSelected={memberItem.isSelected}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

MemberListItemHeader.displayName = 'MemberListItemHeader';

export default MemberListItemHeader;
