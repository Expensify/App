import {render, screen} from '@testing-library/react-native';

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

        expect(screen.getByTestId('MockedWorkspaceSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedWorkspaceSubscriptAvatarProps).toEqual({
            report: expect.objectContaining({ownerAccountID: OWNER_ACCOUNT_ID, policyID: POLICY_ID}),
            primaryAvatar: expect.objectContaining({id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: OWNER_AVATAR_URL, name: OWNER_LOGIN}),
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: CONTAINER_STYLE,
            fallbackDisplayName: FALLBACK_NAME,
        });
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

        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).toEqual(
            expect.objectContaining({id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: getDefaultAvatarURL({accountID: OWNER_ACCOUNT_ID})}),
        );
    });

    it('should hand over an undefined report row while it has not loaded', () => {
        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedWorkspaceSubscriptAvatarProps.report).toBeUndefined();
        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).toEqual(expect.objectContaining({id: CONST.DEFAULT_NUMBER_ID}));
    });
});
