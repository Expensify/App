import {act, renderHook} from '@testing-library/react-native';

import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import type {SubmissionHandle} from '@pages/iou/request/step/confirmation/submission/types';

import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import {getCurrencyDecimalsLocal} from './TestHelper';
import waitForBatchedUpdatesWithAct from './waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 42;
const REPORT_ID = 'chat-1';
const TRANSACTION_ID = 'transaction-1';
const DRAFT_ID = 'draft-1';

const CURRENT_USER_PERSONAL_DETAILS: CurrentUserPersonalDetails = {accountID: CURRENT_USER_ACCOUNT_ID, login: 'me@test.com', email: 'me@test.com'};

const OTHER_USER_PARTICIPANT: Participant = {accountID: OTHER_USER_ACCOUNT_ID, login: 'them@test.com', selected: true};

const CURRENT_USER_PARTICIPANT: Participant = {accountID: CURRENT_USER_ACCOUNT_ID, login: 'me@test.com', selected: true};

const NO_TAX_VALUES = {transactionTaxCode: '', transactionTaxAmount: 0, transactionTaxValue: ''};

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        amount: 100,
        currency: 'USD',
        merchant: 'Coffee shop',
        created: '2026-04-24',
        comment: {comment: ''},
        ...overrides,
    };
}

function buildChatReport(overrides: Partial<Report> = {}): Report {
    return {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, ...overrides};
}

/** The linked-track metadata a transaction moved off a tracked expense carries, which the move commands require. */
function buildLinkedTrackedExpenseFields(existingTrackedTransactionID: string): Pick<Transaction, 'linkedTrackedExpenseReportAction' | 'linkedTrackedExpenseReportID'> {
    return {
        linkedTrackedExpenseReportAction: buildOptimisticIOUReportAction({
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: 100,
            currency: 'USD',
            comment: '',
            participants: [],
            transactionID: existingTrackedTransactionID,
        }),
        linkedTrackedExpenseReportID: `tracked-report-${existingTrackedTransactionID}`,
    };
}

function buildPerDiemTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return buildTransaction({
        amount: 200,
        merchant: 'Per diem',
        comment: {
            comment: 'Trip per diem',
            customUnit: {
                customUnitID: 'per-diem-custom-unit',
                customUnitRateID: 'per-diem-rate',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                subRates: [{id: 'sub-rate-1', name: 'Meals', quantity: 1, rate: 200}],
                attributes: {
                    dates: {
                        start: '2026-04-24',
                        end: '2026-04-24',
                    },
                },
            },
        },
        ...overrides,
    });
}

/** A map distance draft whose quantity (29 km) was typed on the Manual tab, so it no longer matches its 2900 km route. */
function buildOverriddenMapDistanceTransaction(): Transaction {
    return buildTransaction({
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
        comment: {
            customUnit: {
                quantity: 29,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            },
            waypoints: {
                waypoint0: {address: 'San Francisco', lat: 37.7749, lng: -122.4194},
                waypoint1: {address: 'New York', lat: 40.7128, lng: -74.006},
            },
        },
        routes: {route0: {distance: 2900000, geometry: {coordinates: []}}},
    });
}

/** Renders a submission hook and presses confirm once, the way the orchestrator would. */
async function renderAndSubmit(useSubmission: () => SubmissionHandle, shouldHandleNavigation: boolean) {
    const {result} = renderHook(useSubmission);
    await waitForBatchedUpdatesWithAct();

    await act(async () => {
        result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation});
    });
    await waitForBatchedUpdatesWithAct();
}

export {
    CURRENT_USER_ACCOUNT_ID,
    REPORT_ID,
    TRANSACTION_ID,
    DRAFT_ID,
    CURRENT_USER_PERSONAL_DETAILS,
    OTHER_USER_PARTICIPANT,
    CURRENT_USER_PARTICIPANT,
    NO_TAX_VALUES,
    buildTransaction,
    buildChatReport,
    buildLinkedTrackedExpenseFields,
    buildPerDiemTransaction,
    buildOverriddenMapDistanceTransaction,
    renderAndSubmit,
};
