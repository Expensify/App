import {render} from '@testing-library/react-native';

import AccountAvatar from '@components/Avatar/connected/AccountAvatar';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {ViewStyle} from 'react-native';

import React from 'react';

const ACCOUNT_ID = 42;
const OTHER_ACCOUNT_ID = 7;
const AVATAR_URL = 'https://example.com/uploaded-avatar.png';
const LOGIN = 'john@example.com';
const OTHER_LOGIN = 'jane@example.com';
const CUSTOM_CONTAINER_STYLE = {borderRadius: 20};
const EMPTY_CONTAINER_STYLE: ViewStyle[] = [];

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

    it.each([
        ['the personal-details context', {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, avatar: AVATAR_URL}}, AVATAR_URL, LOGIN, LOGIN],
        ['the fallback avatar when the account has details but no avatar', {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN}}, MockFallbackAvatar, LOGIN, LOGIN],
        ['the fallback avatar and an empty name when the account has no personal details', {}, MockFallbackAvatar, '', undefined],
    ])('should resolve the icon from %s', (_case, personalDetails, expectedSource, expectedName, expectedDisplayName) => {
        mockPersonalDetails = personalDetails;

        render(<AccountAvatar accountID={ACCOUNT_ID} />);

        expect(mockCapturedSingleAvatarProps.avatar).toEqual({
            id: ACCOUNT_ID,
            type: CONST.ICON_TYPE_AVATAR,
            source: expectedSource,
            name: expectedName,
            displayName: expectedDisplayName,
            fallbackIcon: undefined,
        });
    });

    it('should render a placeholder icon for the placeholder account ID, so the slot keeps its size', () => {
        render(<AccountAvatar accountID={CONST.DEFAULT_NUMBER_ID} />);

        expect(mockCapturedSingleAvatarProps.avatar).toEqual({
            id: CONST.DEFAULT_NUMBER_ID,
            type: CONST.ICON_TYPE_AVATAR,
            source: MockFallbackAvatar,
            name: '',
            fallbackIcon: undefined,
        });
    });

    it('should resolve the icon again when the account changes', () => {
        mockPersonalDetails = {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, avatar: AVATAR_URL},
            [OTHER_ACCOUNT_ID]: {accountID: OTHER_ACCOUNT_ID, login: OTHER_LOGIN},
        };

        const {rerender} = render(<AccountAvatar accountID={ACCOUNT_ID} />);
        rerender(<AccountAvatar accountID={OTHER_ACCOUNT_ID} />);

        expect(mockCapturedSingleAvatarProps.avatar).toEqual(expect.objectContaining({id: OTHER_ACCOUNT_ID, name: OTHER_LOGIN, source: MockFallbackAvatar}));
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

    it.each([
        ['a style object', CUSTOM_CONTAINER_STYLE],
        // An empty array is a deliberate "no container styles" request, so it must win over the size-derived default
        ['an empty style array', EMPTY_CONTAINER_STYLE],
    ])('should replace the derived container styles when containerStyle is %s', (_case, containerStyle) => {
        render(
            <AccountAvatar
                accountID={ACCOUNT_ID}
                containerStyle={containerStyle}
            />,
        );

        expect(mockCapturedSingleAvatarProps.containerStyles).toBe(containerStyle);
        expect(mockGetContainerStyles).not.toHaveBeenCalled();
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
