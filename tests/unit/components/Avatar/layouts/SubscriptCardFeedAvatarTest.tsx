import {render, screen} from '@testing-library/react-native';

import SubscriptCardFeedAvatar from '@components/Avatar/layouts/SubscriptCardFeedAvatar';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

const USER_ICON: Icon = {id: 1, name: 'Alice', source: 'https://example.com/alice.png', type: CONST.ICON_TYPE_AVATAR};

// Stand in for the avatar image, whose own rendering is covered elsewhere, so only the subscript layout is under test.
jest.mock('@components/Avatar/AvatarFromIcon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module object
    const {View} = require('react-native');
    return ({testID}: {testID: string}) => <View testID={testID} />;
});

describe('SubscriptCardFeedAvatar', () => {
    it('should show the card-feed icon in the subscript slot instead of a secondary avatar', () => {
        // Given a cardholder whose card comes from a Visa feed
        // When the avatar renders with that card feed
        render(
            <SubscriptCardFeedAvatar
                primaryAvatar={USER_ICON}
                cardFeed={CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the cardholder keeps the main avatar and the subscript shows where the card comes from, so no workspace avatar competes with the card icon.
        // The card icon is decorative and hidden from screen readers, so its query has to include hidden elements.
        expect(screen.getByTestId('Avatar-Subscript')).toBeOnTheScreen();
        expect(screen.getByTestId('Avatar-Subscript-MainAvatar')).toBeOnTheScreen();
        expect(screen.getByTestId('Avatar-Subscript-CardIcon', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.queryByTestId('Avatar-Subscript-SecondaryAvatar')).not.toBeOnTheScreen();
    });
});
