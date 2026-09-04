import {render, screen} from '@testing-library/react-native';

import GroupChatAvatar from '@components/Avatar/connected/GroupChatAvatar';

import {getDefaultGroupAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1234';
const GROUP_AVATAR_URL = 'https://example.com/group-avatar.png';
const GROUP_NAME = 'Weekend Trip';
const FALLBACK_NAME = 'Fallback Name';

const ALICE_ACCOUNT_ID = 1;
const BOB_ACCOUNT_ID = 2;
const CARL_ACCOUNT_ID = 3;

const PARTICIPANTS = {
    [ALICE_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    [BOB_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    [CARL_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
};

// Captures the props `GroupChatAvatar` hands to the layout primitive, which is the whole contract of this component.
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        translate: (key: string) => key,
    })),
);

jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getContainerStyles: mockGetContainerStyles})));

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({
        [ALICE_ACCOUNT_ID]: {accountID: ALICE_ACCOUNT_ID, firstName: 'Alice', displayName: 'Alice Smith'},
        [BOB_ACCOUNT_ID]: {accountID: BOB_ACCOUNT_ID, firstName: 'Bob', displayName: 'Bob Jones'},
        [CARL_ACCOUNT_ID]: {accountID: CARL_ACCOUNT_ID, firstName: 'Carl', displayName: 'Carl Fox'},
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

const createGroupChatReport = (overrides: Partial<Report> = {}): Report => ({
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
    participants: PARTICIPANTS,
    ...overrides,
});

describe('GroupChatAvatar (connected)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSingleAvatarProps = {};
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        ['the uploaded avatar when the group chat has one', {avatarUrl: GROUP_AVATAR_URL}, GROUP_AVATAR_URL],
        // A group chat with no uploaded avatar stores an empty string, which has to fall through to the default avatar
        ['the reportID-seeded default avatar when avatarUrl is an empty string', {avatarUrl: ''}, getDefaultGroupAvatar(REPORT_ID)],
    ])('should render %s', async (_case, reportOverrides, expectedSource) => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createGroupChatReport(reportOverrides));
        await waitForBatchedUpdatesWithAct();

        render(
            <GroupChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.avatar).toMatchObject({
            id: -1,
            type: CONST.ICON_TYPE_AVATAR,
            source: expectedSource,
        });
    });

    it('should name the avatar after the custom report name when there is one', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createGroupChatReport({reportName: GROUP_NAME}));
        await waitForBatchedUpdatesWithAct();

        render(
            <GroupChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toMatchObject({name: GROUP_NAME});
    });

    it("should build the name from the participants' short names when there is no custom name", async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createGroupChatReport());
        await waitForBatchedUpdatesWithAct();

        render(
            <GroupChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toMatchObject({name: 'Alice, Bob, Carl'});
    });

    it('should exclude members pending deletion from the name', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createGroupChatReport());
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}`, {
            pendingChatMembers: [{accountID: String(CARL_ACCOUNT_ID), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
        });
        await waitForBatchedUpdatesWithAct();

        render(
            <GroupChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toMatchObject({name: 'Alice, Bob'});
    });

    it('should replace the size-derived container styles when a container style is provided', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createGroupChatReport());
        await waitForBatchedUpdatesWithAct();

        const containerStyle = [{marginRight: 0}];

        render(
            <GroupChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                containerStyle={containerStyle}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        expect(mockCapturedSingleAvatarProps.containerStyles).toBe(containerStyle);
        expect(mockCapturedSingleAvatarProps.size).toBe(CONST.AVATAR_SIZE.SMALL);
        expect(mockCapturedSingleAvatarProps.fallbackDisplayName).toBe(FALLBACK_NAME);
        expect(mockGetContainerStyles).not.toHaveBeenCalled();
    });

    it('should fall back to the size-derived container styles when no container style is provided', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createGroupChatReport());
        await waitForBatchedUpdatesWithAct();

        render(
            <GroupChatAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockGetContainerStyles).toHaveBeenCalledWith(CONST.AVATAR_SIZE.DEFAULT);
    });
});
