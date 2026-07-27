import {createExpenseByType} from '@libs/actions/IOU/Duplicate';
import * as PerDiem from '@libs/actions/IOU/PerDiem';
import * as Split from '@libs/actions/IOU/Split';
import * as TrackExpense from '@libs/actions/IOU/TrackExpense';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {getTransactionDetails} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import currencyList from '../../unit/currencyList.json';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/IOU/TrackExpense', () => ({
    requestMoney: jest.fn(),
    trackExpense: jest.fn(),
}));

jest.mock('@libs/actions/IOU/Split', () => ({
    createDistanceRequest: jest.fn(),
}));

jest.mock('@libs/actions/IOU/PerDiem', () => ({
    submitPerDiemExpense: jest.fn(),
}));

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => '123'),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {getRootState: jest.fn()},
}));

jest.mock('@react-navigation/native');

const OWNER_ACCOUNT_ID = 1;
const OWNER_EMAIL = 'owner@test.com';
const PARTICIPANT_ACCOUNT_ID = 2;
const PARTICIPANT_EMAIL = 'participant@test.com';

OnyxUpdateManager();

describe('actions/IOU/createExpenseByType', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: OWNER_ACCOUNT_ID, email: OWNER_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, login: OWNER_EMAIL}},
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => Onyx.clear());

    function buildBaseTransaction(overrides: Partial<Transaction> = {}): Transaction {
        return {
            ...createRandomTransaction(1),
            transactionID: 'tx1',
            reportID: 'report1',
            amount: 5000,
            currency: CONST.CURRENCY.USD,
            merchant: 'Acme Corp',
            comment: {comment: 'Test expense'},
            ...overrides,
        };
    }

    function buildBaseReport(overrides: Partial<Report> = {}): Report {
        return {
            ...createRandomReport(1, undefined),
            reportID: 'report1',
            type: CONST.REPORT.TYPE.EXPENSE,
            ...overrides,
        };
    }

    function buildBaseParams(transactionOverrides: Partial<Transaction> = {}) {
        const transaction = buildBaseTransaction(transactionOverrides);
        const transactionDetails = getTransactionDetails(transaction);
        const report = buildBaseReport();

        const params = {
            report,
            participantParams: {
                payeeEmail: OWNER_EMAIL,
                payeeAccountID: OWNER_ACCOUNT_ID,
                participant: {login: PARTICIPANT_EMAIL, accountID: PARTICIPANT_ACCOUNT_ID},
            },
            transactionParams: {
                amount: transaction.amount,
                currency: transaction.currency,
                created: transaction.created ?? '',
                merchant: transaction.merchant ?? '',
                comment: transaction.comment?.comment ?? '',
                attendees: [],
            },
            shouldGenerateTransactionThreadReport: true,
            isASAPSubmitBetaEnabled: false,
            currentUserAccountIDParam: OWNER_ACCOUNT_ID,
            currentUserEmailParam: OWNER_EMAIL,
            transactionViolations: {},
            quickAction: undefined,
            policyRecentlyUsedCurrencies: [],
            existingTransactionDraft: undefined,
            draftTransactionIDs: [],
            isSelfTourViewed: false,
            betas: undefined,
            personalDetails: {},
            delegateAccountID: undefined,
            isTrackIntentUser: undefined,
        };

        return {transaction, transactionDetails, params};
    }

    function callCreateExpenseByType(
        overrides: Partial<Parameters<typeof createExpenseByType>[0]> & Pick<Parameters<typeof createExpenseByType>[0], 'transactionType' | 'params' | 'transaction' | 'transactionDetails'>,
    ) {
        return createExpenseByType({
            waypoints: undefined,
            participants: [],
            policyRecentlyUsedCurrencies: [],
            quickAction: undefined,
            personalDetails: {},
            recentWaypoints: undefined,
            isTrackIntentUser: undefined,
            formatPhoneNumber: (phoneNumber: string) => phoneNumber,
            ...overrides,
        });
    }

    function getLastDistanceRequestParams() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const [distanceParams] = (Split.createDistanceRequest as jest.Mock).mock.calls.at(0) as [Parameters<typeof Split.createDistanceRequest>[0]];
        return distanceParams;
    }

    function getLastPerDiemParams() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const [perDiemParams] = (PerDiem.submitPerDiemExpense as jest.Mock).mock.calls.at(0) as [Parameters<typeof PerDiem.submitPerDiemExpense>[0]];
        return perDiemParams;
    }

    describe('default expense type', () => {
        it('calls requestMoney for CASH type', () => {
            const {transaction, transactionDetails, params} = buildBaseParams();

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.CASH,
                params,
                transaction,
                transactionDetails,
                participants: [{login: PARTICIPANT_EMAIL, accountID: PARTICIPANT_ACCOUNT_ID}],
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledTimes(1);
            expect(Split.createDistanceRequest).not.toHaveBeenCalled();
            expect(PerDiem.submitPerDiemExpense).not.toHaveBeenCalled();
        });

        it('passes the original params through unchanged to requestMoney', () => {
            const {transaction, transactionDetails, params} = buildBaseParams();

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.CASH,
                params,
                transaction,
                transactionDetails,
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(params);
        });

        it('calls requestMoney for an unrecognized transaction type (fallthrough default)', () => {
            const {transaction, transactionDetails, params} = buildBaseParams();

            callCreateExpenseByType({
                transactionType: 'unknownType',
                params,
                transaction,
                transactionDetails,
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledTimes(1);
            expect(Split.createDistanceRequest).not.toHaveBeenCalled();
            expect(PerDiem.submitPerDiemExpense).not.toHaveBeenCalled();
        });
    });

    describe('distance expense type', () => {
        const waypoints = {
            waypoint0: {lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA'},
            waypoint1: {lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA'},
        };

        it('calls createDistanceRequest for DISTANCE type', () => {
            const {transaction, transactionDetails, params} = buildBaseParams({
                comment: {comment: 'road trip', customUnit: {distanceUnit: 'mi'}},
            });

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.DISTANCE,
                params,
                transaction,
                transactionDetails,
                waypoints,
                participants: [{login: PARTICIPANT_EMAIL, accountID: PARTICIPANT_ACCOUNT_ID}],
            });

            expect(Split.createDistanceRequest).toHaveBeenCalledTimes(1);
            expect(TrackExpense.requestMoney).not.toHaveBeenCalled();
            expect(PerDiem.submitPerDiemExpense).not.toHaveBeenCalled();
        });

        it('sets created to empty string on the existingTransaction', () => {
            const {transaction, transactionDetails, params} = buildBaseParams();

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.DISTANCE,
                params,
                transaction,
                transactionDetails,
                waypoints,
            });

            const distanceParams = getLastDistanceRequestParams();
            expect(distanceParams.existingTransaction?.created).toBe('');
        });

        it('passes waypoints into existingTransaction.comment.waypoints', () => {
            const {transaction, transactionDetails, params} = buildBaseParams();

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.DISTANCE,
                params,
                transaction,
                transactionDetails,
                waypoints,
            });

            const distanceParams = getLastDistanceRequestParams();
            expect(distanceParams.existingTransaction?.comment?.waypoints).toEqual(waypoints);
        });

        it('sets transactionParams.validWaypoints from waypoints', () => {
            const {transaction, transactionDetails, params} = buildBaseParams();

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.DISTANCE,
                params,
                transaction,
                transactionDetails,
                waypoints,
            });

            const distanceParams = getLastDistanceRequestParams();
            expect(distanceParams.transactionParams.validWaypoints).toEqual(waypoints);
        });

        it('strips hold and originalTransactionID from existingTransaction.comment', () => {
            const {transaction, transactionDetails, params} = buildBaseParams({
                comment: {comment: 'held trip', hold: 'someHold', originalTransactionID: 'origTx'},
            });

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.DISTANCE,
                params,
                transaction,
                transactionDetails,
                waypoints,
            });

            const distanceParams = getLastDistanceRequestParams();
            expect(distanceParams.existingTransaction?.comment?.hold).toBeUndefined();
            expect(distanceParams.existingTransaction?.comment?.originalTransactionID).toBeUndefined();
        });
    });

    describe('per diem expense type', () => {
        const customUnit = {
            customUnitID: 'cu1',
            customUnitRateID: 'rate1',
            quantity: 3,
        };

        it('calls submitPerDiemExpense for PER_DIEM type', () => {
            const {transaction, transactionDetails, params} = buildBaseParams({
                comment: {comment: 'conference', customUnit},
            });

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM,
                params,
                transaction,
                transactionDetails,
                participants: [{login: PARTICIPANT_EMAIL, accountID: PARTICIPANT_ACCOUNT_ID}],
            });

            expect(PerDiem.submitPerDiemExpense).toHaveBeenCalledTimes(1);
            expect(TrackExpense.requestMoney).not.toHaveBeenCalled();
            expect(Split.createDistanceRequest).not.toHaveBeenCalled();
        });

        it('always sets hasViolations to false', () => {
            const {transaction, transactionDetails, params} = buildBaseParams({
                comment: {comment: 'days away', customUnit},
            });

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM,
                params,
                transaction,
                transactionDetails,
            });

            const perDiemParams = getLastPerDiemParams();
            expect(perDiemParams.hasViolations).toBe(false);
        });

        it('forwards customUnit from transaction.comment to transactionParams', () => {
            const {transaction, transactionDetails, params} = buildBaseParams({
                comment: {comment: 'offsite', customUnit},
            });

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM,
                params,
                transaction,
                transactionDetails,
            });

            const perDiemParams = getLastPerDiemParams();
            expect(perDiemParams.transactionParams.customUnit).toEqual(customUnit);
        });

        it('uses raw comment (not html-parsed) in transactionParams', () => {
            const rawComment = 'Team offsite <b>Berlin</b>';
            const {transaction, transactionDetails, params} = buildBaseParams({
                comment: {comment: rawComment, customUnit},
            });

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM,
                params,
                transaction,
                transactionDetails,
            });

            const perDiemParams = getLastPerDiemParams();
            // transactionDetails.comment comes from getDescription which returns the raw comment field
            expect(perDiemParams.transactionParams.comment).toBe(transactionDetails?.comment);
        });

        it('defaults customUnit to empty object when transaction.comment.customUnit is missing', () => {
            const {transaction, transactionDetails, params} = buildBaseParams({
                comment: {comment: 'no custom unit'},
            });

            callCreateExpenseByType({
                transactionType: CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM,
                params,
                transaction,
                transactionDetails,
            });

            const perDiemParams = getLastPerDiemParams();
            expect(perDiemParams.transactionParams.customUnit).toEqual({});
        });
    });
});
