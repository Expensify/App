import {render} from '@testing-library/react-native';

import AccountAvatar from '@components/Avatar/connected/AccountAvatar';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';

import React from 'react';

const ACCOUNT_ID = 42;
const AVATAR_URL = 'https://example.com/uploaded-avatar.png';
const LOGIN = 'john@example.com';
const CUSTOM_CONTAINER_STYLE = {borderRadius: 20};

// Stands in for the bundled fallback SVG so the resolved icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

// Captures the props `AccountAvatar` hands to the layout primitive, which is the whole contract of this component.
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getContainerStyles: mockGetContainerStyles})));

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

jest.mock('@components/Avatar/layouts/SingleAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSingleAvatarProps = props;
        return <View testID="MockedSingleAvatar" />;
    };
});

describe('AccountAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSingleAvatarProps = {};
        mockPersonalDetails = {
            [ACCOUNT_ID]: {
                accountID: ACCOUNT_ID,
                login: LOGIN,
                avatar: AVATAR_URL,
            },
        };
    });

    it('should resolve the icon for the account from the personal-details context', () => {
        render(<AccountAvatar accountID={ACCOUNT_ID} />);

        expect(mockCapturedSingleAvatarProps.avatar).toEqual({
            id: ACCOUNT_ID,
            type: CONST.ICON_TYPE_AVATAR,
            source: AVATAR_URL,
            name: LOGIN,
            fallbackIcon: undefined,
        });
    });

    it('should fall back to the default fallback avatar for an account with no personal details', () => {
        mockPersonalDetails = {};

        render(<AccountAvatar accountID={ACCOUNT_ID} />);

        expect(mockCapturedSingleAvatarProps.avatar).toEqual({
            id: ACCOUNT_ID,
            type: CONST.ICON_TYPE_AVATAR,
            source: MockFallbackAvatar,
            name: '',
            fallbackIcon: undefined,
        });
    });

    it.each([
        ['the default size when none is passed', undefined, CONST.AVATAR_SIZE.DEFAULT],
        ['the passed size', CONST.AVATAR_SIZE.SMALL, CONST.AVATAR_SIZE.SMALL],
    ])('should derive the container styles from %s', (_case, size, expectedSize) => {
        render(
            <AccountAvatar
                accountID={ACCOUNT_ID}
                size={size}
            />,
        );

        expect(mockGetContainerStyles).toHaveBeenCalledWith(expectedSize);
        expect(mockCapturedSingleAvatarProps.size).toBe(expectedSize);
        expect(mockCapturedSingleAvatarProps.containerStyles).toEqual(mockGetContainerStyles(expectedSize));
    });

    it('should replace the derived container styles when containerStyle is passed', () => {
        render(
            <AccountAvatar
                accountID={ACCOUNT_ID}
                containerStyle={CUSTOM_CONTAINER_STYLE}
            />,
        );

        expect(mockCapturedSingleAvatarProps.containerStyles).toBe(CUSTOM_CONTAINER_STYLE);
    });

    it.each([
        ['default to showing the tooltip', undefined, true],
        ['forward an explicit tooltip opt-out', false, false],
    ])('should %s', (_case, shouldShowTooltip, expected) => {
        render(
            <AccountAvatar
                accountID={ACCOUNT_ID}
                shouldShowTooltip={shouldShowTooltip}
            />,
        );

        expect(mockCapturedSingleAvatarProps.shouldShowTooltip).toBe(expected);
    });

    it('should forward the tooltip fallback display name', () => {
        render(
            <AccountAvatar
                accountID={ACCOUNT_ID}
                fallbackDisplayName="John Doe"
            />,
        );

        expect(mockCapturedSingleAvatarProps.fallbackDisplayName).toBe('John Doe');
    });
});
