import {cleanup, render, screen} from '@testing-library/react-native';

import ExpenseReportAvatar from '@components/Avatar/connected/ExpenseReportAvatar';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = 'report123';
const POLICY_ID = 'policy123';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = {marginRight: 0};

const OWNER_ACCOUNT_ID = 42;
const OWNER_LOGIN = 'john@example.com';
const OWNER_AVATAR_URL = 'https://example.com/owner-avatar.png';

const PARENT_REPORT_ID = 'parentChat456';
const PARENT_REPORT_ACTION_ID = 'action789';
const DELEGATE_ACCOUNT_ID = 77;
const DELEGATE_LOGIN = 'copilot@example.com';
const DELEGATE_AVATAR_URL = 'https://example.com/delegate-avatar.png';

// Stands in for the bundled fallback SVG so a resolved account icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

// Capture the props handed to the workspace subscript: the owner plus the report row.
let mockCapturedWorkspaceSubscriptAvatarProps: Record<string, unknown> = {};

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

jest.mock('@components/Avatar/connected/WorkspaceSubscriptAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedWorkspaceSubscriptAvatarProps = props;
        return <View testID="MockedWorkspaceSubscriptAvatar" />;
    };
});

const createExpenseReport = (overrides: Partial<Report> = {}): Report => ({
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    ownerAccountID: OWNER_ACCOUNT_ID,
    policyID: POLICY_ID,
    parentReportID: PARENT_REPORT_ID,
    ...overrides,
});

describe('ExpenseReportAvatar (connected)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedWorkspaceSubscriptAvatarProps = {};
        mockPersonalDetails = {
            [OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, login: OWNER_LOGIN, avatar: OWNER_AVATAR_URL},
        };
    });

    afterEach(async () => {
        // Unmount before clearing so the store updates from the clear don't reach a mounted component outside act().
        cleanup();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('should hand the owner and the report row to the workspace subscript with the props forwarded', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport());
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                containerStyle={CONTAINER_STYLE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );
        // useOnyx delivers its initial value asynchronously, so flush it inside act() before asserting.
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('MockedWorkspaceSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedWorkspaceSubscriptAvatarProps).toEqual({
            report: expect.objectContaining({ownerAccountID: OWNER_ACCOUNT_ID, policyID: POLICY_ID}),
            primaryAvatar: expect.objectContaining({id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: OWNER_AVATAR_URL, name: OWNER_LOGIN}),
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: CONTAINER_STYLE,
            fallbackDisplayName: FALLBACK_NAME,
        });
        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).not.toHaveProperty('copilot');
    });

    it.each([
        ['parentReportID', {parentReportActionID: PARENT_REPORT_ACTION_ID}],
        // An optimistic expense report links its workspace chat only through chatReportID.
        ['chatReportID only', {parentReportActionID: PARENT_REPORT_ACTION_ID, parentReportID: undefined, chatReportID: PARENT_REPORT_ID}],
    ])('should render the copilot as the primary avatar when the parent action carries a delegate (chat linked via %s)', async (_case, reportOverrides) => {
        mockPersonalDetails[DELEGATE_ACCOUNT_ID] = {accountID: DELEGATE_ACCOUNT_ID, login: DELEGATE_LOGIN, avatar: DELEGATE_AVATAR_URL};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport(reportOverrides));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
            [PARENT_REPORT_ACTION_ID]: {
                reportActionID: PARENT_REPORT_ACTION_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                actorAccountID: OWNER_ACCOUNT_ID,
                delegateAccountID: DELEGATE_ACCOUNT_ID,
                created: '2024-01-01 00:00:00',
            },
        });
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).toEqual(
            expect.objectContaining({
                id: DELEGATE_ACCOUNT_ID,
                source: DELEGATE_AVATAR_URL,
                copilot: {accountID: DELEGATE_ACCOUNT_ID, actedForAccountID: OWNER_ACCOUNT_ID},
            }),
        );
    });

    it('should render the fallback avatar as the primary when the report has no owner', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport({ownerAccountID: undefined}));
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).toEqual(
            expect.objectContaining({id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar}),
        );
    });

    it('should seed the default avatar from the account ID when the owner is missing from personal details', async () => {
        mockPersonalDetails = {};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport());
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).toEqual(
            expect.objectContaining({id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: getDefaultAvatarURL({accountID: OWNER_ACCOUNT_ID})}),
        );
    });

    it('should hand over an undefined report row while it has not loaded', async () => {
        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedWorkspaceSubscriptAvatarProps.report).toBeUndefined();
        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).toEqual(expect.objectContaining({id: CONST.DEFAULT_NUMBER_ID}));
    });
});
