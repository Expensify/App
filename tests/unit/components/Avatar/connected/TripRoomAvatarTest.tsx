import {render, screen} from '@testing-library/react-native';

import TripRoomAvatar from '@components/Avatar/connected/TripRoomAvatar';

import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import type {ViewStyle} from 'react-native';

import React from 'react';

const REPORT_ID = 'report123';
const CHAT_REPORT_ID = 'chat123';
const POLICY_ID = 'policy123';
const CHAT_POLICY_ID = 'chatPolicy123';
const POLICY_NAME = 'Acme Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const CHAT_POLICY_NAME = 'Travel Workspace';
const CHAT_POLICY_AVATAR_URL = 'https://example.com/travel-avatar.png';
const REPORT_POLICY_NAME = 'Carried Workspace';
const REPORT_OLD_POLICY_NAME = 'Old Workspace';
const UNAVAILABLE_WORKSPACE_KEY = 'workspace.common.unavailable';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
// The emptied container styles the dispatcher passes inside a horizontal stack
const EMPTY_CONTAINER_STYLE: ViewStyle[] = [];
const SIZE_DERIVED_CONTAINER_STYLE = [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}];
const HORIZONTAL_STACKING = {maxRows: 2, overlapDivider: 4};

// Stands in for the bundled fallback SVG so the placeholder icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

const WORKSPACE_ICON = {id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: POLICY_AVATAR_URL, name: POLICY_NAME};
// The unknown account, standing in for a missing workspace
const PLACEHOLDER_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''};
// The empty second slot of a horizontal stack
const BLANK_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: '', name: ''};

// Capture the props handed to each layout primitive: the routing and the icons are this component's whole contract.
let mockCapturedHorizontalAvatarsProps: Record<string, unknown> = {};
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads the trip room, its archive state, its linked chat and their policy. Serving them from a map keeps the test free of Onyx setup, seeding and clearing.
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

