import {act, render, screen} from '@testing-library/react-native';

import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import DynamicIOURequestStepDistanceRate from '@pages/iou/request/step/DynamicIOURequestStepDistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type ReactNative from 'react-native';

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

// The dynamic step derives its back path from the root navigation state, which isn't set up in this test.
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));

// Render FlashList as a plain ScrollView that mounts every row, so the test can assert the full data
// order instead of only the virtualized window (the real list scrolls to the focused rate on mount).
jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');

    const FlashList = ReactLocal.forwardRef<
        {scrollToIndex: (params: {index: number}) => void},
        Omit<React.ComponentProps<typeof RN.ScrollView>, 'children'> & {
            data?: unknown[];
            renderItem?: (info: {item: unknown; index: number; target: string}) => React.ReactNode;
            keyExtractor?: (item: unknown, index: number) => string;
            ListHeaderComponent?: React.ReactNode;
            ListFooterComponent?: React.ReactNode;
            getItemType?: unknown;
            extraData?: unknown;
            initialScrollIndex?: number;
            onEndReached?: unknown;
            onEndReachedThreshold?: unknown;
            ListFooterComponentStyle?: unknown;
        }
    >(
        (
            {
                data,
                renderItem,
                keyExtractor,
                ListHeaderComponent,
                ListFooterComponent,
                getItemType: _getItemType,
                extraData: _extraData,
                initialScrollIndex: _initialScrollIndex,
                onEndReached: _onEndReached,
                onEndReachedThreshold: _onEndReachedThreshold,
                ListFooterComponentStyle: _ListFooterComponentStyle,
                ...scrollViewProps
            },
            ref,
        ) => {
            ReactLocal.useImperativeHandle(ref, () => ({scrollToIndex: jest.fn()}));

            return ReactLocal.createElement(
                RN.ScrollView,
                scrollViewProps,
                ListHeaderComponent ?? null,
                ...(data ?? []).map((item, index) =>
                    ReactLocal.createElement(ReactLocal.Fragment, {key: keyExtractor?.(item, index) ?? String(index)}, renderItem?.({item, index, target: 'Cell'})),
                ),
                ListFooterComponent ?? null,
            );
        },
    );

    return {FlashList};
});

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only policy stub
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        role: 'admin',
        type: CONST.POLICY.TYPE.CORPORATE,
        owner: ACCOUNT_LOGIN,
        outputCurrency: CONST.CURRENCY.USD,
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
    } as unknown as Policy;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only report stub
const report = {
    reportID: REPORT_ID,
    policyID: POLICY_ID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    type: CONST.REPORT.TYPE.CHAT,
    ownerAccountID: ACCOUNT_ID,
    isOwnPolicyExpenseChat: true,
} as unknown as Report;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only transaction stub
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
} as unknown as Transaction;

function renderPage() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only route stub. The page only reads route.params
    const props = {
        route: {
            key: 'DynamicIOURequestStepDistanceRate',
            name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DISTANCE_RATE,
            params: {
                iouType: CONST.IOU.TYPE.SUBMIT,
                reportID: REPORT_ID,
                transactionID: TRANSACTION_ID,
                action: CONST.IOU.ACTION.CREATE,
                reportActionID: '1',
            },
        },
    } as React.ComponentProps<typeof DynamicIOURequestStepDistanceRate>;
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <CurrencyListContextProvider>
                    <DynamicIOURequestStepDistanceRate {...props} />
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
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT + 2));
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
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT - 2));
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const order = rowOrder();
        // Below the threshold moveInitialSelectionToTop is a no-op, so natural alphabetical order is kept.
        expect(order.at(0)).toBe(`${CONST.BASE_LIST_ITEM_TEST_ID}rate00`);
    });
});
