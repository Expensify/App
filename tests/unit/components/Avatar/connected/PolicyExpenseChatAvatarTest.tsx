import {render, screen} from '@testing-library/react-native';

import PolicyExpenseChatAvatar from '@components/Avatar/connected/PolicyExpenseChatAvatar';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';

import React from 'react';

const REPORT_ID = 'report123';
const POLICY_ID = 'policy123';
const POLICY_NAME = 'Acme Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const REPORT_POLICY_NAME = 'Carried Workspace';
const REPORT_POLICY_AVATAR_URL = 'https://example.com/report-policy-avatar.png';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
const SUBSCRIPT_CONTAINER_STYLE = {marginRight: 0};
const HORIZONTAL_STACKING = {maxRows: 2, overlapDivider: 4};
const HIDDEN_NAME_KEY = 'common.hidden';

const OWNER_ACCOUNT_ID = 42;
const OWNER_LOGIN = 'john@example.com';
const OWNER_DISPLAY_NAME = 'John Doe';
const OWNER_AVATAR_URL = 'https://example.com/owner-avatar.png';

// Stands in for the bundled fallback SVG so a resolved account icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

const WORKSPACE_ICON = {id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: POLICY_AVATAR_URL, name: POLICY_NAME};
const OWNER_ICON = {id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: OWNER_AVATAR_URL, name: OWNER_DISPLAY_NAME, fallbackIcon: undefined};
// The unknown account, standing in for a missing workspace or member
const PLACEHOLDER_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''};

// Capture the props handed to each layout primitive: the routing and the icons are this component's whole contract.
let mockCapturedHorizontalAvatarsProps: Record<string, unknown> = {};
let mockCapturedSubscriptAvatarProps: Record<string, unknown> = {};
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads two Onyx rows. Serving them from a map keeps the test free of Onyx setup, seeding and clearing.
let mockOnyxData: Record<string, unknown> = {};

jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = mockOnyxData[key];
    return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
});

jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getContainerStyles: mockGetContainerStyles})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
    })),
);

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

jest.mock('@components/Avatar/layouts/HorizontalAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedHorizontalAvatarsProps = props;
        return <View testID="MockedHorizontalAvatars" />;
    };
});

jest.mock('@components/Avatar/layouts/SubscriptAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSubscriptAvatarProps = props;
        return <View testID="MockedSubscriptAvatar" />;
    };
});

jest.mock('@components/Avatar/layouts/SingleAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSingleAvatarProps = props;
        return <View testID="MockedSingleAvatar" />;
    };
});

const policy: Partial<Policy> = {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL};

/** Serves the chat row and its policy row from the map, so a test only declares what exists. `null` leaves the policy row out. */
const seedChat = (reportOverrides: Partial<Report> = {}, policyRow: Partial<Policy> | null = policy) => {
    mockOnyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            ownerAccountID: OWNER_ACCOUNT_ID,
            policyID: POLICY_ID,
            ...reportOverrides,
        },
        ...(policyRow ? {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policyRow} : {}),
    };
};

