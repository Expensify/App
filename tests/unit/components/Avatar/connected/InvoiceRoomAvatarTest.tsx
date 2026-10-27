import {render, screen} from '@testing-library/react-native';

import InvoiceRoomAvatar from '@components/Avatar/connected/InvoiceRoomAvatar';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {InvoiceReceiver} from '@src/types/onyx/Report';

import React from 'react';

const SENDER_POLICY_ID = 'senderPolicy';
const RECEIVER_POLICY_ID = 'receiverPolicy';
const RECEIVER_POLICY_NAME = 'Receiver Workspace';
const RECEIVER_POLICY_AVATAR_URL = 'https://example.com/receiver-avatar.png';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
const SUBSCRIPT_CONTAINER_STYLE = {marginRight: 0};
const SIZE_DERIVED_CONTAINER_STYLE = [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}];
const HORIZONTAL_STACKING = {maxRows: 2, overlapDivider: 4};

const RECEIVER_ACCOUNT_ID = 42;
const RECEIVER_LOGIN = 'john@example.com';
const RECEIVER_DISPLAY_NAME = 'John Doe';
const RECEIVER_AVATAR_URL = 'https://example.com/receiver-person.png';

// Stands in for the bundled fallback SVG so the placeholder icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

const SENDER_ICON = {id: SENDER_POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: 'https://example.com/sender-avatar.png', name: 'Sender Workspace'};
// The unknown account, standing in for a missing sender workspace or receiver
const PLACEHOLDER_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''};
const PERSON_ICON = {id: RECEIVER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: RECEIVER_AVATAR_URL, name: RECEIVER_DISPLAY_NAME, fallbackIcon: ''};
const RECEIVER_WORKSPACE_ICON = {id: RECEIVER_POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: RECEIVER_POLICY_AVATAR_URL, name: RECEIVER_POLICY_NAME};

const INDIVIDUAL_RECEIVER: InvoiceReceiver = {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: RECEIVER_ACCOUNT_ID};
const BUSINESS_RECEIVER: InvoiceReceiver = {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: RECEIVER_POLICY_ID};

// Capture the props handed to each layout primitive: the routing and the icons are this component's whole contract.
let mockCapturedHorizontalAvatarsProps: Record<string, unknown> = {};
let mockCapturedSubscriptAvatarProps: Record<string, unknown> = {};
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads the receiver's policy row and the Search snapshot. Serving them from a map keeps the test free of Onyx setup, seeding and clearing.
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

/** Renders inside the live personal details context, which the component reads while there is no Search snapshot. */
const renderWithPersonalDetails = (ui: React.ReactElement) => render(<PersonalDetailsContext.Provider value={mockPersonalDetails}>{ui}</PersonalDetailsContext.Provider>);

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

