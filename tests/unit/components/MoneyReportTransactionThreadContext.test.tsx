import {renderHook} from '@testing-library/react-native';

import {MoneyReportTransactionThreadProvider, useMoneyReportTransactionThread} from '@components/MoneyReportTransactionThreadContext';

import useOnyx from '@hooks/useOnyx';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {PropsWithChildren} from 'react';
import type {OnyxKey, ResultMetadata, UseOnyxResult} from 'react-native-onyx';

import React from 'react';

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useTransactionThreadReport', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockUseOnyx = jest.mocked(useOnyx);
const mockUseTransactionThreadReport = jest.mocked(useTransactionThreadReport);

const MONEY_REPORT_ID = '10001';
const THREAD_REPORT_ID = '10002';
const PARENT_ACTION_ID = '9001';
const IOU_TRANSACTION_ID = '3106135972713435169';

const loadedMetadata: ResultMetadata<ReportActions> = {status: 'loaded'};

function asReportActionsOnyxResult(reportActions: ReportActions | undefined): UseOnyxResult<ReportActions> {
    return [reportActions, loadedMetadata];
}

function createIOUReportAction(reportActionID: string, transactionID: string = IOU_TRANSACTION_ID): ReportAction {
    return {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {
            IOUTransactionID: transactionID,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        },
        created: '2025-02-14 08:12:05.165',
        actorAccountID: 1,
        person: [{type: 'TEXT', style: 'strong', text: 'Test'}],
        message: [{type: 'COMMENT', html: '', text: '', isEdited: false, whisperedTo: [], isDeletedParentAction: false}],
    } as ReportAction;
}

function createTransactionThreadReport(parentReportActionID: string | undefined): Report {
    return {
        reportID: THREAD_REPORT_ID,
        parentReportActionID,
    } as Report;
}

function renderContextHook(reportID: string | undefined = MONEY_REPORT_ID) {
    function wrapper({children}: PropsWithChildren) {
        return <MoneyReportTransactionThreadProvider reportID={reportID}>{children}</MoneyReportTransactionThreadProvider>;
    }

    return renderHook(() => useMoneyReportTransactionThread(), {wrapper});
}

describe('MoneyReportTransactionThreadContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue(asReportActionsOnyxResult(undefined));
        mockUseTransactionThreadReport.mockReturnValue({
            transactionThreadReportID: undefined,
            transactionThreadReport: undefined,
            reportActions: [],
        });
    });

    it('returns default values when used outside the provider', () => {
        const {result} = renderHook(() => useMoneyReportTransactionThread());

        expect(result.current).toEqual({
            iouTransactionID: undefined,
            requestParentReportAction: null,
            transactionThreadReportID: undefined,
            reportActions: [],
        });
    });

    it('exposes transaction thread data and resolves the IOU transaction ID from the parent action', () => {
        const parentReportAction = createIOUReportAction(PARENT_ACTION_ID);
        const filteredReportActions: ReportAction[] = [
            {
                reportActionID: 'filtered-action',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: '2025-02-14 08:12:05.165',
                actorAccountID: 1,
                person: [{type: 'TEXT', style: 'strong', text: 'Test'}],
                message: [{type: 'COMMENT', html: '', text: '', isEdited: false, whisperedTo: [], isDeletedParentAction: false}],
            },
        ];
        const reportActionsForParent: ReportActions = {
            [PARENT_ACTION_ID]: parentReportAction,
        };

        mockUseTransactionThreadReport.mockReturnValue({
            transactionThreadReportID: THREAD_REPORT_ID,
            transactionThreadReport: createTransactionThreadReport(PARENT_ACTION_ID),
            reportActions: filteredReportActions,
        });
        mockUseOnyx.mockImplementation((key: OnyxKey) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MONEY_REPORT_ID}`) {
                return asReportActionsOnyxResult(reportActionsForParent);
            }
            return asReportActionsOnyxResult(undefined);
        });

        const {result} = renderContextHook();

        expect(mockUseTransactionThreadReport).toHaveBeenCalledWith(MONEY_REPORT_ID);
        expect(result.current.transactionThreadReportID).toBe(THREAD_REPORT_ID);
        expect(result.current.reportActions).toEqual(filteredReportActions);
        expect(result.current.requestParentReportAction).toEqual(parentReportAction);
        expect(result.current.iouTransactionID).toBe(IOU_TRANSACTION_ID);
    });

    it('resolves the parent action from the raw Onyx collection even when it is absent from filtered report actions', () => {
        const parentReportAction = createIOUReportAction(PARENT_ACTION_ID);
        const reportActionsForParent: ReportActions = {
            [PARENT_ACTION_ID]: parentReportAction,
        };

        mockUseTransactionThreadReport.mockReturnValue({
            transactionThreadReportID: THREAD_REPORT_ID,
            transactionThreadReport: createTransactionThreadReport(PARENT_ACTION_ID),
            reportActions: [],
        });
        mockUseOnyx.mockImplementation((key: OnyxKey) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MONEY_REPORT_ID}`) {
                return asReportActionsOnyxResult(reportActionsForParent);
            }
            return asReportActionsOnyxResult(undefined);
        });

        const {result} = renderContextHook();

        expect(result.current.requestParentReportAction).toEqual(parentReportAction);
        expect(result.current.iouTransactionID).toBe(IOU_TRANSACTION_ID);
    });

    it('returns null requestParentReportAction when the parent action is not a money request action', () => {
        const nonIOUParentAction: ReportAction = {
            reportActionID: PARENT_ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: '2025-02-14 08:12:05.165',
            actorAccountID: 1,
            person: [{type: 'TEXT', style: 'strong', text: 'Test'}],
            message: [{type: 'COMMENT', html: '', text: '', isEdited: false, whisperedTo: [], isDeletedParentAction: false}],
        };

        mockUseTransactionThreadReport.mockReturnValue({
            transactionThreadReportID: THREAD_REPORT_ID,
            transactionThreadReport: createTransactionThreadReport(PARENT_ACTION_ID),
            reportActions: [],
        });
        mockUseOnyx.mockImplementation((key: OnyxKey) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${MONEY_REPORT_ID}`) {
                return asReportActionsOnyxResult({[PARENT_ACTION_ID]: nonIOUParentAction});
            }
            return asReportActionsOnyxResult(undefined);
        });

        const {result} = renderContextHook();

        expect(result.current.requestParentReportAction).toBeNull();
        expect(result.current.iouTransactionID).toBeUndefined();
    });

    it('returns null requestParentReportAction when the transaction thread has no parent action ID', () => {
        mockUseTransactionThreadReport.mockReturnValue({
            transactionThreadReportID: THREAD_REPORT_ID,
            transactionThreadReport: createTransactionThreadReport(undefined),
            reportActions: [],
        });

        const {result} = renderContextHook();

        expect(result.current.requestParentReportAction).toBeNull();
        expect(result.current.iouTransactionID).toBeUndefined();
    });
});
