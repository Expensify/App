import SubscriptCardFeedAvatar from '@components/Avatar/layouts/SubscriptCardFeedAvatar';

import CONST from '@src/CONST';
import type {CardFeed} from '@src/types/onyx/CardFeeds';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import useAccountIcons from './useAccountIcons';

type AccountAvatarWithCardFeedProps = {
    /** Account ID of the cardholder. `CONST.DEFAULT_NUMBER_ID` renders a placeholder avatar, so the card icon keeps its slot when the cardholder is unknown. */
    accountID: number;

    /** Card feed to display as the subscript */
    cardFeed: CardFeed;

    /** Size of the subscript card feed icon */
    cardFeedIconSize?: {width: number; height: number};

    /** Border color for the subscript card feed icon container */
    borderColor?: ColorValue;

    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;

    /** Container styles for the avatar */
    containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Renders one account's avatar with a card feed icon as its subscript, resolving the icon from the personal-details
 * context (zero Onyx subscriptions). Use for cardholder rows; reach for `AccountAvatar` when there is no card feed.
 */
function AccountAvatarWithCardFeed({
    accountID,
    cardFeed,
    cardFeedIconSize,
    borderColor,
    size = CONST.AVATAR_SIZE.DEFAULT,
    fallbackDisplayName,
    containerStyle,
}: AccountAvatarWithCardFeedProps) {
    const [icon] = useAccountIcons([accountID]);

    return (
        <SubscriptCardFeedAvatar
            primaryAvatar={icon}
            cardFeed={cardFeed}
            cardFeedIconSize={cardFeedIconSize}
            size={size}
            containerStyle={containerStyle}
            subscriptAvatarBorderColor={borderColor}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default AccountAvatarWithCardFeed;
