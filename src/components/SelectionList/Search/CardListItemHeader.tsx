import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import type {ListItem, TransactionCardGroupListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type CardListItemHeaderProps<TItem extends ListItem> = {
    /** The card currently being looked at */
    card: TransactionCardGroupListItemType;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;
};

// s77rt TODO

function CardListItemHeader<TItem extends ListItem>({card: cardItem, onCheckboxPress, isDisabled, canSelectMultiple}: CardListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();

    // s77rt add total cell, action cell and collapse/expand button

    return (
        <View>
            <View style={[styles.pv1Half, styles.ph3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(cardItem as unknown as TItem)}
                            isChecked={cardItem.isSelected}
                            disabled={!!isDisabled || cardItem.isDisabledCheckbox}
                            accessibilityLabel={cardItem.text ?? ''}
                        />
                    )}
                    <View style={[styles.flexRow, styles.gap3]}>
                        <UserDetailsTooltip accountID={cardItem.accountID}>
                            <View>
                                <Avatar
                                    source={cardItem.avatar}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    name={cardItem.displayName ?? cardItem.login}
                                    avatarID={cardItem.accountID}
                                />
                            </View>
                        </UserDetailsTooltip>
                        <View style={[styles.gapHalf]}>
                            <TextWithTooltip
                                text={cardItem.displayName ?? cardItem.login ?? ''}
                                style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}
                            />
                            <TextWithTooltip
                                text={cardItem.login ?? ''}
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

CardListItemHeader.displayName = 'CardListItemHeader';

export default CardListItemHeader;