describe('PolicyExpenseChatAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedHorizontalAvatarsProps = {};
        mockCapturedSubscriptAvatarProps = {};
        mockCapturedSingleAvatarProps = {};
        mockOnyxData = {};
        mockPersonalDetails = {
            [OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, login: OWNER_LOGIN, displayName: OWNER_DISPLAY_NAME, avatar: OWNER_AVATAR_URL},
        };
    });

    it('should render the workspace icon with the member as the subscript', () => {
        // Given a policy expense chat whose member has personal details
        seedChat();

        // When it renders with every prop
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                containerStyle={CONTAINER_STYLE}
                subscriptContainerStyle={SUBSCRIPT_CONTAINER_STYLE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the subscript layout gets the workspace as the primary avatar, the member named by display name as the subscript, and the subscript container style
        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSingleAvatar')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('MockedHorizontalAvatars')).not.toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps).toEqual({
            primaryAvatar: WORKSPACE_ICON,
            secondaryAvatar: OWNER_ICON,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: SUBSCRIPT_CONTAINER_STYLE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['without a display name', {accountID: OWNER_ACCOUNT_ID, login: OWNER_LOGIN, avatar: OWNER_AVATAR_URL}, {source: OWNER_AVATAR_URL, name: OWNER_LOGIN}],
        ['without personal details', undefined, {source: getDefaultAvatarURL({accountID: OWNER_ACCOUNT_ID}), name: HIDDEN_NAME_KEY}],
    ])('should name and picture the member like the legacy component %s', (_case, ownerDetails, expectedIcon) => {
        // Given a policy expense chat whose member is missing part of their personal details
        seedChat();
        mockPersonalDetails = ownerDetails ? {[OWNER_ACCOUNT_ID]: ownerDetails} : {};

        // When it renders
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the member keeps the subscript, named by login and then "Hidden", with a default avatar seeded from the account ID rather than the generic fallback
        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual({id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, fallbackIcon: undefined, ...expectedIcon});
    });

    it('should fall back to the unknown account as the primary avatar for a chat without a policyID', () => {
        // Given a policy expense chat that carries no policyID, so there is no workspace to show
        seedChat({policyID: undefined});

        // When it renders
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the member is still the subscript, under the generic fallback avatar rather than an unavailable workspace icon, as in the legacy component
        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual(PLACEHOLDER_ICON);
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(OWNER_ICON);
    });

    it.each([
        ['no member and the given container style', undefined, CONTAINER_STYLE, CONTAINER_STYLE],
        ['no member and the size-derived container styles', undefined, undefined, [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}]],
        ['the unknown member and the given container style', CONST.DEFAULT_NUMBER_ID, CONTAINER_STYLE, CONTAINER_STYLE],
        ['the unknown member and the size-derived container styles', CONST.DEFAULT_NUMBER_ID, undefined, [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}]],
    ])('should render the workspace icon alone with %s', (_case, ownerAccountID, containerStyle, expectedContainerStyles) => {
        // Given a policy expense chat without a member to nest as the subscript
        seedChat({ownerAccountID});

        // When it renders
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={containerStyle}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the single layout gets the workspace icon, with the given container style replacing the size-derived one
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSubscriptAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toEqual({
            avatar: WORKSPACE_ICON,
            size: CONST.AVATAR_SIZE.DEFAULT,
            containerStyles: expectedContainerStyles,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ["the stack's defaults", true, {}],
        ['the given stacking options', HORIZONTAL_STACKING, HORIZONTAL_STACKING],
    ])('should stack the workspace icon and then the member horizontally with %s', (_case, horizontalStacking, expectedStackingOptions) => {
        // Given a policy expense chat
        seedChat();

        // When it renders inside a horizontal stack without a sort
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.XXXX_LARGE}
                horizontalStacking={horizontalStacking}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the horizontal layout gets the stacking options and the workspace icon leads the row
        expect(screen.getByTestId('MockedHorizontalAvatars')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSubscriptAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedHorizontalAvatarsProps).toEqual({
            ...expectedStackingOptions,
            size: CONST.AVATAR_SIZE.XXXX_LARGE,
            icons: [WORKSPACE_ICON, OWNER_ICON],
            isInReportAction: false,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should apply the sort to a horizontal stack', () => {
        // Given a policy expense chat
        seedChat();

        // When it renders inside a horizontal stack, reversed
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                horizontalStacking
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );

        // Then the member leads the row instead
        expect(mockCapturedHorizontalAvatarsProps.icons).toEqual([OWNER_ICON, WORKSPACE_ICON]);
    });

    it('should still stack both avatars horizontally without a member', () => {
        // Given a policy expense chat without a member
        seedChat({ownerAccountID: undefined});

        // When it renders inside a horizontal stack
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                horizontalStacking
            />,
        );

        // Then the stack keeps both slots, with the unknown account in the member's
        expect(screen.getByTestId('MockedHorizontalAvatars')).toBeOnTheScreen();
        expect(mockCapturedHorizontalAvatarsProps.icons).toEqual([WORKSPACE_ICON, PLACEHOLDER_ICON]);
    });

    it('should resolve the workspace icon from the fields carried on the chat while its policy row is missing', () => {
        // Given a policy expense chat whose policy row has not loaded, but which carries the policy name and avatar itself
        seedChat({policyName: REPORT_POLICY_NAME, policyAvatar: REPORT_POLICY_AVATAR_URL}, null);

        // When it renders
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the primary avatar is built from the carried fields
        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: REPORT_POLICY_AVATAR_URL, name: REPORT_POLICY_NAME});
    });

    it('should render the unknown account alone while the chat row has not loaded', () => {
        // Given no chat row in Onyx
        mockOnyxData = {};

        // When it renders
        render(
            <PolicyExpenseChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then there is neither a workspace nor a member, so the single layout gets the generic fallback avatar, as in the legacy component
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(PLACEHOLDER_ICON);
    });
});
