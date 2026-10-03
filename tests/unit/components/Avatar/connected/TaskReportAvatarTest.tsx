import {render, screen} from '@testing-library/react-native';

import TaskReportAvatar from '@components/Avatar/connected/TaskReportAvatar';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';

import React from 'react';

const REPORT_ID = 'task123';
const PARENT_REPORT_ID = 'chat123';
const POLICY_ID = 'policy123';
const POLICY_NAME = 'Acme Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const PARENT_POLICY_NAME = 'Carried Workspace';
const PARENT_POLICY_AVATAR_URL = 'https://example.com/parent-policy-avatar.png';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
const SUBSCRIPT_CONTAINER_STYLE = {marginRight: 0};
const HORIZONTAL_STACKING = {maxRows: 2, overlapDivider: 4};
const HIDDEN_NAME_KEY = 'common.hidden';
const SIZE_DERIVED_CONTAINER_STYLES = [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}];

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

// Capture the props handed to each layout primitive: the routing and the icons are this component's whole contract.
let mockCapturedHorizontalAvatarsProps: Record<string, unknown> = {};
let mockCapturedSubscriptAvatarProps: Record<string, unknown> = {};
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads a handful of Onyx rows. Serving them from a map keeps the test free of Onyx setup, seeding and clearing.
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

type SeedOptions = {
    /** Fields overriding the task report row */
    reportOverrides?: Partial<Report>;

    /** Chat type of the chat the task was assigned in. A policy expense chat makes it a workspace task */
    parentChatType?: Report['chatType'];

    /** Fields overriding the parent chat row */
    parentOverrides?: Partial<Report>;

    /** Whether the task report is archived */
    isArchived?: boolean;

    /** The policy row. `null` leaves it out */
    policyRow?: Partial<Policy> | null;
};

/** Serves the task report, the chat it was assigned in, its archive state and its policy row from the map, so a test only declares what exists. */
const seedTask = ({reportOverrides = {}, parentChatType = CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, parentOverrides = {}, isArchived = false, policyRow = policy}: SeedOptions = {}) => {
    mockOnyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.TASK,
            ownerAccountID: OWNER_ACCOUNT_ID,
            parentReportID: PARENT_REPORT_ID,
            policyID: POLICY_ID,
            ...reportOverrides,
        },
        [`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`]: {
            reportID: PARENT_REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: parentChatType,
            policyID: POLICY_ID,
            ...parentOverrides,
        },
        [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID}`]: {private_isArchived: isArchived ? '2026-01-01 00:00:00.000' : ''},
        ...(policyRow ? {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policyRow} : {}),
    };
};

describe('TaskReportAvatar (connected)', () => {
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

    it('should render the owner with the workspace icon as the subscript for a workspace task', () => {
        // Given a task assigned in a workspace chat
        seedTask();

        // When it renders with every prop
        render(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                containerStyle={CONTAINER_STYLE}
                subscriptContainerStyle={SUBSCRIPT_CONTAINER_STYLE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the subscript layout gets the owner as the primary avatar, the workspace as the subscript, and the subscript container style
        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSingleAvatar')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('MockedHorizontalAvatars')).not.toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps).toEqual({
            primaryAvatar: OWNER_ICON,
            secondaryAvatar: WORKSPACE_ICON,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: SUBSCRIPT_CONTAINER_STYLE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ["the stack's defaults", true, undefined, {}, [OWNER_ICON, WORKSPACE_ICON]],
        ['the given stacking options', HORIZONTAL_STACKING, undefined, HORIZONTAL_STACKING, [OWNER_ICON, WORKSPACE_ICON]],
        ['a reversed sort', true, CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE, {}, [WORKSPACE_ICON, OWNER_ICON]],
    ])('should stack a workspace task horizontally with %s', (_case, horizontalStacking, sort, expectedStackingOptions, expectedIcons) => {
        // Given a task assigned in a workspace chat
        seedTask();

        // When it renders inside a horizontal stack
        render(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                horizontalStacking={horizontalStacking}
                sort={sort}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the horizontal layout gets the stacking options, with the owner leading the row unless the sort reorders it
        expect(screen.getByTestId('MockedHorizontalAvatars')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSubscriptAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedHorizontalAvatarsProps).toEqual({
            ...expectedStackingOptions,
            isHovered: false,
            size: CONST.AVATAR_SIZE.DEFAULT,
            icons: expectedIcons,
            isInReportAction: false,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['a task in a group chat with the given container style', CONST.REPORT.CHAT_TYPE.GROUP, false, undefined, CONTAINER_STYLE, CONTAINER_STYLE],
        ['a task in a room with the size-derived container styles', CONST.REPORT.CHAT_TYPE.POLICY_ROOM, false, undefined, undefined, SIZE_DERIVED_CONTAINER_STYLES],
        ['a task in a room inside a horizontal stack', CONST.REPORT.CHAT_TYPE.POLICY_ROOM, false, true, [], []],
        ['an archived workspace task', CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, true, undefined, undefined, SIZE_DERIVED_CONTAINER_STYLES],
        ['an archived workspace task inside a horizontal stack', CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, true, true, [], []],
    ])('should render the owner alone for %s', (_case, parentChatType, isArchived, horizontalStacking, containerStyle, expectedContainerStyles) => {
        // Given a task without a workspace icon to show, because it was not assigned in a workspace chat or it is archived
        seedTask({parentChatType, isArchived});

        // When it renders
        render(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={containerStyle}
                horizontalStacking={horizontalStacking}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the single layout gets the owner, even inside a horizontal stack, with the given container style replacing the size-derived one
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSubscriptAvatar')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('MockedHorizontalAvatars')).not.toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toEqual({
            avatar: OWNER_ICON,
            size: CONST.AVATAR_SIZE.DEFAULT,
            containerStyles: expectedContainerStyles,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        [
            'without personal details',
            OWNER_ACCOUNT_ID,
            {},
            {id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: getDefaultAvatarURL({accountID: OWNER_ACCOUNT_ID}), name: HIDDEN_NAME_KEY, fallbackIcon: undefined},
        ],
        ['without an owner', undefined, {}, {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''}],
    ])('should picture the owner like the legacy component %s', (_case, ownerAccountID, personalDetails, expectedOwnerIcon) => {
        // Given a workspace task whose owner is unknown or has no personal details yet
        seedTask({reportOverrides: {ownerAccountID}});
        mockPersonalDetails = personalDetails;

        // When it renders
        render(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the workspace keeps the subscript, under a default avatar seeded from the account ID named "Hidden", or the generic fallback for no owner
        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual(expectedOwnerIcon);
    });

    it('should resolve the workspace icon from the fields carried on the parent chat while the policy row is missing', () => {
        // Given a workspace task whose policy row has not loaded, but whose parent chat carries the policy name and avatar
        seedTask({parentOverrides: {policyName: PARENT_POLICY_NAME, policyAvatar: PARENT_POLICY_AVATAR_URL}, policyRow: null});

        // When it renders
        render(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the subscript is built from the parent chat's carried fields
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: PARENT_POLICY_AVATAR_URL, name: PARENT_POLICY_NAME});
    });

    it('should render the unknown account alone while the task row has not loaded', () => {
        // Given no task row in Onyx
        mockOnyxData = {};

        // When it renders
        render(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then there is no parent chat to tie it to a workspace, so the single layout gets the generic fallback avatar
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''});
    });
});
