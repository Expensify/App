import {act, fireEvent, render, screen, within} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {MenuItemProps} from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {requestMoney} from '@libs/actions/IOU';
import IOURequestStepConfirmation from '@pages/iou/request/step/IOURequestStepConfirmation';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import createRandomPolicy from '../utils/collections/policies';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/MenuItemWithTopDescription', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View, Text} = require('react-native');
    return (props: MenuItemProps) => (
        <View
            testID={`menu-item-${props.description}`}
            accessibilityLabel={props.description}
        >
            <Text>{props.description}</Text>
            <Text>{props.title}</Text>
        </View>
    );
});

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('@libs/actions/IOU', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...jest.requireActual('@libs/actions/IOU'),
        startMoneyRequest: jest.fn(),
        requestMoney: jest.fn(() => ({iouReport: undefined})),
    };
});

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Money_Request_Step_Confirmation',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Confirmation',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        dismissModalWithReport: jest.fn(),
        navigationRef: mockRef,
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Confirmation',
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
const REPORT_ID = '1';
const PARTICIPANT_ACCOUNT_ID = 2;
const TRANSACTION_ID = '1';
const POLICY_ID = 'test-policy-id';
const POLICY_CHAT_REPORT_ID = '595';

function createPolicyWithTimeTracking(): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test Policy'),
        id: POLICY_ID,
        outputCurrency: CONST.CURRENCY.USD,
        units: {
            time: {
                enabled: true,
                rate: 5000, // $50.00 per hour
            },
        },
    };
}

const DEFAULT_TIME_TRANSACTION: Transaction = {
    amount: 40000, // $400.00 (8 hours * $50/hr)
    billable: false,
    comment: {
        units: {
            count: 8,
            rate: 5000, // $50.00 per hour
            unit: CONST.TIME_TRACKING.UNIT.HOUR,
        },
    },
    created: '2025-01-15',
    currency: CONST.CURRENCY.USD,
    isFromGlobalCreate: false,
    merchant: '8 hours @ $50.00 / hour',
    participants: [{accountID: PARTICIPANT_ACCOUNT_ID, selected: true}],
    participantsAutoAssigned: false,
    reimbursable: true,
    reportID: REPORT_ID,
    transactionID: TRANSACTION_ID,
    iouRequestType: CONST.IOU.REQUEST_TYPE.TIME,
};

function renderConfirmation(action: IOUAction = CONST.IOU.ACTION.CREATE) {
    return render(
        <OnyxListItemProvider>
            <HTMLEngineProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepConfirmation
                            route={{
                                key: SCREENS.MONEY_REQUEST.STEP_CONFIRMATION,
                                name: SCREENS.MONEY_REQUEST.STEP_CONFIRMATION,
                                params: {
                                    action,
                                    iouType: CONST.IOU.TYPE.SUBMIT,
                                    transactionID: TRANSACTION_ID,
                                    reportID: POLICY_CHAT_REPORT_ID,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </HTMLEngineProvider>
        </OnyxListItemProvider>,
    );
}

describe('TimeExpenseConfirmationTest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createPolicyWithTimeTracking());
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${POLICY_CHAT_REPORT_ID}`, {
                reportID: POLICY_CHAT_REPORT_ID,
                policyID: POLICY_ID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            });
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    async function setupTransaction(overrides: Partial<Transaction> = {}) {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                ...DEFAULT_TIME_TRANSACTION,
                participants: [{isPolicyExpenseChat: true, selected: true, reportID: POLICY_CHAT_REPORT_ID}],
                ...overrides,
            });
        });
    }

    describe('time expense display', () => {
        it('should display Hours row with correct count', async () => {
            await setupTransaction();

            renderConfirmation();
            await waitForBatchedUpdatesWithAct();

            const hoursRow = screen.getByTestId('menu-item-Hours');
            expect(within(hoursRow).getByText('8')).toBeDefined();
        });

        it('should display Rate row with formatted rate', async () => {
            await setupTransaction();

            renderConfirmation();
            await waitForBatchedUpdatesWithAct();

            const rateRow = screen.getByTestId('menu-item-Rate');
            expect(within(rateRow).getByText(/\$50\.00 \/ hour/)).toBeDefined();
        });

        it('should display correct total amount', async () => {
            await setupTransaction();

            renderConfirmation();
            await waitForBatchedUpdatesWithAct();

            const amountRow = screen.getByTestId('menu-item-Amount');
            expect(within(amountRow).getByText(/\$400\.00/)).toBeDefined();
        });
    });

    describe('hidden fields for time expenses', () => {
        it('should not display Merchant row', async () => {
            await setupTransaction();

            renderConfirmation();
            await waitForBatchedUpdatesWithAct();

            // Merchant row should not be shown for time expenses during CREATE
            expect(screen.queryByTestId('menu-item-Merchant')).toBeNull();
        });

        it('should not display Tax row', async () => {
            await setupTransaction();

            renderConfirmation();
            await waitForBatchedUpdatesWithAct();

            // Tax is disabled for time expenses (isTaxTrackingEnabled returns false)
            expect(screen.queryByTestId('menu-item-Tax')).toBeNull();
        });

        it('should display Merchant but not Hours and Rate when action is submit', async () => {
            await setupTransaction();

            renderConfirmation(CONST.IOU.ACTION.SUBMIT);
            await waitForBatchedUpdatesWithAct();

            // Merchant is shown for non-CREATE actions
            expect(screen.getByTestId('menu-item-Merchant')).toBeDefined();

            // Hours and Rate are only shown during CREATE
            expect(screen.queryByTestId('menu-item-Hours')).toBeNull();
            expect(screen.queryByTestId('menu-item-Rate')).toBeNull();
        });
    });

    describe('time expense with different currencies', () => {
        it('should display time expense in EUR', async () => {
            const policy = createPolicyWithTimeTracking();
            policy.outputCurrency = CONST.CURRENCY.EUR;

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            });

            await setupTransaction({
                currency: CONST.CURRENCY.EUR,
                merchant: '8 hours @ €50.00 / hour',
            });

            renderConfirmation();
            await waitForBatchedUpdatesWithAct();

            const rateRow = screen.getByTestId('menu-item-Rate');
            expect(within(rateRow).getByText(/€50\.00 \/ hour/)).toBeDefined();
        });
    });

    describe('time expense submission', () => {
        it('should allow submission of valid time expense', async () => {
            await setupTransaction();

            renderConfirmation();
            await waitForBatchedUpdatesWithAct();

            const submitButton = screen.getByText(/create.*expense/i);
            fireEvent.press(submitButton);
            await waitForBatchedUpdatesWithAct();

            expect(requestMoney).toHaveBeenCalled();
        });

        it('should show error when rate and hours result in too large amount', async () => {
            await setupTransaction({
                comment: {
                    units: {
                        count: 100000,
                        rate: 10000000, // $100,000.00/hr
                        unit: CONST.TIME_TRACKING.UNIT.HOUR,
                    },
                },
                // 100000 * 10000000 = 1,000,000,000,000 cents = $10,000,000,000.00 (11 digits, exceeds max)
                amount: 1000000000000,
                merchant: '100000 hours @ $100,000.00 / hour',
            });

            renderConfirmation();
            await waitForBatchedUpdatesWithAct();

            const submitButton = screen.getByText(/create.*expense/i);
            fireEvent.press(submitButton);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/total amount is too large/i)).toBeDefined();
            expect(requestMoney).not.toHaveBeenCalled();
        });
    });
});
