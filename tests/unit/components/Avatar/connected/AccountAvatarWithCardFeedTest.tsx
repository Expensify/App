import {render} from '@testing-library/react-native';

import AccountAvatarWithCardFeed from '@components/Avatar/connected/AccountAvatarWithCardFeed';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {CardFeed} from '@src/types/onyx/CardFeeds';

import React from 'react';

const ACCOUNT_ID = 42;
const AVATAR_URL = 'https://example.com/uploaded-avatar.png';
const LOGIN = 'john@example.com';
const CARD_FEED = 'vcf' as CardFeed;
const CARD_FEED_ICON_SIZE = {width: 24, height: 16};
const CUSTOM_CONTAINER_STYLE = {borderRadius: 20};

// Stands in for the bundled fallback SVG so the resolved icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

// Captures the props handed to the layout primitive, which is the whole contract of this component.
let mockCapturedSubscriptCardFeedAvatarProps: Record<string, unknown> = {};

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

jest.mock('@components/Avatar/layouts/SubscriptCardFeedAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSubscriptCardFeedAvatarProps = props;
        return <View testID="MockedSubscriptCardFeedAvatar" />;
    };
});

describe('AccountAvatarWithCardFeed (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSubscriptCardFeedAvatarProps = {};
        mockPersonalDetails = {
            [ACCOUNT_ID]: {
                accountID: ACCOUNT_ID,
                login: LOGIN,
                avatar: AVATAR_URL,
            },
        };
    });

    it('should resolve the cardholder icon from the personal-details context', () => {
        render(
            <AccountAvatarWithCardFeed
                accountID={ACCOUNT_ID}
                cardFeed={CARD_FEED}
            />,
        );

        expect(mockCapturedSubscriptCardFeedAvatarProps.primaryAvatar).toEqual({
            id: ACCOUNT_ID,
            type: CONST.ICON_TYPE_AVATAR,
            source: AVATAR_URL,
            name: LOGIN,
            displayName: LOGIN,
            fallbackIcon: undefined,
        });
    });

    it('should keep the card feed over a placeholder avatar when the cardholder is unknown', () => {
        render(
            <AccountAvatarWithCardFeed
                accountID={CONST.DEFAULT_NUMBER_ID}
                cardFeed={CARD_FEED}
            />,
        );

        expect(mockCapturedSubscriptCardFeedAvatarProps.cardFeed).toBe(CARD_FEED);
        expect(mockCapturedSubscriptCardFeedAvatarProps.primaryAvatar).toEqual({
            id: CONST.DEFAULT_NUMBER_ID,
            type: CONST.ICON_TYPE_AVATAR,
            source: MockFallbackAvatar,
            name: '',
            fallbackIcon: undefined,
        });
    });

    it('should forward the card feed presentation props', () => {
        render(
            <AccountAvatarWithCardFeed
                accountID={ACCOUNT_ID}
                cardFeed={CARD_FEED}
                cardFeedIconSize={CARD_FEED_ICON_SIZE}
                borderColor="red"
                containerStyle={CUSTOM_CONTAINER_STYLE}
            />,
        );

        expect(mockCapturedSubscriptCardFeedAvatarProps).toEqual(
            expect.objectContaining({
                cardFeed: CARD_FEED,
                cardFeedIconSize: CARD_FEED_ICON_SIZE,
                backdropColor: 'red',
                containerStyle: CUSTOM_CONTAINER_STYLE,
            }),
        );
    });

    it.each([
        ['the default size when none is passed', undefined, CONST.AVATAR_SIZE.DEFAULT],
        ['the passed size', CONST.AVATAR_SIZE.SMALL, CONST.AVATAR_SIZE.SMALL],
    ])('should forward %s', (_case, size, expectedSize) => {
        render(
            <AccountAvatarWithCardFeed
                accountID={ACCOUNT_ID}
                cardFeed={CARD_FEED}
                size={size}
            />,
        );

        expect(mockCapturedSubscriptCardFeedAvatarProps.size).toBe(expectedSize);
    });

    it('should forward the tooltip fallback display name', () => {
        render(
            <AccountAvatarWithCardFeed
                accountID={ACCOUNT_ID}
                cardFeed={CARD_FEED}
                fallbackDisplayName="John Doe"
            />,
        );

        expect(mockCapturedSubscriptCardFeedAvatarProps.fallbackDisplayName).toBe('John Doe');
    });
});
