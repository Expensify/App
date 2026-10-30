import {render, screen} from '@testing-library/react-native';

import InvoiceReportAvatar from '@components/Avatar/connected/InvoiceReportAvatar';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction} from '@src/types/onyx';
import type {InvoiceReceiver} from '@src/types/onyx/Report';

import React from 'react';

const INVOICE_ID = 'invoice123';
const INVOICE_ROOM_ID = 'invoiceRoom123';
const REPORT_PREVIEW_ID = 'preview123';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
const SUBSCRIPT_CONTAINER_STYLE = {marginRight: 0};

const SENDER_POLICY_ID = 'senderPolicy';
const SENDER_POLICY_NAME = 'Sender Workspace';
const SENDER_POLICY_AVATAR_URL = 'https://example.com/sender-avatar.png';
const RECEIVER_POLICY_ID = 'receiverPolicy';
const RECEIVER_POLICY_NAME = 'Receiver Workspace';
const RECEIVER_POLICY_AVATAR_URL = 'https://example.com/receiver-avatar.png';
const RECEIVER_ACCOUNT_ID = 42;
const RECEIVER_DISPLAY_NAME = 'John Doe';
const RECEIVER_AVATAR_URL = 'https://example.com/receiver-person.png';
const SENDER_ACCOUNT_ID = 7;

// Stands in for the bundled fallback SVG so the placeholder icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

const WORKSPACE_ICON = {id: SENDER_POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: SENDER_POLICY_AVATAR_URL, name: SENDER_POLICY_NAME};
const PERSON_ICON = {id: RECEIVER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: RECEIVER_AVATAR_URL, name: RECEIVER_DISPLAY_NAME, fallbackIcon: ''};
const RECEIVER_WORKSPACE_ICON = {id: RECEIVER_POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: RECEIVER_POLICY_AVATAR_URL, name: RECEIVER_POLICY_NAME};
// The unknown account, standing in for a missing workspace
const PLACEHOLDER_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''};

const INDIVIDUAL_RECEIVER: InvoiceReceiver = {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: RECEIVER_ACCOUNT_ID};
const BUSINESS_RECEIVER: InvoiceReceiver = {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: RECEIVER_POLICY_ID};

// Capture the props handed to each layout primitive: the routing and the icons are this component's whole contract.
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};
let mockCapturedSubscriptAvatarProps: Record<string, unknown> = {};
let mockCapturedDiagonalAvatarsProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads the invoice, its room, the room's actions and the policy rows. Serving them from a map keeps the test free of Onyx setup.
let mockOnyxData: Record<string, unknown> = {};

jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = mockOnyxData[key];
    return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
});

let mockIsArchived = false;

jest.mock('@hooks/useReportIsArchived', () => () => mockIsArchived);

// The sender inference reads transactions and IOU actions. Its own tests cover that, so here it only returns the sender to picture.
let mockSenderAccountID: number | undefined;
const mockUseReportPreviewSenderID = jest.fn<number | undefined, [unknown]>(() => mockSenderAccountID);

jest.mock('@components/ReportActionAvatars/useReportPreviewSenderID', () => (params: unknown) => mockUseReportPreviewSenderID(params));

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

jest.mock('@components/Avatar/layouts/SingleAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSingleAvatarProps = props;
        return <View testID="MockedSingleAvatar" />;
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

jest.mock('@components/Avatar/layouts/DiagonalAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedDiagonalAvatarsProps = props;
        return <View testID="MockedDiagonalAvatars" />;
    };
});

const invoiceRow: Partial<Report> = {
    reportID: INVOICE_ID,
    type: CONST.REPORT.TYPE.INVOICE,
    chatReportID: INVOICE_ROOM_ID,
    parentReportID: INVOICE_ROOM_ID,
    parentReportActionID: REPORT_PREVIEW_ID,
    policyID: SENDER_POLICY_ID,
};

const reportPreview: Partial<ReportAction> = {reportActionID: REPORT_PREVIEW_ID, actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, childReportID: INVOICE_ID};

type SeedOptions = {
    /** Who the room's invoices go to. `null` leaves the receiver out */
    invoiceReceiver?: InvoiceReceiver | null;

    /** Fields to override on the invoice room. `null` leaves the room row out, as before it loads */
    roomOverrides?: Partial<Report> | null;

    /** Fields to override on the invoice */
    invoiceOverrides?: Partial<Report>;

    /** Whether the room's actions hold the invoice's report preview */
    hasReportPreview?: boolean;

    /** Whether the receiving workspace's policy row has loaded */
    hasReceiverPolicy?: boolean;
};

