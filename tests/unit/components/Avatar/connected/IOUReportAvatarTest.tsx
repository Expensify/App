import {render, screen} from '@testing-library/react-native';

import IOUReportAvatar from '@components/Avatar/connected/IOUReportAvatar';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportAction} from '@src/types/onyx';

import React from 'react';

const IOU_REPORT_ID = 'iou123';
const CHAT_REPORT_ID = 'chat123';
const REPORT_PREVIEW_ID = 'preview123';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];

const MANAGER_ACCOUNT_ID = 10;
const MANAGER_DISPLAY_NAME = 'Manager Name';
const MANAGER_AVATAR_URL = 'https://example.com/manager-avatar.png';
const OWNER_ACCOUNT_ID = 20;
const OWNER_DISPLAY_NAME = 'Owner Name';
const OWNER_AVATAR_URL = 'https://example.com/owner-avatar.png';
const DELEGATE_ACCOUNT_ID = 30;
const DELEGATE_DISPLAY_NAME = 'Copilot Name';
const DELEGATE_AVATAR_URL = 'https://example.com/copilot-avatar.png';

// Stands in for the bundled fallback SVG so a resolved account icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

const MANAGER_ICON = {id: MANAGER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: MANAGER_AVATAR_URL, name: MANAGER_DISPLAY_NAME, fallbackIcon: undefined};
const OWNER_ICON = {id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: OWNER_AVATAR_URL, name: OWNER_DISPLAY_NAME, fallbackIcon: undefined};
const DELEGATE_ICON = {id: DELEGATE_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: DELEGATE_AVATAR_URL, name: DELEGATE_DISPLAY_NAME, fallbackIcon: undefined};
// The unknown account, standing in while there is no account to picture
const PLACEHOLDER_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''};
// The empty second slot of a stack without an owner
const BLANK_ICON = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: '', name: ''};

// Capture the props handed to each layout primitive: the routing and the icons are this component's whole contract.
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};
let mockCapturedDiagonalAvatarsProps: Record<string, unknown> = {};
let mockCapturedHorizontalAvatarsProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads the IOU row, its chat row, the chat's actions and the personal details snapshot. Serving them from a map keeps the test free of Onyx setup.
let mockOnyxData: Record<string, unknown> = {};

jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = mockOnyxData[key];
    return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
});

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

jest.mock('@components/Avatar/layouts/DiagonalAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedDiagonalAvatarsProps = props;
        return <View testID="MockedDiagonalAvatars" />;
    };
});

jest.mock('@components/Avatar/layouts/HorizontalAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedHorizontalAvatarsProps = props;
        return <View testID="MockedHorizontalAvatars" />;
    };
});

const iouRow = (overrides: Partial<Report> = {}): Partial<Report> => ({
    reportID: IOU_REPORT_ID,
    type: CONST.REPORT.TYPE.IOU,
    chatReportID: CHAT_REPORT_ID,
    parentReportActionID: REPORT_PREVIEW_ID,
    managerID: MANAGER_ACCOUNT_ID,
    ownerAccountID: OWNER_ACCOUNT_ID,
    ...overrides,
});

const reportPreview = (overrides: Partial<ReportAction> = {}): Partial<ReportAction> => ({
    reportActionID: REPORT_PREVIEW_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    childReportID: IOU_REPORT_ID,
    ...overrides,
});

/** Serves the IOU row, its DM and the DM's actions from the map. `null` leaves the report preview out, as before the DM's actions load. */
const seedIOU = (reportOverrides: Partial<Report> = {}, previewRow: Partial<ReportAction> | null = reportPreview()) => {
    mockOnyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`]: iouRow(reportOverrides),
        [`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`]: {reportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT},
        ...(previewRow ? {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHAT_REPORT_ID}`]: {[REPORT_PREVIEW_ID]: previewRow}} : {}),
    };
};

const renderAvatar = (props: Partial<React.ComponentProps<typeof IOUReportAvatar>> = {}) =>
    renderWithPersonalDetails(
        <IOUReportAvatar
            reportID={IOU_REPORT_ID}
            size={CONST.AVATAR_SIZE.DEFAULT}
            containerStyle={CONTAINER_STYLE}
            fallbackDisplayName={FALLBACK_NAME}
            {...props}
        />,
    );

