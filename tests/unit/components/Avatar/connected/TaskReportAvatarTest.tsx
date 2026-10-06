import {render, screen} from '@testing-library/react-native';

import TaskReportAvatar from '@components/Avatar/connected/TaskReportAvatar';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

import React from 'react';

const REPORT_ID = 'task123';
const PARENT_REPORT_ID = 'chat123';
const PARENT_ACTION_ID = 'action123';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
const SIZE_DERIVED_CONTAINER_STYLES = [{marginRight: 12, size: CONST.AVATAR_SIZE.DEFAULT}];

const OWNER_ACCOUNT_ID = 42;
const OWNER_LOGIN = 'john@example.com';
const OWNER_DISPLAY_NAME = 'John Doe';
const OWNER_AVATAR_URL = 'https://example.com/owner-avatar.png';
const DELEGATE_ACCOUNT_ID = 8;
const DELEGATE_LOGIN = 'copilot@example.com';
const DELEGATE_AVATAR_URL = 'https://example.com/copilot-avatar.png';

// Stands in for the bundled fallback SVG so a resolved account icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

const OWNER_ICON = {id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: OWNER_AVATAR_URL, name: OWNER_LOGIN, displayName: OWNER_DISPLAY_NAME, fallbackIcon: undefined};
const DELEGATE_ICON = {id: DELEGATE_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: DELEGATE_AVATAR_URL, name: DELEGATE_LOGIN, displayName: DELEGATE_LOGIN, fallbackIcon: undefined};

// Capture the props handed to the layout primitive: the icon and the container styles are this component's whole contract.
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads the task report and the chat's actions. Serving them from a map keeps the test free of Onyx setup, seeding and clearing.
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

jest.mock('@components/Avatar/layouts/SingleAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSingleAvatarProps = props;
        return <View testID="MockedSingleAvatar" />;
    };
});

const PERSONAL_DETAILS: PersonalDetailsList = {
    [OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, login: OWNER_LOGIN, displayName: OWNER_DISPLAY_NAME, avatar: OWNER_AVATAR_URL},
    [DELEGATE_ACCOUNT_ID]: {accountID: DELEGATE_ACCOUNT_ID, login: DELEGATE_LOGIN, avatar: DELEGATE_AVATAR_URL},
};

/** Renders inside the live personal details context, which the account icons resolve from. */
const renderWithPersonalDetails = (ui: React.ReactElement, personalDetails: PersonalDetailsList = PERSONAL_DETAILS) =>
    render(<PersonalDetailsContext.Provider value={personalDetails}>{ui}</PersonalDetailsContext.Provider>);

/** Serves a task assigned in a workspace chat and, optionally, the action that created it from the map. */
const seedTask = (reportOverrides: Partial<Report> = {}, delegateAccountID?: number) => {
    mockOnyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.TASK,
            ownerAccountID: OWNER_ACCOUNT_ID,
            parentReportID: PARENT_REPORT_ID,
            parentReportActionID: PARENT_ACTION_ID,
            ...reportOverrides,
        },
        [`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`]: {reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT},
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`]: {
            [PARENT_ACTION_ID]: {reportActionID: PARENT_ACTION_ID, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, actorAccountID: OWNER_ACCOUNT_ID, delegateAccountID},
        },
    };
};

describe('TaskReportAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSingleAvatarProps = {};
        mockOnyxData = {};
    });

    it.each([
        ['the given container style', CONTAINER_STYLE, CONTAINER_STYLE],
        ['the size-derived container styles', undefined, SIZE_DERIVED_CONTAINER_STYLES],
    ])('should render the owner alone for a workspace task, with %s', (_case, containerStyle, expectedContainerStyles) => {
        // Given a task assigned in a workspace chat, which still never shows the workspace icon
        seedTask();

        // When it renders
        renderWithPersonalDetails(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={containerStyle}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the single layout gets the owner, with the given container style replacing the size-derived one
        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps).toEqual({
            avatar: OWNER_ICON,
            size: CONST.AVATAR_SIZE.DEFAULT,
            containerStyles: expectedContainerStyles,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['an optimistic task linked only through parentReportID', {}],
        ['a synced task linked through chatReportID', {chatReportID: PARENT_REPORT_ID}],
    ])('should render the copilot badged as acting for the owner for %s', (_case, reportOverrides) => {
        // Given a task a copilot created on the owner's behalf
        seedTask(reportOverrides, DELEGATE_ACCOUNT_ID);

        // When it renders
        renderWithPersonalDetails(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        // Then the copilot is the avatar, carrying the copilot badge
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({...DELEGATE_ICON, copilot: {accountID: DELEGATE_ACCOUNT_ID, actedForAccountID: OWNER_ACCOUNT_ID}});
    });

    it.each([
        [
            'a default avatar seeded from the account ID for an owner without personal details',
            {},
            {id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: getDefaultAvatarURL({accountID: OWNER_ACCOUNT_ID}), name: '', displayName: undefined, fallbackIcon: undefined},
        ],
        [
            'the generic fallback while the task row has not loaded',
            undefined,
            {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: '', displayName: undefined, fallbackIcon: undefined},
        ],
    ])('should render %s', (_case, reportOverrides, expectedAvatar) => {
        // Given an owner whose personal details have not loaded, or no task row at all
        if (reportOverrides) {
            seedTask(reportOverrides);
        }

        // When it renders
        renderWithPersonalDetails(
            <TaskReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
            {},
        );

        // Then the single layout gets a placeholder avatar instead
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(expectedAvatar);
    });
});
