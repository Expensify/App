import {render, screen} from '@testing-library/react-native';

import RoomAvatar from '@components/Avatar/connected/RoomAvatar';

import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import type {ViewStyle} from 'react-native';

import React from 'react';

const REPORT_ID = 'report123';
const POLICY_ID = 'policy123';
const POLICY_NAME = 'Acme Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const REPORT_POLICY_NAME = 'Carried Workspace';
const REPORT_OLD_POLICY_NAME = 'Old Workspace';
const REPORT_POLICY_AVATAR_URL = 'https://example.com/report-policy-avatar.png';
const ROOM_AVATAR_URL = 'https://example.com/room-avatar.png';
const DOMAIN_NAME = 'expensify.com';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
const SUBSCRIPT_CONTAINER_STYLE = {marginRight: 0};
// The emptied container styles the dispatcher passes inside a horizontal stack
const EMPTY_CONTAINER_STYLE: ViewStyle[] = [];
const SIZE_DERIVED_CONTAINER_STYLE = [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}];
const UNAVAILABLE_WORKSPACE_KEY = 'workspace.common.unavailable';

// Stands in for the bundled fallback SVG so the placeholder icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

const WORKSPACE_ICON = {id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: POLICY_AVATAR_URL, name: POLICY_NAME};
// The unknown account, standing in for a missing workspace
const PLACEHOLDER_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''};

// Capture the props handed to the single layout and to the invoice room leaf: the routing and the icons are this component's whole contract.
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};
let mockCapturedInvoiceRoomAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads the room and its policy row. Serving them from a map keeps the test free of Onyx setup, seeding and clearing.
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

jest.mock('@components/Avatar/layouts/SingleAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSingleAvatarProps = props;
        return <View testID="MockedSingleAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/InvoiceRoomAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedInvoiceRoomAvatarProps = props;
        return <View testID="MockedInvoiceRoomAvatar" />;
    };
});

const policy: Partial<Policy> = {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL};

/** Serves the room row and its policy row from the map, so a test only declares what exists. `null` leaves the policy row out. */
const seedRoom = (reportOverrides: Partial<Report> = {}, policyRow: Partial<Policy> | null = policy) => {
    mockOnyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            policyID: POLICY_ID,
            ...reportOverrides,
        },
        ...(policyRow ? {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policyRow} : {}),
    };
};

