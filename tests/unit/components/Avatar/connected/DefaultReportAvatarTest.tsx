import {render, screen} from '@testing-library/react-native';

import DefaultReportAvatar from '@components/Avatar/connected/DefaultReportAvatar';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

import type {ViewStyle} from 'react-native';

import React from 'react';

const REPORT_ID = 'report123';
const POLICY_ID = 'policy123';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
// The emptied container styles the dispatcher passes inside a horizontal stack
const EMPTY_CONTAINER_STYLE: ViewStyle[] = [];
const SIZE_DERIVED_CONTAINER_STYLE = [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}];

// Account IDs picked so that ascending numeric order differs from the order they are declared in
const CURRENT_USER_ACCOUNT_ID = 5;
const OTHER_ACCOUNT_ID = 10;
const THIRD_ACCOUNT_ID = 3;

// Stands in for the bundled fallback SVG so the placeholder icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

/** Builds the participant icon the component resolves for an account whose personal details have loaded. */
const buildParticipantIcon = (accountID: number) => ({
    id: accountID,
    type: CONST.ICON_TYPE_AVATAR,
    source: `https://example.com/avatar-${accountID}.png`,
    name: `User ${accountID}`,
    fallbackIcon: '',
});
// The unknown account, standing in while there is no account to picture
const PLACEHOLDER_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''};

// Capture the props handed to the single layout and to the trip room leaf: the routing and the icon are this component's whole contract.
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};
let mockCapturedTripRoomAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads the report, the session and the Search snapshot. Serving them from a map keeps the test free of Onyx setup, seeding and clearing.
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

let mockPersonalDetails: PersonalDetailsList = {};

/** Renders inside the live personal details context, which the component reads while there is no Search snapshot. */
const renderWithPersonalDetails = (ui: React.ReactElement) => render(<PersonalDetailsContext.Provider value={mockPersonalDetails}>{ui}</PersonalDetailsContext.Provider>);

jest.mock('@components/Avatar/layouts/SingleAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSingleAvatarProps = props;
        return <View testID="MockedSingleAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/TripRoomAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedTripRoomAvatarProps = props;
        return <View testID="MockedTripRoomAvatar" />;
    };
});

/** Builds a participants map with the given account IDs. */
const buildParticipants = (...accountIDs: number[]) => Object.fromEntries(accountIDs.map((accountID) => [accountID, {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}]));

