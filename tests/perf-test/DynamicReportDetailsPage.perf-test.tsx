import {act, render, screen} from '@testing-library/react-native';

import {loadExpensifyIconsChunk} from '@components/Icon/ExpensifyIconLoader';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';
import {buildParticipantsFromAccountIDs} from '@libs/ReportUtils';

import DynamicReportDetailsPage from '@pages/DynamicReportDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, Report, ReportAction, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';
import {measureAsyncFunction, measureRenders} from 'reassure';

import createRandomReportAction from '../utils/collections/reportActions';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn(() => false));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_LOGIN = 'user1@test.com';
const MEMBER_COUNT = 50;
const POLICY_ID = '1';
const ROOM_REPORT_ID = '100';
const SELF_DM_REPORT_ID = '200';
const TRACK_EXPENSE_REPORT_ID = '201';
const TRACK_EXPENSE_ACTION_ID = '202';
const TRACK_TRANSACTION_ID = '203';

const navigationMock = createMock<PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['navigation']>({});
const getRouteMock = (reportID: string) => createMock<PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['route']>({params: {reportID}});

const memberAccountIDs = Array.from({length: MEMBER_COUNT}, (_, index) => index + 1);
const personalDetails: PersonalDetailsList = Object.fromEntries(
    memberAccountIDs.map((accountID) => [
        accountID,
        {
            accountID,
            login: `user${accountID}@test.com`,
            displayName: `User ${accountID}`,
            avatar: 'none',
        },
    ]),
);

const policy = {
    ...LHNTestUtils.getFakePolicy(POLICY_ID, 'Perf Workspace'),
    owner: CURRENT_USER_LOGIN,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    employeeList: {
        [CURRENT_USER_LOGIN]: {email: CURRENT_USER_LOGIN, role: CONST.POLICY.ROLE.ADMIN},
    },
};

// A user-created policy room with many members: shows "Go to room", "Members", "Settings" and "Leave".
const policyRoom: Report = {
    reportID: ROOM_REPORT_ID,
    reportName: '#perf-room',
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
    policyID: POLICY_ID,
    visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
    writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
    participants: buildParticipantsFromAccountIDs(memberAccountIDs),
    lastMessageText: 'hey',
};

// A tracked expense in the self DM: exercises the heaviest menu branch (submit-to-friend / submit-to-employer).
const selfDMReport: Report = {
    reportID: SELF_DM_REPORT_ID,
    reportName: '',
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    participants: buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID]),
};
const trackExpenseReport: Report = {
    reportID: TRACK_EXPENSE_REPORT_ID,
    reportName: 'Expense',
    type: CONST.REPORT.TYPE.CHAT,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    parentReportID: SELF_DM_REPORT_ID,
    parentReportActionID: TRACK_EXPENSE_ACTION_ID,
    participants: buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID]),
};
const trackExpenseAction = {
    ...createRandomReportAction(Number(TRACK_EXPENSE_ACTION_ID)),
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    actorAccountID: CURRENT_USER_ACCOUNT_ID,
    childReportID: TRACK_EXPENSE_REPORT_ID,
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
        IOUTransactionID: TRACK_TRANSACTION_ID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
    },
    pendingAction: null,
} as ReportAction;
const trackTransaction: Transaction = {
    ...createRandomTransaction(Number(TRACK_TRANSACTION_ID)),
    transactionID: TRACK_TRANSACTION_ID,
    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
    comment: {liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.ALLOW},
};

const settledLoadingState = {
    isLoadingInitialReportActions: false,
    hasOnceLoadedReportActions: true,
    isLoadingOlderReportActions: false,
    isLoadingNewerReportActions: false,
    // Marks the private notes fetch as already triggered so the page does not fire an API call on mount.
    isLoadingPrivateNotes: false,
};

function renderDetailsPage(reportID: string, report: Report) {
    return (
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <DynamicReportDetailsPage
                    betas={[]}
                    isLoadingReportData={false}
                    navigation={navigationMock}
                    policy={undefined}
                    report={report}
                    reportMetadata={undefined}
                    reportLoadingState={undefined}
                    route={getRouteMock(reportID)}
                />
            </LocaleContextProvider>
        </OnyxListItemProvider>
    );
}

async function seedPolicyRoom() {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${ROOM_REPORT_ID}`, policyRoom);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${ROOM_REPORT_ID}`, settledLoadingState);
        await waitForBatchedUpdates();
    });
}

async function seedTrackExpense() {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, selfDMReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${TRACK_EXPENSE_REPORT_ID}`, trackExpenseReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_REPORT_ID}`, {[TRACK_EXPENSE_ACTION_ID]: trackExpenseAction});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRACK_TRANSACTION_ID}`, trackTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${TRACK_EXPENSE_REPORT_ID}`, settledLoadingState);
        await waitForBatchedUpdates();
    });
}

describe('DynamicReportDetailsPage', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        // Load the icon chunk once so the menu rows render their icons synchronously instead of after an async state update.
        await loadExpensifyIconsChunk();
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        setHasRadio(true);
        await act(async () => {
            TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, CURRENT_USER_LOGIN);
            await waitForBatchedUpdates();
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT,
                [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                [ONYXKEYS.IS_DEBUG_MODE_ENABLED]: false,
            });
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    test('[DynamicReportDetailsPage] should mount policy room details with 50 members', async () => {
        await seedPolicyRoom();
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('common.settings'));
        };
        await measureRenders(renderDetailsPage(ROOM_REPORT_ID, policyRoom), {scenario});
    });

    test('[DynamicReportDetailsPage] should mount self-DM tracked expense details', async () => {
        await seedTrackExpense();
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('actionableMentionTrackExpense.submitToEmployer'));
        };
        await measureRenders(renderDetailsPage(TRACK_EXPENSE_REPORT_ID, trackExpenseReport), {scenario});
    });

    test('[DynamicReportDetailsPage] should re-render mounted policy room details when the quick action changes', async () => {
        await seedPolicyRoom();
        render(renderDetailsPage(ROOM_REPORT_ID, policyRoom));
        await waitForBatchedUpdatesWithAct();
        await screen.findByText(TestHelper.translateLocal('common.settings'));

        let iteration = 0;
        await measureAsyncFunction(async () => {
            iteration++;
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {action: CONST.QUICK_ACTIONS.REQUEST_MANUAL, chatReportID: `${iteration}`});
                await waitForBatchedUpdates();
            });
        });
    });

    test('[DynamicReportDetailsPage] should re-render mounted policy room details when debug mode toggles', async () => {
        await seedPolicyRoom();
        render(renderDetailsPage(ROOM_REPORT_ID, policyRoom));
        await waitForBatchedUpdatesWithAct();
        await screen.findByText(TestHelper.translateLocal('common.settings'));

        let iteration = 0;
        await measureAsyncFunction(async () => {
            iteration++;
            await act(async () => {
                await Onyx.set(ONYXKEYS.IS_DEBUG_MODE_ENABLED, iteration % 2 === 1);
                await waitForBatchedUpdates();
            });
        });
    });

    test('[DynamicReportDetailsPage] should re-render mounted policy room details when the report last message changes', async () => {
        await seedPolicyRoom();
        render(renderDetailsPage(ROOM_REPORT_ID, policyRoom));
        await waitForBatchedUpdatesWithAct();
        await screen.findByText(TestHelper.translateLocal('common.settings'));

        let iteration = 0;
        await measureAsyncFunction(async () => {
            iteration++;
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${ROOM_REPORT_ID}`, {lastMessageText: `message ${iteration}`});
                await waitForBatchedUpdates();
            });
        });
    });
});
