import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import type {ListItem, TransactionCardGroupListItemType} from '@components/SelectionList/types';
import SubscriptAvatar from '@components/SubscriptAvatar';
import type {SubIcon} from '@components/SubscriptAvatar';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardFeedIcon} from '@libs/CardUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {CompanyCardFeed} from '@src/types/onyx/CardFeeds';
import {Icon} from '@src/types/onyx/OnyxCommon';

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

function CardListItemHeader<TItem extends ListItem>({card: cardItem, onCheckboxPress, isDisabled, canSelectMultiple}: CardListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useThemeIllustrations();

    const formattedDisplayName = formatPhoneNumber(getDisplayNameOrDefault(cardItem));

    const memberAvatar: Icon = {
        source: cardItem.avatar,
        type: CONST.ICON_TYPE_AVATAR,
        name: formattedDisplayName,
        id: cardItem.accountID,
    };

    const cardIcon: SubIcon = {
        source: getCardFeedIcon(cardItem.bank as CompanyCardFeed, illustrations),
        width: variables.cardAvatarWidth,
        height: variables.cardAvatarHeight,
    };

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
                            accessibilityLabel={translate('common.select')}
                        />
                    )}
                    <View style={[styles.flexRow, styles.gap3]}>
                        <SubscriptAvatar
                            mainAvatar={memberAvatar}
                            subscriptIcon={cardIcon}
                        />
                        <View style={[styles.gapHalf]}>
                            <TextWithTooltip
                                text={formattedDisplayName}
                                style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}
                            />
                            <TextWithTooltip
                                text={`${cardItem.cardName} • ${cardItem.lastFourPAN}`}
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