/** Serves the invoice, its room, the room's actions and both policy rows from the map, so a test only declares what differs. */
const seedInvoice = ({invoiceReceiver = INDIVIDUAL_RECEIVER, roomOverrides = {}, invoiceOverrides = {}, hasReportPreview = true, hasReceiverPolicy = true}: SeedOptions = {}) => {
    const senderPolicy: Partial<Policy> = {id: SENDER_POLICY_ID, name: SENDER_POLICY_NAME, avatarURL: SENDER_POLICY_AVATAR_URL};
    const receiverPolicy: Partial<Policy> = {id: RECEIVER_POLICY_ID, name: RECEIVER_POLICY_NAME, avatarURL: RECEIVER_POLICY_AVATAR_URL};
    mockOnyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${INVOICE_ID}`]: {...invoiceRow, ...invoiceOverrides},
        ...(roomOverrides
            ? {
                  [`${ONYXKEYS.COLLECTION.REPORT}${INVOICE_ROOM_ID}`]: {
                      reportID: INVOICE_ROOM_ID,
                      type: CONST.REPORT.TYPE.CHAT,
                      chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                      policyID: SENDER_POLICY_ID,
                      ...(invoiceReceiver ? {invoiceReceiver} : {}),
                      ...roomOverrides,
                  },
              }
            : {}),
        ...(hasReportPreview ? {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${INVOICE_ROOM_ID}`]: {[REPORT_PREVIEW_ID]: reportPreview}} : {}),
        [`${ONYXKEYS.COLLECTION.POLICY}${SENDER_POLICY_ID}`]: senderPolicy,
        ...(hasReceiverPolicy ? {[`${ONYXKEYS.COLLECTION.POLICY}${RECEIVER_POLICY_ID}`]: receiverPolicy} : {}),
    };
};

const renderAvatar = (props: Partial<React.ComponentProps<typeof InvoiceReportAvatar>> = {}) =>
    renderWithPersonalDetails(
        <InvoiceReportAvatar
            reportID={INVOICE_ID}
            size={CONST.AVATAR_SIZE.DEFAULT}
            containerStyle={CONTAINER_STYLE}
            subscriptContainerStyle={SUBSCRIPT_CONTAINER_STYLE}
            backdropColor="#ff0000"
            fallbackDisplayName={FALLBACK_NAME}
            {...props}
        />,
    );

/** Reads the icons the rendered layout received, in slot order. */
const getRenderedIcons = (testID: string): unknown[] => {
    if (testID === 'MockedSingleAvatar') {
        return [mockCapturedSingleAvatarProps.avatar];
    }
    if (testID === 'MockedSubscriptAvatar') {
        return [mockCapturedSubscriptAvatarProps.primaryAvatar, mockCapturedSubscriptAvatarProps.secondaryAvatar];
    }
    const {icons} = mockCapturedDiagonalAvatarsProps;
    return Array.isArray(icons) ? icons : [];
};

