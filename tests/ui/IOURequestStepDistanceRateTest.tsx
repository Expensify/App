import {act, render, screen} from '@testing-library/react-native';

import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import IOURequestStepDistanceRate from '@pages/iou/request/step/IOURequestStepDistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModalWithReport: jest.fn(),
    isNavigationReady: () => Promise.resolve(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
    useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
    useFocusEffect: jest.fn(),
    useRoute: () => ({params: {}}),
    usePreventRemove: jest.fn(),
}));

// The page is gated by report/transaction "not found" HOCs; short-circuit that gate for the test.
jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => () => false);

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const TRANSACTION_ID = 'transaction-1';
const REPORT_ID = 'report-1';
const POLICY_ID = 'policy-1';
const CUSTOM_UNIT_ID = 'unit-1';
// "rate07" sorts to the middle alphabetically, so seeing it first proves pinning (not the sort) put it there.
const CURRENT_RATE_ID = 'rate07';

/** Build `count` mileage rates keyed rate00..rate{count-1} (zero-padded so name sort is numeric). */
function buildRates(count: number) {
    const rates: Record<string, unknown> = {};
    for (let index = 0; index < count; index++) {
        const id = `rate${String(index).padStart(2, '0')}`;
        rates[id] = {
            attributes: {},
            currency: CONST.CURRENCY.USD,
            customUnitRateID: id,
            enabled: true,
            name: `Rate ${String(index).padStart(2, '0')}`,
            rate: 100 + index,
            subRates: [],
        };
    }
    return rates;
}

function buildPolicy(rateCount: number): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        role: 'admin',
        type: CONST.POLICY.TYPE.CORPORATE,
        owner: ACCOUNT_LOGIN,
        outputCurrency: CONST.CURRENCY.USD,
        isPolicyExpenseChatEnabled: true,
        customUnits: {
            [CUSTOM_UNIT_ID]: {
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                customUnitID: CUSTOM_UNIT_ID,
                defaultCategory: '',
                enabled: true,
                name: 'Distance',
                rates: buildRates(rateCount),
            },
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only policy stub
    } as unknown as Policy;
}

const report = {
    reportID: REPORT_ID,
    policyID: POLICY_ID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    type: CONST.REPORT.TYPE.CHAT,
    ownerAccountID: ACCOUNT_ID,
    isOwnPolicyExpenseChat: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only report stub
} as unknown as Report;

const transactionDraft = {
    transactionID: TRANSACTION_ID,
    reportID: REPORT_ID,
    currency: CONST.CURRENCY.USD,
    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
    comment: {
        customUnit: {
            customUnitID: CUSTOM_UNIT_ID,
            customUnitRateID: CURRENT_RATE_ID,
            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only transaction stub
} as unknown as Transaction;

function renderPage() {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <CurrencyListContextProvider>
                    <IOURequestStepDistanceRate
                        route={{
                            key: 'IOURequestStepDistanceRate',
                            name: SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE,
                            params: {
                                iouType: CONST.IOU.TYPE.SUBMIT,
                                reportID: REPORT_ID,
                                transactionID: TRANSACTION_ID,
                                action: CONST.IOU.ACTION.CREATE,
                                reportActionID: '1',
                            },
                        }}
                        // @ts-expect-error navigation param is not needed for this test
                        navigation={undefined}
                    />
                </CurrencyListContextProvider>
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

const rowOrder = () => screen.getAllByTestId(new RegExp(`^${CONST.BASE_LIST_ITEM_TEST_ID}`)).map((node) => String(node.props.testID));

describe('IOURequestStepDistanceRate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transactionDraft);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('pins the current rate to the top of a long rate list on open', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT + 2));
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const order = rowOrder();
        // The current rate is pinned first even though "Rate 00" sorts ahead of it alphabetically.
        expect(order.at(0)).toBe(`${CONST.BASE_LIST_ITEM_TEST_ID}${CURRENT_RATE_ID}`);
        expect(order.indexOf(`${CONST.BASE_LIST_ITEM_TEST_ID}${CURRENT_RATE_ID}`)).toBeLessThan(order.indexOf(`${CONST.BASE_LIST_ITEM_TEST_ID}rate00`));
    });

    it('does not reorder when the rate list is under the item-limit threshold', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT - 2));
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const order = rowOrder();
        // Below the threshold moveInitialSelectionToTop is a no-op, so natural alphabetical order is kept.
        expect(order.at(0)).toBe(`${CONST.BASE_LIST_ITEM_TEST_ID}rate00`);
    });
});
