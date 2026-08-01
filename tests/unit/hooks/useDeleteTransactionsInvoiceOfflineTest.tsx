import {act, renderHook, waitFor} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useDeleteTransactions from '@hooks/useDeleteTransactions';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const invoiceRoomID = '40';
const invoiceReportID = '41';
const transactionID = '42';
const iouActionID = '43';
const reportPreviewActionID = '44';
const transactionThreadReportID = '45';

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <LocaleContextProvider>{children}</LocaleContextProvider>
    </OnyxListItemProvider>
);

describe('useDeleteTransactions - offline invoice delete', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
        return waitForBatchedUpdatesWithAct();
    });

    beforeEach(() => {
        global.fetch = getGlobalFetchMock();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    // Regression test for issue #97399. Deleting the only expense of an invoice while offline runs through
    // deleteTransactions -> deleteMoneyRequest. Invoice reports are neither IOU nor expense reports, so before the fix
    // deleteTransactions filtered the money request action's report down to `undefined`, and the optimistic delete ran
    // with iouReport undefined: the invoice reportAction and the invoice-room report preview were never marked deleted
    // (the updates were built against REPORT_ACTIONSundefined), so the invoice stayed visible until a server response
    // arrived - i.e. indefinitely while offline. With the fix the invoice report is passed through, so the optimistic
    // delete marks both the invoice's money request action and the invoice-room report preview as pending DELETE.
    it('optimistically marks the invoice money request action and invoice-room report preview as deleted', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const iouAction = {
            ...createRandomReportAction(Number(iouActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: 0,
            reportID: invoiceReportID,
            childReportID: transactionThreadReportID,
            originalMessage: {
                IOUReportID: invoiceReportID,
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 100,
                currency: CONST.CURRENCY.USD,
            },
            pendingAction: null,
        } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const reportPreviewAction = {
            ...createRandomReportAction(Number(reportPreviewActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            reportID: invoiceRoomID,
            originalMessage: {linkedReportID: invoiceReportID},
            pendingAction: null,
        } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>;

        const transactionThreadReport: Report = {
            ...createRandomReport(Number(transactionThreadReportID), undefined),
            parentReportID: invoiceReportID,
            parentReportActionID: iouActionID,
        };

        const invoiceRoom: Report = createRandomReport(Number(invoiceRoomID), CONST.REPORT.CHAT_TYPE.INVOICE);
        const invoiceReport: Report = {
            ...createRandomReport(Number(invoiceReportID), undefined),
            type: CONST.REPORT.TYPE.INVOICE,
            chatReportID: invoiceRoomID,
            ownerAccountID: 0,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        // The invoice's only transaction, so deleting it deletes the whole invoice report.
        const transaction = {...createRandomTransaction(Number(transactionID)), transactionID, reportID: invoiceReportID, comment: {}};

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceRoomID}`, invoiceRoom);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, invoiceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceReportID}`, {[iouActionID]: iouAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceRoomID}`, {[reportPreviewActionID]: reportPreviewAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useDeleteTransactions({report: invoiceReport, reportActions: [iouAction]}), {wrapper});

        await act(async () => {
            result.current.deleteTransactions([transactionID], {}, {}, undefined, false);
        });
        await waitForBatchedUpdatesWithAct();

        // The invoice's money request action is optimistically marked deleted - this only happens when the invoice report
        // is resolved as the iouReport. Before the fix it wrote to REPORT_ACTIONSundefined and this stayed non-pending.
        await waitFor(async () => {
            const invoiceReportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceReportID}`);
            expect(invoiceReportActions?.[iouActionID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        });

        // The invoice-room report preview is optimistically marked deleted, so the invoice disappears from the room.
        const invoiceRoomActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceRoomID}`);
        expect(invoiceRoomActions?.[reportPreviewActionID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    });
});