describe('RoomAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSingleAvatarProps = {};
        mockCapturedInvoiceRoomAvatarProps = {};
        mockOnyxData = {};
    });

    it.each([
        ['an admins room with the given container style', CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, CONTAINER_STYLE, CONTAINER_STYLE],
        ['an announce room with the size-derived container styles', CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, undefined, SIZE_DERIVED_CONTAINER_STYLE],
        ['a user-created room with the emptied container styles of a horizontal stack', CONST.REPORT.CHAT_TYPE.POLICY_ROOM, EMPTY_CONTAINER_STYLE, EMPTY_CONTAINER_STYLE],
    ] as const)('should render the workspace icon alone for %s', (_case, chatType, containerStyle, expectedContainerStyles) => {
        // Given a room whose policy row has loaded
        seedRoom({chatType});

        // When it renders
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={containerStyle}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the single layout gets the workspace icon, with the given container style replacing the size-derived one
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toEqual({
            avatar: WORKSPACE_ICON,
            size: CONST.AVATAR_SIZE.DEFAULT,
            containerStyles: expectedContainerStyles,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['its policy name and avatar', {policyName: REPORT_POLICY_NAME, policyAvatar: REPORT_POLICY_AVATAR_URL}, {name: REPORT_POLICY_NAME, source: REPORT_POLICY_AVATAR_URL}],
        ['its old policy name', {oldPolicyName: REPORT_OLD_POLICY_NAME}, {name: REPORT_OLD_POLICY_NAME, source: getDefaultWorkspaceAvatar(REPORT_OLD_POLICY_NAME)}],
        ['nothing', {}, {name: UNAVAILABLE_WORKSPACE_KEY, source: getDefaultWorkspaceAvatar(UNAVAILABLE_WORKSPACE_KEY)}],
    ])('should resolve the workspace icon from %s carried on the room while its policy row is missing', (_case, reportOverrides, expectedIcon) => {
        // Given a room whose policy row has not loaded
        seedRoom(reportOverrides, null);

        // When it renders
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the workspace icon is built from the fields carried on the room, and then "Unavailable workspace" with its default avatar
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, ...expectedIcon});
    });

    it("should use the default workspace avatar over the room's carried avatar when the policy has none", () => {
        // Given a room carrying a policy avatar, whose loaded policy row has no uploaded avatar
        seedRoom({policyAvatar: REPORT_POLICY_AVATAR_URL}, {...policy, avatarURL: ''});

        // When it renders
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the policy row wins and its missing avatar falls through to the default
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({...WORKSPACE_ICON, source: getDefaultWorkspaceAvatar(POLICY_NAME)});
    });

    it.each([
        ['a user-created room with an uploaded avatar', CONST.REPORT.CHAT_TYPE.POLICY_ROOM, ROOM_AVATAR_URL, ROOM_AVATAR_URL],
        ['a user-created room whose avatar was removed', CONST.REPORT.CHAT_TYPE.POLICY_ROOM, '', POLICY_AVATAR_URL],
        ['an admins room carrying an avatar', CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, ROOM_AVATAR_URL, POLICY_AVATAR_URL],
    ] as const)("should picture %s by the room's own avatar only when a member uploaded one", (_case, chatType, avatarUrl, expectedSource) => {
        // Given a room carrying its own avatar URL
        seedRoom({chatType, avatarUrl});

        // When it renders
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then only a user-created room with an uploaded avatar shows it; every other room keeps the workspace's avatar
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({...WORKSPACE_ICON, source: expectedSource});
    });

    it.each([
        ['named after its domain', `#${DOMAIN_NAME}`, {name: DOMAIN_NAME, source: getDefaultWorkspaceAvatar(DOMAIN_NAME)}],
        ['without a report name', undefined, {name: '', source: getDefaultWorkspaceAvatar()}],
    ])('should render the domain icon for a domain room %s', (_case, reportName, expectedIcon) => {
        // Given a domain room whose policy ID has a loaded policy row
        seedRoom({chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL, reportName});

        // When it renders
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the icon is built from the domain alone, ignoring the policy row
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, ...expectedIcon});
    });

    it.each([CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, CONST.REPORT.CHAT_TYPE.POLICY_ROOM, CONST.REPORT.CHAT_TYPE.DOMAIN_ALL])(
        'should fall back to the unknown account for a %s room without a policyID',
        (chatType) => {
            // Given a room that carries no policyID, so there is no workspace to show
            seedRoom({chatType, policyID: undefined, reportName: `#${DOMAIN_NAME}`});

            // When it renders
            render(
                <RoomAvatar
                    reportID={REPORT_ID}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />,
            );

            // Then the single layout gets the generic fallback avatar rather than an unavailable workspace icon
            expect(mockCapturedSingleAvatarProps.avatar).toEqual(PLACEHOLDER_ICON);
        },
    );

    it('should keep the fake policyID as the icon ID, which seeds the default avatar color', () => {
        // Given a room on the fake policy, which has no policy row but carries its policy name
        seedRoom({policyID: CONST.POLICY.ID_FAKE, policyName: REPORT_POLICY_NAME}, null);

        // When it renders
        render(
            <RoomAvatar
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

    it('should hand an invoice room to its leaf with every prop', () => {
        // Given an invoice room sent to a person
        const invoiceReceiver = {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 42};
        seedRoom({chatType: CONST.REPORT.CHAT_TYPE.INVOICE, invoiceReceiver});

        // When it renders with every prop
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                containerStyle={CONTAINER_STYLE}
                subscriptContainerStyle={SUBSCRIPT_CONTAINER_STYLE}
                horizontalStacking={{maxRows: 2}}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the leaf gets the receiver and the workspace icon to pair it with, and no single avatar renders here
        expect(screen.getByTestId('MockedInvoiceRoomAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSingleAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedInvoiceRoomAvatarProps).toEqual({
            invoiceReceiver,
            primaryAvatar: WORKSPACE_ICON,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: CONTAINER_STYLE,
            subscriptContainerStyle: SUBSCRIPT_CONTAINER_STYLE,
            horizontalStacking: {maxRows: 2},
            sort: CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should hand an invoice room without a policyID to its leaf with the unknown account', () => {
        // Given an invoice room that carries no policyID
        seedRoom({chatType: CONST.REPORT.CHAT_TYPE.INVOICE, policyID: undefined});

        // When it renders
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the leaf pairs the receiver with the generic fallback avatar
        expect(mockCapturedInvoiceRoomAvatarProps.primaryAvatar).toEqual(PLACEHOLDER_ICON);
    });

    it('should still render a non-invoice room alone inside a horizontal stack', () => {
        // Given a room whose policy row has loaded
        seedRoom();

        // When it renders inside a reversed horizontal stack, with the emptied container styles the dispatcher passes there
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={[]}
                horizontalStacking
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );

        // Then there is nothing to stack, so the single layout gets the workspace icon
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toMatchObject({avatar: WORKSPACE_ICON, containerStyles: []});
    });

    it('should render the unknown account alone while the room row has not loaded', () => {
        // Given no room row in Onyx
        mockOnyxData = {};

        // When it renders
        render(
            <RoomAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the single layout gets the generic fallback avatar
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(PLACEHOLDER_ICON);
    });
});
