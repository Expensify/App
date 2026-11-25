import {act, render, screen} from '@testing-library/react-native';

import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type * as TextModule from '@components/Text';

import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import {IOURequestStepPerDiemContent as IOURequestStepPerDiem} from '@pages/iou/request/step/IOURequestStepPerDiem';
import PerDiemRatesGate from '@pages/iou/request/step/PerDiemRatesGate';

import {setCustomUnitID, setMoneyRequestCategory, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setTransactionReport} from '@userActions/Transaction';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createMock from '../utils/createMock';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockConfirmationProps = {
    route: {params: {iouType: string}};
};

// The rates are covered by PerDiemRatesGateTest, so most tests here only look at what the page does around them. The
// mock is a jest.fn so a test can put the real gate back when it checks which workspace's rates get fetched.
jest.mock('@pages/iou/request/step/PerDiemRatesGate', () => jest.fn(({children}: {children: ReactNode}) => children));

jest.mock('@libs/actions/Policy/PerDiem', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Policy/PerDiem'),
    fetchPerDiemRates: jest.fn(),
}));

// The expense form is heavy and has its own tests. The stub shows which iouType it was handed.
jest.mock('@pages/iou/request/step/IOURequestStepConfirmation', () => {
    const Text = jest.requireActual<typeof TextModule>('@components/Text').default;
    return {
        IOURequestStepConfirmationContentWithWritableReportOrNotFound: ({route}: MockConfirmationProps) => <Text>{`confirmation:${route.params.iouType}`}</Text>,
    };
});

jest.mock('@userActions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/MoneyRequest'),
    setCustomUnitID: jest.fn(),
    setMoneyRequestCategory: jest.fn(),
    setMoneyRequestParticipantsFromReport: jest.fn(),
}));

jest.mock('@userActions/Transaction', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Transaction'),
    setTransactionReport: jest.fn(),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const TRANSACTION_ID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
const REPORT_ID = 'report-1';
const POLICY_ID = 'policy-1';
const OTHER_POLICY_ID = 'policy-2';
const CUSTOM_UNIT_ID = 'per-diem-unit';
const DEFAULT_CATEGORY = 'Travel';

function createPerDiemPolicy(id = POLICY_ID): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Per diem policy'),
        id,
        customUnits: {
            [CUSTOM_UNIT_ID]: {
                customUnitID: CUSTOM_UNIT_ID,
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                enabled: true,
                defaultCategory: DEFAULT_CATEGORY,
                rates: {},
            },
        },
    };
}

function createDraft(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        amount: 0,
        currency: CONST.CURRENCY.USD,
        created: '',
        merchant: '',
        iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
        ...overrides,
    };
}

type PerDiemScreenProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>;

const mockSetParams = jest.fn();
const navigation = createMock<PerDiemScreenProps['navigation']>({setParams: mockSetParams});

type PageProps = {transaction: Transaction; report?: Report; explicitPolicyID?: string; iouType?: IOUType};

function buildPage({transaction, report, explicitPolicyID, iouType = CONST.IOU.TYPE.CREATE}: PageProps) {
    return (
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <LocaleContextProvider>
                    <CurrencyListContextProvider>
                        <IOURequestStepPerDiem
                            route={createMock<PerDiemScreenProps['route']>({
                                key: 'IOURequestStepPerDiem',
                                name: SCREENS.MONEY_REQUEST.CREATE,
                                params: {iouType, transactionID: TRANSACTION_ID, reportID: REPORT_ID},
                            })}
                            navigation={navigation}
                            transaction={transaction}
                            report={report}
                            reportDraft={undefined}
                            explicitPolicyID={explicitPolicyID}
                        />
                    </CurrencyListContextProvider>
                </LocaleContextProvider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>
    );
}

function renderPage(props: PageProps) {
    return render(buildPage(props));
}

