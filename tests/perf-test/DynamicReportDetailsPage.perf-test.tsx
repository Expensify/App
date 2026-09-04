import {fireEvent, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';
import {buildParticipantsFromAccountIDs} from '@libs/ReportUtils';

import DynamicReportDetailsPage from '@pages/DynamicReportDetailsPage';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, Policy, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn(() => false));

// Lazy icon loading resolves asynchronously and would add non-deterministic renders to every measurement.
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({}),
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
        useRoute: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_LOGIN = 'perf@user.com';
const PARTICIPANT_COUNT = 20;
const ROOM_ACTIONS_COUNT = 30;
const UPDATES_PER_SCENARIO = 5;

const POLICY_ID = 'P1';
const ROOM_REPORT_ID = '100';
const EXPENSE_REPORT_ID = '200';
const EXPENSE_CHAT_REPORT_ID = '201';
const TRANSACTION_THREAD_REPORT_ID = '301';
const IOU_ACTION_ID = '1001';
const TRANSACTION_ID = 't1';

const navigationMock = createMock<PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['navigation']>({});
const getRouteMock = (reportID: string) => createMock<PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['route']>({params: {reportID}});

const participantAccountIDs = Array.from({length: PARTICIPANT_COUNT}, (_, index) => index + 1);

function buildPersonalDetails(): PersonalDetailsList {
    return Object.fromEntries(
        participantAccountIDs.map((accountID) => [
            accountID,
            {
                accountID,
                login: accountID === CURRENT_USER_ACCOUNT_ID ? CURRENT_USER_LOGIN : `user${accountID}@test.com`,
                displayName: `User ${accountID}`,
                firstName: 'User',
                lastName: `${accountID}`,
                avatar: `https://example.com/avatar-${accountID}.png`,
            },
        ]),
    );
}

const policy: Policy = {
    id: POLICY_ID,
    name: 'Perf Workspace',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: CURRENT_USER_LOGIN,
    outputCurrency: CONST.CURRENCY.USD,
    areReportFieldsEnabled: true,
    employeeList: {
        [CURRENT_USER_LOGIN]: {
            email: CURRENT_USER_LOGIN,
            role: CONST.POLICY.ROLE.ADMIN,
        },
    },
};

const roomReport: Report = {
    ...createRandomReport(Number(ROOM_REPORT_ID), CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
    type: CONST.REPORT.TYPE.CHAT,
    policyID: POLICY_ID,
    reportName: '#perf-room',
    description: 'Room used for perf measurements',
    visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
    participants: buildParticipantsFromAccountIDs(participantAccountIDs),
    parentReportID: undefined,
    parentReportActionID: undefined,
    isPinned: false,
};

function buildRoomActions(count: number, startIndex = 1): ReportActions {
    return Object.fromEntries(
        Array.from({length: count}, (_, index) => {
            const actionID = `${startIndex + index}`;
            return [
                actionID,
                {
                    ...createRandomReportAction(Number(actionID)),
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    actorAccountID: participantAccountIDs.at(index % PARTICIPANT_COUNT),
                    pendingAction: null,
                } as ReportAction,
            ];
        }),
    );
}

const expenseChatReport: Report = {
    ...createRandomReport(Number(EXPENSE_CHAT_REPORT_ID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
    type: CONST.REPORT.TYPE.CHAT,
    policyID: POLICY_ID,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    isOwnPolicyExpenseChat: true,
    participants: buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID, 2]),
    parentReportID: undefined,
    parentReportActionID: undefined,
};

const expenseReport: Report = {
    ...createRandomReport(Number(EXPENSE_REPORT_ID), undefined),
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: POLICY_ID,
    chatReportID: EXPENSE_CHAT_REPORT_ID,
    reportName: 'Perf expense report',
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    managerID: 2,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    total: -5000,
    currency: CONST.CURRENCY.USD,
    participants: buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID, 2]),
    parentReportID: undefined,
    parentReportActionID: undefined,
    isPinned: false,
};

const iouAction = {
    ...createRandomReportAction(Number(IOU_ACTION_ID)),
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    actorAccountID: CURRENT_USER_ACCOUNT_ID,
    childReportID: TRANSACTION_THREAD_REPORT_ID,
    originalMessage: {
        IOUReportID: EXPENSE_REPORT_ID,
        IOUTransactionID: TRANSACTION_ID,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: 5000,
        currency: CONST.CURRENCY.USD,
    },
    pendingAction: null,
} as ReportAction;

const transactionThreadReport: Report = {
    ...createRandomReport(Number(TRANSACTION_THREAD_REPORT_ID), undefined),
    type: CONST.REPORT.TYPE.CHAT,
    policyID: POLICY_ID,
    parentReportID: EXPENSE_REPORT_ID,
    parentReportActionID: IOU_ACTION_ID,
    participants: buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID, 2]),
    isPinned: false,
};

const transaction: Transaction = {
    ...createRandomTransaction(1),
    transactionID: TRANSACTION_ID,
    reportID: EXPENSE_REPORT_ID,
    amount: 5000,
    currency: CONST.CURRENCY.USD,
    cardID: undefined,
    managedCard: false,
    bank: '',
    comment: {
        comment: 'Perf transaction',
        liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.ALLOW,
    },
};

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>{children}</ComposeProviders>;
}