describe('InvoiceRoomAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedHorizontalAvatarsProps = {};
        mockCapturedSubscriptAvatarProps = {};
        mockCapturedSingleAvatarProps = {};
        mockOnyxData = {
            [`${ONYXKEYS.COLLECTION.POLICY}${RECEIVER_POLICY_ID}`]: {id: RECEIVER_POLICY_ID, name: RECEIVER_POLICY_NAME, avatarURL: RECEIVER_POLICY_AVATAR_URL},
        };
        mockPersonalDetails = {
            [RECEIVER_ACCOUNT_ID]: {accountID: RECEIVER_ACCOUNT_ID, login: RECEIVER_LOGIN, displayName: RECEIVER_DISPLAY_NAME, avatar: RECEIVER_AVATAR_URL},
        };
    });

    it.each([
        ['a person', INDIVIDUAL_RECEIVER, PERSON_ICON],
        ['another workspace', BUSINESS_RECEIVER, RECEIVER_WORKSPACE_ICON],
    ])('should render the workspace with %s as the subscript', (_case, invoiceReceiver, expectedReceiverIcon) => {
        // Given an invoice room whose receiver is known
        // When it renders with every prop
        renderWithPersonalDetails(
            <InvoiceRoomAvatar
                invoiceReceiver={invoiceReceiver}
                primaryAvatar={SENDER_ICON}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                containerStyle={CONTAINER_STYLE}
                subscriptContainerStyle={SUBSCRIPT_CONTAINER_STYLE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the subscript layout gets the sending workspace as the primary avatar, the receiver as the subscript, and the subscript container style
        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps).toEqual({
            primaryAvatar: SENDER_ICON,
            secondaryAvatar: expectedReceiverIcon,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: SUBSCRIPT_CONTAINER_STYLE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should name a receiving person by login when they have no display name', () => {
        // Given an invoice room sent to a person without a display name
        mockPersonalDetails = {[RECEIVER_ACCOUNT_ID]: {accountID: RECEIVER_ACCOUNT_ID, login: RECEIVER_LOGIN, avatar: RECEIVER_AVATAR_URL}};

        // When it renders
        renderWithPersonalDetails(
            <InvoiceRoomAvatar
                invoiceReceiver={INDIVIDUAL_RECEIVER}
                primaryAvatar={SENDER_ICON}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the person keeps the subscript, named by login
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual({...PERSON_ICON, name: RECEIVER_LOGIN});
    });

    it('should prefer the Search snapshot personal details over the live list', () => {
        // Given an invoice room whose receiving person is in both the Search snapshot and the live list, with conflicting details, as on a Search surface
        mockPersonalDetails = {
            [RECEIVER_ACCOUNT_ID]: {accountID: RECEIVER_ACCOUNT_ID, login: RECEIVER_LOGIN, displayName: 'Live Name', avatar: 'https://example.com/live-avatar.png'},
        };
        mockOnyxData[ONYXKEYS.PERSONAL_DETAILS_LIST] = {
            [RECEIVER_ACCOUNT_ID]: {accountID: RECEIVER_ACCOUNT_ID, login: RECEIVER_LOGIN, displayName: RECEIVER_DISPLAY_NAME, avatar: RECEIVER_AVATAR_URL},
        };

        // When it renders
        renderWithPersonalDetails(
            <InvoiceRoomAvatar
                invoiceReceiver={INDIVIDUAL_RECEIVER}
                primaryAvatar={SENDER_ICON}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the person is named and pictured from the snapshot, not the live list
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(PERSON_ICON);
    });

    it.each([
        ['a person without personal details, with the given container style', INDIVIDUAL_RECEIVER, () => (mockPersonalDetails = {}), CONTAINER_STYLE, CONTAINER_STYLE],
        ['a workspace whose policy row has not loaded, with the size-derived container styles', BUSINESS_RECEIVER, () => (mockOnyxData = {}), undefined, SIZE_DERIVED_CONTAINER_STYLE],
        [
            'a workspace whose policy row has no name, with empty container styles',
            BUSINESS_RECEIVER,
            () => (mockOnyxData = {[`${ONYXKEYS.COLLECTION.POLICY}${RECEIVER_POLICY_ID}`]: {id: RECEIVER_POLICY_ID}}),
            [],
            [],
        ],
        ['an unknown person, with the given container style', {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 0}, () => {}, CONTAINER_STYLE, CONTAINER_STYLE],
        ['no receiver, with the given container style', undefined, () => {}, CONTAINER_STYLE, CONTAINER_STYLE],
    ] as Array<[string, InvoiceReceiver | undefined, () => void, typeof CONTAINER_STYLE | undefined, unknown]>)(
        'should render the workspace alone for %s',
        (_case, invoiceReceiver, removeReceiverData, containerStyle, expectedContainerStyles) => {
            // Given an invoice room whose receiver has no name to show
            removeReceiverData();

            // When it renders outside a horizontal stack
            renderWithPersonalDetails(
                <InvoiceRoomAvatar
                    invoiceReceiver={invoiceReceiver}
                    primaryAvatar={SENDER_ICON}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    containerStyle={containerStyle}
                    fallbackDisplayName={FALLBACK_NAME}
                />,
            );

            // Then a nameless subscript would render as an empty ring, so the single layout gets the workspace alone
            expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
            expect(screen.queryByTestId('MockedSubscriptAvatar')).not.toBeOnTheScreen();
            expect(mockCapturedSingleAvatarProps).toEqual({
                avatar: SENDER_ICON,
                size: CONST.AVATAR_SIZE.DEFAULT,
                containerStyles: expectedContainerStyles,
                fallbackDisplayName: FALLBACK_NAME,
            });
        },
    );

    it.each([
        ["the stack's defaults", true, {}],
        ['the given stacking options', HORIZONTAL_STACKING, HORIZONTAL_STACKING],
    ])('should stack the workspace and then the receiving person horizontally with %s', (_case, horizontalStacking, expectedStackingOptions) => {
        // Given an invoice room sent to a person
        // When it renders inside a horizontal stack without a sort
        renderWithPersonalDetails(
            <InvoiceRoomAvatar
                invoiceReceiver={INDIVIDUAL_RECEIVER}
                primaryAvatar={SENDER_ICON}
                size={CONST.AVATAR_SIZE.XXXX_LARGE}
                horizontalStacking={horizontalStacking}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the horizontal layout gets the stacking options and the workspace leads the row
        expect(screen.getByTestId('MockedHorizontalAvatars')).toBeOnTheScreen();
        expect(mockCapturedHorizontalAvatarsProps).toEqual({
            ...expectedStackingOptions,
            size: CONST.AVATAR_SIZE.XXXX_LARGE,
            icons: [SENDER_ICON, PERSON_ICON],
            isInReportAction: false,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['a person', INDIVIDUAL_RECEIVER, true, [PERSON_ICON, SENDER_ICON]],
        ['a person without personal details', INDIVIDUAL_RECEIVER, false, [{...PERSON_ICON, source: getDefaultAvatarURL({accountID: RECEIVER_ACCOUNT_ID}), name: ''}, SENDER_ICON]],
        ['no receiver', undefined, true, [PLACEHOLDER_ICON, SENDER_ICON]],
    ] as Array<[string, InvoiceReceiver | undefined, boolean, unknown]>)(
        'should apply the sort to a horizontal stack with %s',
        (_case, invoiceReceiver, hasPersonalDetails, expectedIcons) => {
            // Given an invoice room whose receiver is not another workspace
            if (!hasPersonalDetails) {
                mockPersonalDetails = {};
            }

            // When it renders inside a horizontal stack, reversed
            renderWithPersonalDetails(
                <InvoiceRoomAvatar
                    invoiceReceiver={invoiceReceiver}
                    primaryAvatar={SENDER_ICON}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    horizontalStacking
                    sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                />,
            );

            // Then both slots stay filled, even by a nameless receiver, and the receiver leads the row
            expect(screen.getByTestId('MockedHorizontalAvatars')).toBeOnTheScreen();
            expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(expectedIcons);
        },
    );

    it.each([
        ["the stack's defaults", true],
        ['the given stacking options', HORIZONTAL_STACKING],
    ])('should keep the subscript for an invoice room between two workspaces even inside a horizontal stack with %s', (_case, horizontalStacking) => {
        // Given an invoice room sent to another workspace
        // When it renders inside a reversed horizontal stack
        renderWithPersonalDetails(
            <InvoiceRoomAvatar
                invoiceReceiver={BUSINESS_RECEIVER}
                primaryAvatar={SENDER_ICON}
                size={CONST.AVATAR_SIZE.DEFAULT}
                subscriptContainerStyle={SUBSCRIPT_CONTAINER_STYLE}
                horizontalStacking={horizontalStacking}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );

        // Then two workspaces never stack, so the subscript keeps the sending workspace first and ignores the sort
        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedHorizontalAvatars')).not.toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps).toMatchObject({primaryAvatar: SENDER_ICON, secondaryAvatar: RECEIVER_WORKSPACE_ICON, containerStyle: SUBSCRIPT_CONTAINER_STYLE});
    });

    it('should render the workspace alone for an invoice room between two workspaces whose receiver has not loaded inside a horizontal stack', () => {
        // Given an invoice room sent to another workspace whose policy row has not loaded
        mockOnyxData = {};

        // When it renders inside a horizontal stack, with the empty container styles the dispatcher passes there
        renderWithPersonalDetails(
            <InvoiceRoomAvatar
                invoiceReceiver={BUSINESS_RECEIVER}
                primaryAvatar={SENDER_ICON}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={[]}
                horizontalStacking
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then two workspaces never stack, and a nameless subscript would render as an empty ring, so the single layout gets the workspace alone
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedHorizontalAvatars')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSubscriptAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toEqual({
            avatar: SENDER_ICON,
            size: CONST.AVATAR_SIZE.DEFAULT,
            containerStyles: [],
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should stack the unknown account and a receiving workspace when the room has no sending workspace', () => {
        // Given an invoice room without a sending workspace, sent to another workspace
        // When it renders inside a horizontal stack
        renderWithPersonalDetails(
            <InvoiceRoomAvatar
                invoiceReceiver={BUSINESS_RECEIVER}
                primaryAvatar={PLACEHOLDER_ICON}
                size={CONST.AVATAR_SIZE.DEFAULT}
                horizontalStacking
            />,
        );

        // Then only one side is a workspace, so the pair stacks
        expect(screen.getByTestId('MockedHorizontalAvatars')).toBeOnTheScreen();
        expect(mockCapturedHorizontalAvatarsProps.icons).toEqual([PLACEHOLDER_ICON, RECEIVER_WORKSPACE_ICON]);
    });

    it('should picture a receiving workspace without an uploaded avatar by its default avatar', () => {
        // Given an invoice room sent to a workspace whose policy row has a name but no avatar
        mockOnyxData = {[`${ONYXKEYS.COLLECTION.POLICY}${RECEIVER_POLICY_ID}`]: {id: RECEIVER_POLICY_ID, name: RECEIVER_POLICY_NAME}};

        // When it renders
        renderWithPersonalDetails(
            <InvoiceRoomAvatar
                invoiceReceiver={BUSINESS_RECEIVER}
                primaryAvatar={SENDER_ICON}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the subscript gets the default avatar seeded from the workspace name
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual({...RECEIVER_WORKSPACE_ICON, source: getDefaultWorkspaceAvatar(RECEIVER_POLICY_NAME)});
    });
});