/** Serves the report row and the session from the map, so a test only declares what exists. `null` leaves the report row out. */
const seedReport = (report: Partial<Report> | null) => {
    mockOnyxData = {
        [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ACCOUNT_ID},
        ...(report ? {[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {reportID: REPORT_ID, ...report}} : {}),
    };
};

describe('DefaultReportAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSingleAvatarProps = {};
        mockCapturedTripRoomAvatarProps = {};
        mockOnyxData = {};
        mockPersonalDetails = Object.fromEntries(
            [CURRENT_USER_ACCOUNT_ID, OTHER_ACCOUNT_ID, THIRD_ACCOUNT_ID, CONST.ACCOUNT_ID.CONCIERGE, CONST.ACCOUNT_ID.NOTIFICATIONS].map((accountID) => [
                accountID,
                {accountID, displayName: `User ${accountID}`, avatar: `https://example.com/avatar-${accountID}.png`},
            ]),
        );
    });

    it.each([
        ['a 1:1 DM by the other member', {type: CONST.REPORT.TYPE.CHAT, participants: buildParticipants(CURRENT_USER_ACCOUNT_ID, OTHER_ACCOUNT_ID)}, buildParticipantIcon(OTHER_ACCOUNT_ID)],
        ['a 1:1 DM the current user is not part of by its member', {type: CONST.REPORT.TYPE.CHAT, participants: buildParticipants(OTHER_ACCOUNT_ID)}, buildParticipantIcon(OTHER_ACCOUNT_ID)],
        [
            'a DM with only the current user by the current user',
            {type: CONST.REPORT.TYPE.CHAT, participants: buildParticipants(CURRENT_USER_ACCOUNT_ID)},
            buildParticipantIcon(CURRENT_USER_ACCOUNT_ID),
        ],
        [
            'a chat with several members by the lowest account ID',
            {type: CONST.REPORT.TYPE.CHAT, participants: buildParticipants(CURRENT_USER_ACCOUNT_ID, OTHER_ACCOUNT_ID, THIRD_ACCOUNT_ID)},
            buildParticipantIcon(THIRD_ACCOUNT_ID),
        ],
        [
            'a DM tied to a real workspace by the lowest account ID, even the current user',
            {type: CONST.REPORT.TYPE.CHAT, policyID: POLICY_ID, participants: buildParticipants(CURRENT_USER_ACCOUNT_ID, OTHER_ACCOUNT_ID)},
            buildParticipantIcon(CURRENT_USER_ACCOUNT_ID),
        ],
        [
            'the Concierge DM by Concierge',
            {type: CONST.REPORT.TYPE.CHAT, participants: buildParticipants(CURRENT_USER_ACCOUNT_ID, CONST.ACCOUNT_ID.CONCIERGE)},
            buildParticipantIcon(CONST.ACCOUNT_ID.CONCIERGE),
        ],
        ['a self DM by the current user', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM}, buildParticipantIcon(CURRENT_USER_ACCOUNT_ID)],
        ['the system chat by Notifications', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SYSTEM}, buildParticipantIcon(CONST.ACCOUNT_ID.NOTIFICATIONS)],
        [
            'a report without a type by the lowest account ID, since only a chat can be a 1:1 DM',
            {participants: buildParticipants(CURRENT_USER_ACCOUNT_ID, OTHER_ACCOUNT_ID)},
            buildParticipantIcon(CURRENT_USER_ACCOUNT_ID),
        ],
        [
            'an unsupported report type by the lowest account ID',
            {type: CONST.REPORT.UNSUPPORTED_TYPE.PAYCHECK, participants: buildParticipants(OTHER_ACCOUNT_ID, THIRD_ACCOUNT_ID)},
            buildParticipantIcon(THIRD_ACCOUNT_ID),
        ],
        ['a DM without participants by the unknown account', {type: CONST.REPORT.TYPE.CHAT}, PLACEHOLDER_ICON],
        ['a report that has not loaded by the unknown account', null, PLACEHOLDER_ICON],
    ] as Array<[string, Partial<Report> | null, unknown]>)('should picture %s', (_case, report, expectedAvatar) => {
        // Given a report without a dedicated avatar
        seedReport(report);

        // When it renders
        renderWithPersonalDetails(
            <DefaultReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the single layout gets the account the report is pictured by
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toEqual({
            avatar: expectedAvatar,
            size: CONST.AVATAR_SIZE.DEFAULT,
            containerStyles: SIZE_DERIVED_CONTAINER_STYLE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should render the unknown account for a self DM while the session has no account', () => {
        // Given a self DM before the session loads
        seedReport({type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM});
        mockOnyxData[ONYXKEYS.SESSION] = undefined;

        // When it renders
        renderWithPersonalDetails(
            <DefaultReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then there is no current user to picture, so the generic fallback avatar stands in
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(PLACEHOLDER_ICON);
    });

    it.each([
        [
            'a display name',
            {displayName: 'Jane Doe', login: 'jane@example.com', avatar: 'https://example.com/jane.png', fallbackIcon: 'https://example.com/jane-fallback.png'},
            {name: 'Jane Doe', source: 'https://example.com/jane.png', fallbackIcon: 'https://example.com/jane-fallback.png'},
        ],
        ['only a login', {login: 'jane@example.com', avatar: 'https://example.com/jane.png'}, {name: 'jane@example.com', source: 'https://example.com/jane.png', fallbackIcon: ''}],
        ['no personal details', undefined, {name: '', source: getDefaultAvatarURL({accountID: OTHER_ACCOUNT_ID}), fallbackIcon: ''}],
    ])('should build the other member of a 1:1 DM from %s', (_case, otherDetails, expectedIcon) => {
        // Given a 1:1 DM whose other member has only part of their personal details, such as an invited member
        seedReport({type: CONST.REPORT.TYPE.CHAT, participants: buildParticipants(CURRENT_USER_ACCOUNT_ID, OTHER_ACCOUNT_ID)});
        mockPersonalDetails = otherDetails ? {[OTHER_ACCOUNT_ID]: {accountID: OTHER_ACCOUNT_ID, ...otherDetails}} : {};

        // When it renders
        renderWithPersonalDetails(
            <DefaultReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the member is named by display name and then login, with a default avatar seeded from the account ID while their avatar is unknown
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({id: OTHER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, ...expectedIcon});
    });

    it('should prefer the Search snapshot personal details over the live list', () => {
        // Given a 1:1 DM whose other member is in both the Search snapshot and the live list, with conflicting details, as on a Search surface
        seedReport({type: CONST.REPORT.TYPE.CHAT, participants: buildParticipants(CURRENT_USER_ACCOUNT_ID, OTHER_ACCOUNT_ID)});
        mockPersonalDetails = {[OTHER_ACCOUNT_ID]: {accountID: OTHER_ACCOUNT_ID, displayName: 'Live Name', avatar: 'https://example.com/live-avatar.png'}};
        mockOnyxData[ONYXKEYS.PERSONAL_DETAILS_LIST] = {
            [OTHER_ACCOUNT_ID]: {accountID: OTHER_ACCOUNT_ID, displayName: `User ${OTHER_ACCOUNT_ID}`, avatar: `https://example.com/avatar-${OTHER_ACCOUNT_ID}.png`},
        };

        // When it renders
        renderWithPersonalDetails(
            <DefaultReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the member is named and pictured from the snapshot, not the live list
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(buildParticipantIcon(OTHER_ACCOUNT_ID));
    });

    it.each([
        ['the given container style', CONTAINER_STYLE, CONTAINER_STYLE],
        ['the size-derived container styles', undefined, SIZE_DERIVED_CONTAINER_STYLE],
        ['the emptied container styles of a horizontal stack', EMPTY_CONTAINER_STYLE, EMPTY_CONTAINER_STYLE],
    ])('should render the single avatar with %s', (_case, containerStyle, expectedContainerStyles) => {
        // Given a 1:1 DM
        seedReport({type: CONST.REPORT.TYPE.CHAT, participants: buildParticipants(CURRENT_USER_ACCOUNT_ID, OTHER_ACCOUNT_ID)});

        // When it renders inside a reversed horizontal stack, with the container style the dispatcher resolved
        renderWithPersonalDetails(
            <DefaultReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={containerStyle}
                horizontalStacking
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );

        // Then a DM has nothing to stack, so the single layout gets the given container style, replacing the size-derived one
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.containerStyles).toEqual(expectedContainerStyles);
    });

    it('should hand a trip room to its leaf with every prop', () => {
        // Given a trip room that isn't linked to its trip preview
        seedReport({type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM, policyID: POLICY_ID});

        // When it renders with every prop
        renderWithPersonalDetails(
            <DefaultReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                containerStyle={CONTAINER_STYLE}
                horizontalStacking={{maxRows: 2}}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the leaf renders it, and no single avatar renders here
        expect(screen.getByTestId('MockedTripRoomAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSingleAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedTripRoomAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            containerStyle: CONTAINER_STYLE,
            horizontalStacking: {maxRows: 2},
            sort: CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should picture a trip room chat type without a report type by its participants', () => {
        // Given a report with the trip room chat type whose type has not populated yet
        seedReport({chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM, participants: buildParticipants(OTHER_ACCOUNT_ID)});

        // When it renders
        renderWithPersonalDetails(
            <DefaultReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then only a chat counts as a trip room, so the report is pictured by its participant
        expect(screen.queryByTestId('MockedTripRoomAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(buildParticipantIcon(OTHER_ACCOUNT_ID));
    });
});