// withReportOrNotFound reads the report from Onyx by the route reportID, so the report prop only satisfies the wrapped props type.
function renderPage(report: Report) {
    return (
        <DynamicReportDetailsPage
            betas={[]}
            isLoadingReportData={false}
            navigation={navigationMock}
            policy={undefined}
            report={report}
            reportMetadata={undefined}
            reportLoadingState={undefined}
            route={getRouteMock(report.reportID)}
        />
    );
}

async function seedCommonData() {
    await Promise.all([
        Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false),
        Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, buildPersonalDetails()),
        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy),
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${ROOM_REPORT_ID}`, roomReport),
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_CHAT_REPORT_ID}`, expenseChatReport),
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, expenseReport),
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${TRANSACTION_THREAD_REPORT_ID}`, transactionThreadReport),
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ROOM_REPORT_ID}`, buildRoomActions(ROOM_ACTIONS_COUNT)),
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, {
            [IOU_ACTION_ID]: iouAction,
        }),
        Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction),
        Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${ROOM_REPORT_ID}`, {isLoadingInitialReportActions: false}),
        Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${EXPENSE_REPORT_ID}`, {isLoadingInitialReportActions: false}),
        Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${TRANSACTION_THREAD_REPORT_ID}`, {isLoadingInitialReportActions: false}),
    ]);
    await waitForBatchedUpdates();
}

async function mergeAndFlush<TKey extends Parameters<typeof Onyx.merge>[0]>(key: TKey, value: Parameters<typeof Onyx.merge<TKey>>[1]) {
    await Onyx.merge(key, value);
    await waitForBatchedUpdates();
}

describe('DynamicReportDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        setHasRadio(true);
        jest.mocked(useIsFocused).mockReturnValue(true);
        jest.mocked(useRoute).mockReturnValue({
            key: 'report-details',
            name: 'Report_Details_Root',
            params: {},
        } as ReturnType<typeof useRoute>);
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, CURRENT_USER_LOGIN);
        await seedCommonData();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('[DynamicReportDetailsPage] should render a workspace room with members and actions', async () => {
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('common.members'));
        };

        await measureRenders(renderPage(roomReport), {
            scenario,
            wrapper: Wrapper,
        });
    });

    test('[DynamicReportDetailsPage] should render an expense report', async () => {
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('common.longReportID'));
        };

        await measureRenders(renderPage(expenseReport), {
            scenario,
            wrapper: Wrapper,
        });
    });

    test('[DynamicReportDetailsPage] should render a transaction thread with the delete action', async () => {
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('reportActionContextMenu.deleteAction', iouAction));
        };

        await measureRenders(renderPage(transactionThreadReport), {
            scenario,
            wrapper: Wrapper,
        });
    });

    test('[DynamicReportDetailsPage] should re-render a workspace room when participant personal details change', async () => {
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('common.members'));

            for (let index = 0; index < UPDATES_PER_SCENARIO; index++) {
                const accountID = participantAccountIDs.at(index + 1) ?? 2;
                await mergeAndFlush(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [accountID]: {displayName: `Renamed ${index}`},
                });
            }
        };

        await measureRenders(renderPage(roomReport), {
            scenario,
            wrapper: Wrapper,
        });
    });

    test('[DynamicReportDetailsPage] should re-render a workspace room when new report actions arrive', async () => {
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('common.members'));

            for (let index = 0; index < UPDATES_PER_SCENARIO; index++) {
                await mergeAndFlush(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ROOM_REPORT_ID}`, buildRoomActions(1, ROOM_ACTIONS_COUNT + 1 + index));
            }
        };

        await measureRenders(renderPage(roomReport), {
            scenario,
            wrapper: Wrapper,
        });
    });

    test('[DynamicReportDetailsPage] should re-render a workspace room when the report itself updates', async () => {
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('common.members'));

            for (let index = 0; index < UPDATES_PER_SCENARIO; index++) {
                await mergeAndFlush(`${ONYXKEYS.COLLECTION.REPORT}${ROOM_REPORT_ID}`, {
                    lastMessageText: `message ${index}`,
                    lastVisibleActionCreated: `2026-01-01 00:00:0${index}.000`,
                });
            }
        };

        await measureRenders(renderPage(roomReport), {
            scenario,
            wrapper: Wrapper,
        });
    });

    test('[DynamicReportDetailsPage] should re-render a transaction thread when the transaction updates', async () => {
        const scenario = async () => {
            await screen.findByText(TestHelper.translateLocal('reportActionContextMenu.deleteAction', iouAction));

            for (let index = 0; index < UPDATES_PER_SCENARIO; index++) {
                await mergeAndFlush(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {
                    amount: 5000 + index,
                    comment: {comment: `Perf transaction ${index}`},
                });
            }
        };

        await measureRenders(renderPage(transactionThreadReport), {
            scenario,
            wrapper: Wrapper,
        });
    });

    test('[DynamicReportDetailsPage] should pin and unpin a workspace room', async () => {
        const scenario = async () => {
            const pinButton = await screen.findByText(TestHelper.translateLocal('common.pin'));
            fireEvent.press(pinButton);
            await waitForBatchedUpdates();

            const unpinButton = await screen.findByText(TestHelper.translateLocal('common.unPin'));
            fireEvent.press(unpinButton);
            await waitForBatchedUpdates();

            await screen.findByText(TestHelper.translateLocal('common.pin'));
        };

        await measureRenders(renderPage(roomReport), {
            scenario,
            wrapper: Wrapper,
        });
    });
});