describe('IOUReportAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSingleAvatarProps = {};
        mockCapturedDiagonalAvatarsProps = {};
        mockCapturedHorizontalAvatarsProps = {};
        mockOnyxData = {};
        mockSenderAccountID = undefined;
        mockPersonalDetails = {
            [MANAGER_ACCOUNT_ID]: {accountID: MANAGER_ACCOUNT_ID, displayName: MANAGER_DISPLAY_NAME, avatar: MANAGER_AVATAR_URL},
            [OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, displayName: OWNER_DISPLAY_NAME, avatar: OWNER_AVATAR_URL},
            [DELEGATE_ACCOUNT_ID]: {accountID: DELEGATE_ACCOUNT_ID, displayName: DELEGATE_DISPLAY_NAME, avatar: DELEGATE_AVATAR_URL},
        };
    });

    it.each([
        ['the manager alone before the report preview loads', null, undefined, undefined, 'MockedSingleAvatar', [MANAGER_ICON]],
        ['the manager alone before the report preview loads, inside a horizontal stack', null, undefined, {maxRows: 2}, 'MockedSingleAvatar', [MANAGER_ICON]],
        ['the sender alone when one person sent every expense', reportPreview(), OWNER_ACCOUNT_ID, undefined, 'MockedSingleAvatar', [OWNER_ICON]],
        ['the sender alone when one person sent every expense, inside a horizontal stack', reportPreview(), OWNER_ACCOUNT_ID, {maxRows: 2}, 'MockedSingleAvatar', [OWNER_ICON]],
        ['the manager and the owner diagonally when both sent expenses', reportPreview(), undefined, undefined, 'MockedDiagonalAvatars', [MANAGER_ICON, OWNER_ICON]],
        ['the manager and the owner side by side inside a horizontal stack', reportPreview(), undefined, {maxRows: 2}, 'MockedHorizontalAvatars', [MANAGER_ICON, OWNER_ICON]],
        ['the manager and the owner side by side inside a default horizontal stack', reportPreview(), undefined, true, 'MockedHorizontalAvatars', [MANAGER_ICON, OWNER_ICON]],
    ] as const)('should picture %s', (_case, previewRow, senderAccountID, horizontalStacking, expectedTestID, expectedIcons) => {
        // Given an IOU report whose preview is loaded or not, and a sender the preview singles out or not
        seedIOU({}, previewRow);
        mockSenderAccountID = senderAccountID;

        // When it renders, stacked or not
        renderAvatar({horizontalStacking});

        // Then one sender shows alone, and two senders show together in the layout the stacking asks for
        expect(screen.getByTestId(expectedTestID)).toBeOnTheScreen();
        if (expectedTestID === 'MockedSingleAvatar') {
            expect(mockCapturedSingleAvatarProps.avatar).toEqual(expectedIcons.at(0));
        } else if (expectedTestID === 'MockedDiagonalAvatars') {
            expect(mockCapturedDiagonalAvatarsProps.icons).toEqual(expectedIcons);
        } else {
            expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(expectedIcons);
        }
    });

    it('should hand the single avatar its container style and fallback name', () => {
        // Given an IOU report with one sender
        seedIOU();
        mockSenderAccountID = OWNER_ACCOUNT_ID;

        // When it renders with a container style
        renderAvatar();

        // Then the single avatar gets that style and the fallback tooltip name
        expect(mockCapturedSingleAvatarProps).toMatchObject({size: CONST.AVATAR_SIZE.DEFAULT, containerStyles: CONTAINER_STYLE, fallbackDisplayName: FALLBACK_NAME});
    });

    it('should fall back to the size-derived container styles without a container style', () => {
        // Given an IOU report with one sender
        seedIOU();
        mockSenderAccountID = OWNER_ACCOUNT_ID;

        // When it renders without a container style
        renderAvatar({containerStyle: undefined, size: CONST.AVATAR_SIZE.SMALL});

        // Then the single avatar gets the default container styles for its size
        expect(mockGetContainerStyles).toHaveBeenCalledWith(CONST.AVATAR_SIZE.SMALL);
        expect(mockCapturedSingleAvatarProps.containerStyles).toEqual([{marginRight: 12, size: CONST.AVATAR_SIZE.SMALL}]);
    });

    it('should hand the diagonal its backdrop color and fallback name', () => {
        // Given an IOU report with two senders
        seedIOU();

        // When it renders on a colored row
        renderAvatar({backdropColor: '#ff0000'});

        // Then the diagonal blends its secondary avatar into that row
        expect(mockCapturedDiagonalAvatarsProps).toMatchObject({size: CONST.AVATAR_SIZE.DEFAULT, backdropColor: '#ff0000', isInReportAction: false, fallbackDisplayName: FALLBACK_NAME});
    });

    it('should hand the horizontal stack its options and fallback name', () => {
        // Given an IOU report with two senders
        seedIOU();

        // When it renders inside a horizontal stack with options
        renderAvatar({horizontalStacking: {maxRows: 2, overlapDivider: 4, isHovered: true}});

        // Then the stack gets every option
        expect(mockCapturedHorizontalAvatarsProps).toMatchObject({maxRows: 2, overlapDivider: 4, isHovered: true, isInReportAction: false, fallbackDisplayName: FALLBACK_NAME});
    });

    it('should reverse the horizontal stack when asked to', () => {
        // Given an IOU report with two senders
        seedIOU();

        // When it renders inside a horizontal stack sorted in reverse
        renderAvatar({horizontalStacking: true, sort: CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE});

        // Then the owner leads the stack
        expect(mockCapturedHorizontalAvatarsProps.icons).toEqual([OWNER_ICON, MANAGER_ICON]);
    });

    it('should look up the sender from the IOU row, its report preview and its chat', () => {
        // Given an IOU report with its preview and chat loaded
        seedIOU();

        // When it renders
        renderAvatar();

        // Then the sender inference reads those three rows
        expect(mockUseReportPreviewSenderID).toHaveBeenLastCalledWith({
            iouReport: iouRow(),
            action: reportPreview(),
            chatReport: {reportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT},
        });
    });

    it.each([
        [
            'a sender without personal details by the generic fallback and no name',
            reportPreview(),
            40,
            {},
            undefined,
            {id: 40, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: '', fallbackIcon: undefined},
        ],
        [
            'a manager without personal details by a seeded default avatar and no name before the preview loads',
            null,
            undefined,
            {},
            MANAGER_ACCOUNT_ID,
            {id: MANAGER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: getDefaultAvatarURL({accountID: MANAGER_ACCOUNT_ID}), name: '', fallbackIcon: undefined},
        ],
        ['a report without a manager by the unknown account before the preview loads', null, undefined, {managerID: undefined}, undefined, PLACEHOLDER_ICON],
    ] as const)('should picture %s', (_case, previewRow, senderAccountID, reportOverrides, accountIDWithoutDetails, expectedIcon) => {
        // Given an IOU report whose pictured account lacks personal details, or is missing
        if (accountIDWithoutDetails) {
            delete mockPersonalDetails[accountIDWithoutDetails];
        }
        seedIOU(reportOverrides, previewRow);
        mockSenderAccountID = senderAccountID;

        // When it renders
        renderAvatar();

        // Then the account shows the way the report header pictured it
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(expectedIcon);
    });

    it.each([
        ['an owner without a display name', {[OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, avatar: OWNER_AVATAR_URL}}, {}],
        ['a report without an owner', {}, {ownerAccountID: undefined}],
    ] as const)('should picture the manager alone for %s when both sent expenses', (_case, personalDetailsOverrides, reportOverrides) => {
        // Given an IOU report with two senders whose owner has no name to show
        mockPersonalDetails = {...mockPersonalDetails, ...personalDetailsOverrides};
        seedIOU(reportOverrides);

        // When it renders outside a horizontal stack
        renderAvatar();

        // Then the diagonal drops to the manager alone
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(MANAGER_ICON);
    });

    it('should keep an empty second slot in a horizontal stack for a report without an owner', () => {
        // Given an IOU report with two senders and no owner
        seedIOU({ownerAccountID: undefined});

        // When it renders inside a horizontal stack
        renderAvatar({horizontalStacking: true});

        // Then the stack keeps both slots, the second one blank
        expect(mockCapturedHorizontalAvatarsProps.icons).toEqual([MANAGER_ICON, BLANK_ICON]);
    });

    it.each([
        [
            'the copilot with a badge naming the owner when one person sent every expense',
            OWNER_ACCOUNT_ID,
            true,
            'MockedSingleAvatar',
            {...DELEGATE_ICON, copilot: {accountID: DELEGATE_ACCOUNT_ID, actedForAccountID: OWNER_ACCOUNT_ID}},
        ],
        ['the copilot and the owner diagonally, without a badge, when both sent expenses', undefined, true, 'MockedDiagonalAvatars', [DELEGATE_ICON, OWNER_ICON]],
        [
            'the sender with a badge naming the manager while the copilot has no personal details',
            OWNER_ACCOUNT_ID,
            false,
            'MockedSingleAvatar',
            {...OWNER_ICON, copilot: {accountID: DELEGATE_ACCOUNT_ID, actedForAccountID: MANAGER_ACCOUNT_ID}},
        ],
    ] as const)('should picture %s', (_case, senderAccountID, hasDelegateDetails, expectedTestID, expected) => {
        // Given an IOU report a copilot created, with or without the copilot's personal details
        if (!hasDelegateDetails) {
            delete mockPersonalDetails[DELEGATE_ACCOUNT_ID];
        }
        seedIOU({}, reportPreview({delegateAccountID: DELEGATE_ACCOUNT_ID}));
        mockSenderAccountID = senderAccountID;

        // When it renders
        renderAvatar();

        // Then the copilot leads once known, and only a single avatar carries the copilot badge
        expect(screen.getByTestId(expectedTestID)).toBeOnTheScreen();
        if (expectedTestID === 'MockedSingleAvatar') {
            expect(mockCapturedSingleAvatarProps.avatar).toEqual(expected);
        } else {
            expect(mockCapturedDiagonalAvatarsProps.icons).toEqual(expected);
        }
    });

    it.each([
        ['the snapshot over the live list', {[OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, displayName: 'Snapshot Owner', avatar: 'https://example.com/snapshot.png'}}, 'Snapshot Owner'],
        ['the live list while the snapshot loads', undefined, OWNER_DISPLAY_NAME],
    ] as const)('should name the sender from %s', (_case, snapshot, expectedName) => {
        // Given an IOU report with one sender, on Search with or without a snapshot
        seedIOU();
        mockOnyxData[ONYXKEYS.PERSONAL_DETAILS_LIST] = snapshot;
        mockSenderAccountID = OWNER_ACCOUNT_ID;

        // When it renders
        renderAvatar();

        // Then the sender is named from the snapshot when there is one
        expect(mockCapturedSingleAvatarProps.avatar).toMatchObject({id: OWNER_ACCOUNT_ID, name: expectedName});
    });
});
