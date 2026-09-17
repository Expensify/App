import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import addUtilsToWindow from '@src/setup/addUtilsToWindow';
import type {ReportAction, ReportActions} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockRouteParams: {value: Record<string, string> | undefined} = {value: undefined};

jest.mock('@libs/Environment/Environment', () => ({
    isProduction: () => Promise.resolve(false),
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    current: {
        getCurrentRoute: () => ({params: mockRouteParams.value}),
    },
}));

jest.mock('@userActions/Session', () => ({
    setSupportAuthToken: jest.fn(),
}));

function buildIOUAction(reportActionID: string, iouTransactionID?: string): ReportAction {
    return {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        created: '2026-01-01 00:00:00.000',
        originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: iouTransactionID},
    };
}

function buildReportActions(...actions: ReportAction[]): ReportActions {
    return Object.fromEntries(actions.map((action) => [action.reportActionID, action]));
}

describe('addUtilsToWindow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockRouteParams.value = undefined;
        await Onyx.clear();
        await addUtilsToWindow();
    });

    it('exposes a working Onyx.get on the window', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', reportName: 'Direct read'});

        const report = await window.Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}1`);

        expect(report?.reportName).toBe('Direct read');
    });

    it('logs the value of the collection it is given', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', reportName: 'Logged'});
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        window.Onyx.log(ONYXKEYS.COLLECTION.REPORT);

        // log() returns void, and Onyx resolves a promise before console.log runs, so a single microtask is not enough.
        await waitForBatchedUpdates();

        expect(consoleSpy).toHaveBeenCalledWith(expect.objectContaining({[`${ONYXKEYS.COLLECTION.REPORT}1`]: expect.objectContaining({reportName: 'Logged'})}));
        consoleSpy.mockRestore();
    });

    describe('window.report', () => {
        it('resolves the report named by the route reportID', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', reportName: 'From route'});
            mockRouteParams.value = {reportID: '1'};

            expect((await window.report)?.reportName).toBe('From route');
        });

        it('falls back to the report the route transaction belongs to', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', reportName: 'Via transaction'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}100`, {transactionID: '100', reportID: '1'});
            mockRouteParams.value = {transactionID: '100'};

            expect((await window.report)?.reportName).toBe('Via transaction');
        });

        it('resolves undefined when the route carries neither id', async () => {
            expect(await window.report).toBeUndefined();
        });
    });

    describe('window.policy', () => {
        it('resolves the policy named by the route policyID', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}A`, {id: 'A', name: 'From route'});
            mockRouteParams.value = {policyID: 'A'};

            expect((await window.policy)?.name).toBe('From route');
        });

        it('resolves the policy of the route report', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}A`, {id: 'A', name: 'Via report'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', policyID: 'A'});
            mockRouteParams.value = {reportID: '1'};

            expect((await window.policy)?.name).toBe('Via report');
        });

        it('climbs to the parent report when the route report has no policyID', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}A`, {id: 'A', name: 'Via parent report'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {reportID: '2', policyID: 'A'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', parentReportID: '2'});
            mockRouteParams.value = {reportID: '1'};

            expect((await window.policy)?.name).toBe('Via parent report');
        });
    });

    describe('window.transaction', () => {
        it('resolves the transaction named by the route transactionID', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}100`, {transactionID: '100', merchant: 'From route'});
            mockRouteParams.value = {transactionID: '100'};

            expect((await window.transaction)?.merchant).toBe('From route');
        });

        it('resolves the transaction from the parent report action of a transaction thread', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}100`, {transactionID: '100', merchant: 'Via parent action'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', parentReportID: '2', parentReportActionID: '900'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`, buildReportActions(buildIOUAction('900', '100')));
            mockRouteParams.value = {reportID: '1'};

            expect((await window.transaction)?.merchant).toBe('Via parent action');
        });

        it("falls back to scanning the report's own actions", async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}100`, {transactionID: '100', merchant: 'Via own actions'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, buildReportActions(buildIOUAction('800'), buildIOUAction('900', '100')));
            mockRouteParams.value = {reportID: '1'};

            expect((await window.transaction)?.merchant).toBe('Via own actions');
        });

        it('resolves undefined when no action on the report carries a transactionID', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, buildReportActions(buildIOUAction('800')));
            mockRouteParams.value = {reportID: '1'};

            expect(await window.transaction).toBeUndefined();
        });
    });

    describe('window.receipt', () => {
        it('resolves the receipt of the resolved transaction', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}100`, {transactionID: '100', receipt: {source: 'receipt.png'}});
            mockRouteParams.value = {transactionID: '100'};

            expect((await window.receipt)?.source).toBe('receipt.png');
        });
    });
});
