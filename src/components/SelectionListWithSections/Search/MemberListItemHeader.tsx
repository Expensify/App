import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import type {ListItem, TransactionMemberGroupListItemType} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
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
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {translate, formatPhoneNumber} = useLocalize();
    const [formattedDisplayName, formattedLogin] = useMemo(
        () => [formatPhoneNumber(getDisplayNameOrDefault(memberItem)), formatPhoneNumber(memberItem.login ?? '')],
        [memberItem, formatPhoneNumber],
    );

    return (
        <View>
            <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(memberItem as unknown as TItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
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
                                        src={isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow}
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
        </View>
    );
}

export default MemberListItemHeader;