describe('IOURequestStepPerDiem', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(PerDiemRatesGate).mockImplementation(({children}) => children);
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createPerDiemPolicy());
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('points a draft from global create at the only per diem workspace and stays on the loader until then', async () => {
        // Given a per diem draft from global create, which carries no custom unit yet
        const transaction = createDraft({isFromGlobalCreate: true});

        // When the per diem tab opens with the only per diem workspace
        renderPage({transaction, explicitPolicyID: POLICY_ID});
        await waitForBatchedUpdatesWithAct();

        // Then the draft gets that workspace's custom unit, default category, report and participants
        expect(setCustomUnitID).toHaveBeenCalledWith(TRANSACTION_ID, CUSTOM_UNIT_ID);
        expect(setMoneyRequestCategory).toHaveBeenCalledWith(TRANSACTION_ID, DEFAULT_CATEGORY, undefined);
        expect(setTransactionReport).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestParticipantsFromReport).toHaveBeenCalledTimes(1);

        // And the form waits for those writes, so it never renders against a draft without a workspace
        expect(screen.queryByText(/^confirmation:/)).toBeNull();
    });

    it('points a draft from global create at the only per diem workspace even when it starts on a default workspace without per diem', async () => {
        // Given an auto-reporting default workspace without per diem, which a draft from global create starts on
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE, 'Default policy'), id: OTHER_POLICY_ID, customUnits: {}});
        });
        const transaction = createDraft({isFromGlobalCreate: true, participants: [{policyID: OTHER_POLICY_ID, isPolicyExpenseChat: true, selected: true}]});

        // When the per diem tab opens with the only per diem workspace
        renderPage({transaction, explicitPolicyID: POLICY_ID});
        await waitForBatchedUpdatesWithAct();

        // Then the draft is set up on the per diem workspace, instead of waiting forever on the default one's missing rates
        expect(setCustomUnitID).toHaveBeenCalledWith(TRANSACTION_ID, CUSTOM_UNIT_ID);
        expect(setMoneyRequestParticipantsFromReport).toHaveBeenCalledTimes(1);
    });

    it('replaces the placeholder custom unit of a draft started before the rates loaded', async () => {
        // Given a per diem draft from a workspace chat that still carries the placeholder custom unit
        const transaction = createDraft({comment: {customUnit: {customUnitID: CONST.CUSTOM_UNITS.FAKE_P2P_ID, name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL}}});
        const report = {...createRandomReport(1), reportID: REPORT_ID, policyID: POLICY_ID};

        // When the per diem tab opens
        renderPage({transaction, report, iouType: CONST.IOU.TYPE.SUBMIT});
        await waitForBatchedUpdatesWithAct();

        // Then the placeholder is swapped for the workspace's real custom unit, and the form keeps waiting meanwhile
        expect(setCustomUnitID).toHaveBeenCalledWith(TRANSACTION_ID, CUSTOM_UNIT_ID);
        expect(screen.queryByText(/^confirmation:/)).toBeNull();
    });

    it('does not touch a draft the tab switch has not rebuilt as per diem yet', async () => {
        // Given a draft that is still the manual request the user switched away from
        const transaction = createDraft({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, isFromGlobalCreate: true});

        // When the per diem tab opens
        renderPage({transaction, explicitPolicyID: POLICY_ID});
        await waitForBatchedUpdatesWithAct();

        // Then nothing is written, since the rebuild that follows the tab switch would clobber it
        expect(setCustomUnitID).not.toHaveBeenCalled();
        expect(setTransactionReport).not.toHaveBeenCalled();
    });

    it('hands a draft pointed at the self DM to the form as a track expense without rewriting the shared route', async () => {
        // Given a ready per diem draft that ended up unreported, on the self DM
        const transaction = createDraft({
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            isFromGlobalCreate: true,
            comment: {customUnit: {customUnitID: CUSTOM_UNIT_ID, name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL}},
        });

        // When the per diem tab renders the form
        renderPage({transaction, explicitPolicyID: POLICY_ID});
        await waitForBatchedUpdatesWithAct();

        // Then the form tracks the expense, while the create route keeps its iouType for the manual and scan tabs
        expect(screen.getByText(`confirmation:${CONST.IOU.TYPE.TRACK}`)).toBeTruthy();
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('fetches the rates of the workspace picked in the "To" row instead of the one the flow started from', async () => {
        // Given the real rates gate, and a second per diem workspace with no rates in Onyx
        jest.mocked(PerDiemRatesGate).mockImplementation(jest.requireActual<{default: typeof PerDiemRatesGate}>('@pages/iou/request/step/PerDiemRatesGate').default);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, createPerDiemPolicy(OTHER_POLICY_ID));
        });
        const report = {...createRandomReport(1), reportID: REPORT_ID, policyID: POLICY_ID};
        const customUnit = {customUnitID: CUSTOM_UNIT_ID, name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL};
        const transaction = createDraft({comment: {customUnit}, participants: [{policyID: POLICY_ID, isPolicyExpenseChat: true, selected: true}]});
        const {rerender} = renderPage({transaction, report, iouType: CONST.IOU.TYPE.SUBMIT});
        await waitForBatchedUpdatesWithAct();
        jest.mocked(fetchPerDiemRates).mockClear();

        // When the user moves the expense to the second workspace in the "To" row, while the route report stays on the first
        const movedTransaction = createDraft({comment: {customUnit}, participants: [{policyID: OTHER_POLICY_ID, isPolicyExpenseChat: true, selected: true}]});
        rerender(buildPage({transaction: movedTransaction, report, iouType: CONST.IOU.TYPE.SUBMIT}));
        await waitForBatchedUpdatesWithAct();

        // Then the gate fetches the second workspace's rates, so the form doesn't keep checking the first one's
        expect(fetchPerDiemRates).toHaveBeenCalledWith(OTHER_POLICY_ID);
        expect(fetchPerDiemRates).not.toHaveBeenCalledWith(POLICY_ID);
    });
});