jest.mock('@components/Avatar/layouts/HorizontalAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedHorizontalAvatarsProps = props;
        return <View testID="MockedHorizontalAvatars" />;
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

/** Serves the trip room row, its policy row and its archive state from the map, so a test only declares what exists. `null` leaves the policy row out. */
const seedTripRoom = (reportOverrides: Partial<Report> = {}, policyRow: Partial<Policy> | null = policy, isArchived = false) => {
    mockOnyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
            policyID: POLICY_ID,
            ...reportOverrides,
        },
        ...(policyRow ? {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policyRow} : {}),
        ...(isArchived ? {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID}`]: {private_isArchived: '2026-01-01 00:00:00'}} : {}),
    };
};

describe('TripRoomAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedHorizontalAvatarsProps = {};
        mockCapturedSingleAvatarProps = {};
        mockOnyxData = {};
    });

    it.each([
        ['an active trip room', false, WORKSPACE_ICON, CONTAINER_STYLE, CONTAINER_STYLE],
        ['an active trip room with the size-derived container styles', false, WORKSPACE_ICON, undefined, SIZE_DERIVED_CONTAINER_STYLE],
        ['an archived trip room', true, WORKSPACE_ICON, CONTAINER_STYLE, CONTAINER_STYLE],
    ])('should render the workspace alone for %s outside a horizontal stack', (_case, isArchived, expectedAvatar, containerStyle, expectedContainerStyles) => {
        // Given a trip room that isn't linked to its trip preview
        seedTripRoom({}, policy, isArchived);

        // When it renders outside a horizontal stack
        render(
            <TripRoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={containerStyle}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the single layout gets the workspace icon, with the given container style replacing the size-derived one
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toEqual({
            avatar: expectedAvatar,
            size: CONST.AVATAR_SIZE.DEFAULT,
            containerStyles: expectedContainerStyles,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ["the stack's defaults and a workspace", true, {}, {}, [WORKSPACE_ICON, BLANK_ICON]],
        ['the given stacking options and a workspace', HORIZONTAL_STACKING, HORIZONTAL_STACKING, {}, [WORKSPACE_ICON, BLANK_ICON]],
        ["the stack's defaults and no workspace", true, {}, {policyID: undefined}, [PLACEHOLDER_ICON, BLANK_ICON]],
    ])('should stack an active trip room horizontally with %s', (_case, horizontalStacking, expectedStackingOptions, reportOverrides, expectedIcons) => {
        // Given an active trip room that isn't linked to its trip preview
        seedTripRoom(reportOverrides);

        // When it renders inside a horizontal stack without a sort
        render(
            <TripRoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.XXXX_LARGE}
                containerStyle={EMPTY_CONTAINER_STYLE}
                horizontalStacking={horizontalStacking}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the horizontal layout gets the stacking options, with the workspace leading and an empty second slot where the traveler would be
        expect(screen.getByTestId('MockedHorizontalAvatars')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSingleAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedHorizontalAvatarsProps).toEqual({
            ...expectedStackingOptions,
            size: CONST.AVATAR_SIZE.XXXX_LARGE,
            icons: expectedIcons,
            isInReportAction: false,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['with a workspace', {}, WORKSPACE_ICON],
        ['without a workspace', {policyID: undefined}, PLACEHOLDER_ICON],
    ])('should render an archived trip room %s alone inside a horizontal stack', (_case, reportOverrides, expectedAvatar) => {
        // Given an archived trip room
        seedTripRoom(reportOverrides, policy, true);

        // When it renders inside a horizontal stack, with the emptied container styles the dispatcher passes there
        render(
            <TripRoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={EMPTY_CONTAINER_STYLE}
                horizontalStacking={HORIZONTAL_STACKING}
            />,
        );

        // Then it doesn't stack, so the single layout gets its own avatar without container styles
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedHorizontalAvatars')).not.toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toMatchObject({avatar: expectedAvatar, containerStyles: []});
    });

    it('should render the unknown account alone for a trip room without a policyID', () => {
        // Given an active trip room that carries no policyID, so there is no workspace to show
        seedTripRoom({policyID: undefined});

        // When it renders outside a horizontal stack
        render(
            <TripRoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the single layout gets the generic fallback avatar
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(PLACEHOLDER_ICON);
    });

    it.each([
        ['its policy name', {policyName: REPORT_POLICY_NAME}, REPORT_POLICY_NAME],
        ['its old policy name', {oldPolicyName: REPORT_OLD_POLICY_NAME}, REPORT_OLD_POLICY_NAME],
        ['nothing', {}, UNAVAILABLE_WORKSPACE_KEY],
    ])('should name the workspace from %s carried on the trip room while its policy row is missing', (_case, reportOverrides, expectedName) => {
        // Given a trip room whose policy row has not loaded
        seedTripRoom(reportOverrides, null);

        // When it renders
        render(
            <TripRoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the workspace icon is named from the fields carried on the trip room, and then "Unavailable workspace", with the default avatar for that name
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, name: expectedName, source: getDefaultWorkspaceAvatar(expectedName)});
    });

    it("should picture the linked chat's workspace while keeping the trip room's policyID as the icon ID", () => {
        // Given a trip room linked to a chat on a different workspace
        seedTripRoom({chatReportID: CHAT_REPORT_ID});
        mockOnyxData[`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`] = {reportID: CHAT_REPORT_ID, policyID: CHAT_POLICY_ID};
        mockOnyxData[`${ONYXKEYS.COLLECTION.POLICY}${CHAT_POLICY_ID}`] = {id: CHAT_POLICY_ID, name: CHAT_POLICY_NAME, avatarURL: CHAT_POLICY_AVATAR_URL};

        // When it renders
        render(
            <TripRoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the linked chat's workspace is pictured, while the raw policyID still seeds the color and the tooltip
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, name: CHAT_POLICY_NAME, source: CHAT_POLICY_AVATAR_URL});
    });

    it('should keep the fake policyID as the icon ID', () => {
        // Given a trip room on the fake policy, which has no policy row but carries its policy name
        seedTripRoom({policyID: CONST.POLICY.ID_FAKE, policyName: REPORT_POLICY_NAME}, null);

        // When it renders
        render(
            <TripRoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the icon keeps the raw policyID, which seeds its color and tooltip
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({
            id: CONST.POLICY.ID_FAKE,
            type: CONST.ICON_TYPE_WORKSPACE,
            name: REPORT_POLICY_NAME,
            source: getDefaultWorkspaceAvatar(REPORT_POLICY_NAME),
        });
    });

    it('should apply the sort to a horizontal stack', () => {
        // Given an active trip room
        seedTripRoom();

        // When it renders inside a reversed horizontal stack
        render(
            <TripRoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                horizontalStacking
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );

        // Then the empty slot leads the row
        expect(mockCapturedHorizontalAvatarsProps.icons).toEqual([BLANK_ICON, WORKSPACE_ICON]);
    });
});
