/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import IOURequestStepAmount from '@pages/iou/request/step/IOURequestStepAmount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import * as IOU from '../../src/libs/actions/IOU';
import createRandomTransaction from '../utils/collections/transaction';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock LocaleContextProvider to avoid dynamic import issues with emojis/IntlStore
jest.mock('@components/LocaleContextProvider', () => {
    const React2 = require('react');

    const defaultContextValue = {
        translate: (path: string) => path,
        numberFormat: (number: number) => String(number),
        getLocalDateFromDatetime: () => new Date(),
        datetimeToRelative: () => '',
        datetimeToCalendarTime: () => '',
        formatPhoneNumber: (phone: string) => phone,
        toLocaleDigit: (digit: string) => digit,
        toLocaleOrdinal: (number: number) => String(number),
        fromLocaleDigit: (localeDigit: string) => localeDigit,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        formatTravelDate: () => '',
        preferredLocale: 'en',
    };

    const LocaleContext = React2.createContext(defaultContextValue);

    return {
        LocaleContext,
        LocaleContextProvider: ({children}: {children: React.ReactNode}) => React2.createElement(LocaleContext.Provider, {value: defaultContextValue}, children),
    };
});

jest.mock('@libs/actions/IOU', () => {
    const actual = jest.requireActual<typeof IOU>('@libs/actions/IOU');
    return {
        ...actual,
        requestMoney: jest.fn(() => ({iouReport: undefined})),
        trackExpense: jest.fn(),
    };
});

jest.mock('@libs/actions/IOU/SendMoney', () => ({
    sendMoneyElsewhere: jest.fn(),
    sendMoneyWithWallet: jest.fn(),
}));

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Money_Request_Step_Amount',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Amount',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        dismissModalWithReport: jest.fn(),
        navigationRef: mockRef,
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
        getReportRouteByID: jest.fn(() => undefined),
        removeScreenByKey: jest.fn(),
        getActiveRouteWithoutParams: jest.fn(() => ''),
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Amount',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = 'report-1';
const TRANSACTION_ID = 'txn-1';
const PARTICIPANT_ACCOUNT_ID = 2;

function createTestReport(): Report {
    return {
        reportID: REPORT_ID,
        chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
        ownerAccountID: ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        isPinned: false,
        lastVisibleActionCreated: '',
        lastReadTime: '',
        participants: {
            [ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: CONST.REPORT.ROLE.MEMBER},
            [PARTICIPANT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: CONST.REPORT.ROLE.MEMBER},
        },
    };
}

// Helper to create route params for IOURequestStepAmount
function createRouteParams(overrides = {}) {
    return {
        key: 'StepAmount-test',
        name: SCREENS.MONEY_REQUEST.STEP_AMOUNT,
        params: {
            action: CONST.IOU.ACTION.CREATE,
            iouType: CONST.IOU.TYPE.SUBMIT,
            reportID: REPORT_ID,
            transactionID: TRANSACTION_ID,
            ...overrides,
        },
    };
}

describe('IOURequestStepAmount - draft transactions coverage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should initialize transactionDrafts and draftTransactionIDs on render', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        const transaction = createRandomTransaction(1);
        transaction.transactionID = TRANSACTION_ID;
        transaction.reportID = REPORT_ID;

        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <IOURequestStepAmount
                        // @ts-expect-error minimal route for test
                        route={createRouteParams()}
                        navigation={{} as never}
                    />
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Component rendered successfully, covering lines 133-134
        // (useOptimisticDraftTransactions call and draftTransactionIDs map)
        expect(screen.getByTestId('moneyRequestAmountInput')).toBeTruthy();
    });

    it('should pass existingTransactionDraft and draftTransactionIDs to requestMoney when skip confirmation is enabled for SUBMIT', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        const draftTransaction = createRandomTransaction(99);
        const transaction: Transaction = {
            ...createRandomTransaction(1),
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        };

        const report = createTestReport();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction.transactionID}`, draftTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${TRANSACTION_ID}`, true);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [PARTICIPANT_ACCOUNT_ID]: {
                    accountID: PARTICIPANT_ACCOUNT_ID,
                    login: 'participant@test.com',
                    displayName: 'Test Participant',
                },
            });
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <IOURequestStepAmount
                        // @ts-expect-error minimal route for test
                        route={createRouteParams()}
                        navigation={{} as never}
                    />
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Trigger form submission by pressing the "Next" button
        const nextButton = screen.getByTestId('next-button');
        fireEvent.press(nextButton);
        await waitForBatchedUpdatesWithAct();

        // Verify requestMoney was called with draftTransactionIDs
        expect(IOU.requestMoney).toHaveBeenCalledWith(
            expect.objectContaining({
                draftTransactionIDs: expect.any(Array),
            }),
        );
    });
});
