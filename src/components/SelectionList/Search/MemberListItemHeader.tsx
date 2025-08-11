import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import type {ListItem, TransactionMemberGroupListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';

type MemberListItemHeaderProps<TItem extends ListItem> = {
    /** The member currently being looked at */
    member: TransactionMemberGroupListItemType;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;
};

function MemberListItemHeader<TItem extends ListItem>({member: memberItem, onCheckboxPress, isDisabled, canSelectMultiple}: MemberListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    const [formattedDisplayName, formattedLogin] = useMemo(
        () => [formatPhoneNumber(getDisplayNameOrDefault(memberItem)), formatPhoneNumber(memberItem.login ?? '')],
        [memberItem, formatPhoneNumber],
    );

    // s77rt add total cell, action cell and collapse/expand button

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
                    <View style={[styles.flexRow, styles.gap3]}>
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
                        <View style={[styles.gapHalf]}>
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
            </View>
            <View style={[styles.pv2, styles.ph3]}>
                <View style={[styles.borderBottom]} />
            </View>
        </View>
    );
}

MemberListItemHeader.displayName = 'MemberListItemHeader';

export default MemberListItemHeader;