describe('InvoiceReportAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSingleAvatarProps = {};
        mockCapturedSubscriptAvatarProps = {};
        mockCapturedDiagonalAvatarsProps = {};
        mockOnyxData = {};
        mockIsArchived = false;
        mockSenderAccountID = undefined;
        mockPersonalDetails = {
            [RECEIVER_ACCOUNT_ID]: {accountID: RECEIVER_ACCOUNT_ID, displayName: RECEIVER_DISPLAY_NAME, avatar: RECEIVER_AVATAR_URL},
        };
    });

    it.each([
        ['an invoice to a person', {}, false, undefined, 'MockedSubscriptAvatar', [WORKSPACE_ICON, PERSON_ICON]],
        ['an invoice to a person before its preview loads', {hasReportPreview: false}, false, undefined, 'MockedSubscriptAvatar', [WORKSPACE_ICON, PERSON_ICON]],
        [
            'an invoice to a workspace before its preview loads',
            {invoiceReceiver: BUSINESS_RECEIVER, hasReportPreview: false},
            false,
            undefined,
            'MockedSubscriptAvatar',
            [WORKSPACE_ICON, RECEIVER_WORKSPACE_ICON],
        ],
        ['an invoice to a workspace once its preview loads', {invoiceReceiver: BUSINESS_RECEIVER}, false, undefined, 'MockedDiagonalAvatars', [WORKSPACE_ICON, RECEIVER_WORKSPACE_ICON]],
        [
            'an archived invoice to a workspace with one sender',
            {invoiceReceiver: BUSINESS_RECEIVER},
            true,
            SENDER_ACCOUNT_ID,
            'MockedDiagonalAvatars',
            [WORKSPACE_ICON, RECEIVER_WORKSPACE_ICON],
        ],
        ['an archived invoice to a person with more than one sender', {}, true, undefined, 'MockedSubscriptAvatar', [WORKSPACE_ICON, PERSON_ICON]],
        ['an archived invoice to a person with one sender', {}, true, SENDER_ACCOUNT_ID, 'MockedSingleAvatar', [WORKSPACE_ICON]],
        ['an archived invoice to a person before its preview loads', {hasReportPreview: false}, true, undefined, 'MockedSingleAvatar', [WORKSPACE_ICON]],
        ['an invoice without a receiver', {invoiceReceiver: null}, false, undefined, 'MockedSingleAvatar', [WORKSPACE_ICON]],
        ['an invoice to a workspace whose policy has not loaded', {invoiceReceiver: BUSINESS_RECEIVER, hasReceiverPolicy: false}, false, undefined, 'MockedSingleAvatar', [WORKSPACE_ICON]],
    ] as const)('should picture %s', (_case, seedOptions, isArchived, senderAccountID, expectedTestID, expectedIcons) => {
        // Given an invoice in the given state
        seedInvoice(seedOptions);
        mockIsArchived = isArchived;
        mockSenderAccountID = senderAccountID;

        // When it renders
        renderAvatar();

        // Then the workspace leads, and the receiver joins it once there is a named receiver to show
        expect(screen.getByTestId(expectedTestID)).toBeOnTheScreen();
        expect(getRenderedIcons(expectedTestID)).toEqual(expectedIcons);
    });

    it('should hand the subscript its container style, backdrop color and fallback name', () => {
        // Given an invoice to a person
        seedInvoice();

        // When it renders
        renderAvatar();

        // Then the subscript gets the subscript container style and blends into the row
        expect(mockCapturedSubscriptAvatarProps).toMatchObject({
            size: CONST.AVATAR_SIZE.DEFAULT,
            containerStyle: SUBSCRIPT_CONTAINER_STYLE,
            backdropColor: '#ff0000',
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should hand the diagonal its backdrop color and fallback name', () => {
        // Given an invoice to a workspace with its preview loaded
        seedInvoice({invoiceReceiver: BUSINESS_RECEIVER});

        // When it renders
        renderAvatar();

        // Then the diagonal blends its secondary avatar into the row
        expect(mockCapturedDiagonalAvatarsProps).toMatchObject({size: CONST.AVATAR_SIZE.DEFAULT, backdropColor: '#ff0000', isInReportAction: false, fallbackDisplayName: FALLBACK_NAME});
    });

    it.each([
        ['the given container style', CONTAINER_STYLE, CONTAINER_STYLE],
        ['the size-derived container styles without one', undefined, [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}]],
    ] as const)('should hand the single avatar %s', (_case, containerStyle, expectedContainerStyles) => {
        // Given an invoice without a receiver
        seedInvoice({invoiceReceiver: null});

        // When it renders with or without a container style
        renderAvatar({containerStyle});

        // Then the single avatar uses the given style, or the default for its size
        expect(mockCapturedSingleAvatarProps.containerStyles).toEqual(expectedContainerStyles);
    });

    it.each([
        ['an invoice to a person that is not archived', {}, false],
        ['an archived invoice to a workspace', {invoiceReceiver: BUSINESS_RECEIVER}, true],
        ['an archived invoice to a person before its preview loads', {hasReportPreview: false}, true],
    ] as const)('should not read the rows the sender lookup needs for %s', (_case, seedOptions, isArchived) => {
        // Given an invoice whose avatars don't depend on who sent its expenses
        seedInvoice(seedOptions);
        mockIsArchived = isArchived;

        // When it renders
        renderAvatar();

        // Then the sender lookup gets nothing to read
        expect(mockUseReportPreviewSenderID).toHaveBeenLastCalledWith({iouReport: undefined, action: undefined, chatReport: undefined});
    });

    it('should hand the sender lookup the invoice, its preview and its room for an archived invoice to a person', () => {
        // Given an archived invoice to a person with its preview loaded
        seedInvoice();
        mockIsArchived = true;

        // When it renders
        renderAvatar();

        // Then the sender lookup reads the whole rows
        expect(mockUseReportPreviewSenderID).toHaveBeenLastCalledWith({
            iouReport: mockOnyxData[`${ONYXKEYS.COLLECTION.REPORT}${INVOICE_ID}`],
            action: reportPreview,
            chatReport: mockOnyxData[`${ONYXKEYS.COLLECTION.REPORT}${INVOICE_ROOM_ID}`],
        });
    });

    it.each([
        ['the raw `_FAKE_` policyID', {roomOverrides: {policyID: CONST.POLICY.ID_FAKE}}, 'MockedSubscriptAvatar', CONST.POLICY.ID_FAKE],
        ["the invoice's own policyID while its room loads", {roomOverrides: null}, 'MockedSingleAvatar', SENDER_POLICY_ID],
    ] as const)('should identify the workspace by %s', (_case, seedOptions, expectedTestID, expectedID) => {
        // Given an invoice whose room carries a `_FAKE_` policyID, or hasn't loaded
        seedInvoice(seedOptions);

        // When it renders
        renderAvatar();

        // Then the workspace icon keeps that policyID, which seeds its default avatar color, while the invoice's policy still names and pictures the workspace
        expect(screen.getByTestId(expectedTestID)).toBeOnTheScreen();
        expect(getRenderedIcons(expectedTestID).at(0)).toEqual({...WORKSPACE_ICON, id: expectedID});
    });

    it('should stand the unknown account in for the workspace of an invoice without a policyID', () => {
        // Given an invoice to a person where neither the invoice nor its room carries a policyID
        seedInvoice({roomOverrides: {policyID: undefined}, invoiceOverrides: {policyID: undefined}});

        // When it renders
        renderAvatar();

        // Then the unknown account leads in the workspace's place
        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual(PLACEHOLDER_ICON);
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(PERSON_ICON);
    });
});
