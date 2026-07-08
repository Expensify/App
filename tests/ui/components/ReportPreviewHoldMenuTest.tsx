import {act, render} from '@testing-library/react-native';

import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import {ReportPreviewActionsContext, ReportPreviewDataContext, ReportPreviewHoldMenuContext} from '@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext';
import ReportPreviewHoldMenu from '@components/ReportActionItem/MoneyRequestReportPreview/ReportPreviewHoldMenu';

import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import {actionR14932 as mockAction} from '../../../__mocks__/reportData/actions';
import {chatReportR14932 as mockChatReport, iouReportR14932 as mockIOUReport} from '../../../__mocks__/reportData/reports';
import createRandomTransaction from '../../utils/collections/transaction';

const SELECTED_BANK_ACCOUNT_ID = 9999;

type CapturedHoldMenuProps = {
    isVisible?: boolean;
    requestType?: string;
    paymentType?: PaymentMethodType;
    methodID?: number;
    nonHeldAmount?: string;
    hasNonHeldExpenses?: boolean;
    onConfirm?: (full: boolean) => void;
};

// Capture the props ReportPreviewHoldMenu forwards to the underlying menu so the context-driven wiring can be asserted.
const mockHoldMenuPropsHolder: {current?: CapturedHoldMenuProps} = {current: undefined};
jest.mock('@components/ProcessMoneyReportHoldMenu', () => ({
    __esModule: true,
    default: (props: CapturedHoldMenuProps) => {
        mockHoldMenuPropsHolder.current = props;
        return null;
    },
}));

const heldTransaction: Transaction = {...createRandomTransaction(1), comment: {...createRandomTransaction(1).comment, hold: 'holdReportActionID'}};
const nonHeldTransaction: Transaction = {...createRandomTransaction(2), comment: {...createRandomTransaction(2).comment, hold: undefined}};

const defaultHoldMenuState = {
    requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY as ActionHandledType,
    paymentType: CONST.IOU.PAYMENT_TYPE.VBBA as PaymentMethodType,
    canPay: true,
    methodID: SELECTED_BANK_ACCOUNT_ID,
};

const mockActionsValue = {
    openReportFromPreview: jest.fn(),
    onHoldMenuOpen: jest.fn(),
    onHoldMenuClose: jest.fn(),
    stopAnimation: jest.fn(),
    startAnimation: jest.fn(),
    startApprovedAnimation: jest.fn(),
    startSubmittingAnimation: jest.fn(),
    goToPrevious: jest.fn(),
    goToNext: jest.fn(),
};

function renderHoldMenu(
    overrides: {
        holdMenu?: typeof defaultHoldMenuState | null;
        iouReport?: OnyxEntry<Report>;
        transactions?: Transaction[];
    } = {},
) {
    // An explicit `iouReport: undefined` override must not fall back to the mock report, so presence is checked instead of relying on parameter defaults
    const iouReport = Object.prototype.hasOwnProperty.call(overrides, 'iouReport') ? overrides.iouReport : mockIOUReport;
    const holdMenu = overrides.holdMenu === undefined ? defaultHoldMenuState : overrides.holdMenu;
    const transactions = overrides.transactions ?? [heldTransaction, nonHeldTransaction];
    const dataValue = {
        iouReportID: iouReport?.reportID,
        chatReportID: mockChatReport.reportID,
        action: mockAction,
        iouReport,
        chatReport: mockChatReport,
        transactions,
        policy: undefined,
        invoiceReceiverPolicy: undefined,
        invoiceReceiverPersonalDetail: null,
    };

    return render(
        <ReportPreviewDataContext.Provider value={dataValue}>
            <ReportPreviewActionsContext.Provider value={mockActionsValue}>
                <ReportPreviewHoldMenuContext.Provider value={holdMenu}>
                    <ReportPreviewHoldMenu />
                </ReportPreviewHoldMenuContext.Provider>
            </ReportPreviewActionsContext.Provider>
        </ReportPreviewDataContext.Provider>,
    );
}

describe('ReportPreviewHoldMenu', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHoldMenuPropsHolder.current = undefined;
    });

    it('renders nothing while the hold menu state is closed', () => {
        renderHoldMenu({holdMenu: null});

        expect(mockHoldMenuPropsHolder.current).toBeUndefined();
    });

    it('renders nothing when the IOU report is not available', () => {
        renderHoldMenu({iouReport: undefined});

        expect(mockHoldMenuPropsHolder.current).toBeUndefined();
    });

    it('forwards the request type, payment type and selected bank account from the context state', () => {
        renderHoldMenu();

        expect(mockHoldMenuPropsHolder.current?.isVisible).toBe(true);
        expect(mockHoldMenuPropsHolder.current?.requestType).toBe(CONST.IOU.REPORT_ACTION_TYPE.PAY);
        expect(mockHoldMenuPropsHolder.current?.paymentType).toBe(CONST.IOU.PAYMENT_TYPE.VBBA);
        expect(mockHoldMenuPropsHolder.current?.methodID).toBe(SELECTED_BANK_ACCOUNT_ID);
    });

    it('offers a non-held amount when the report mixes held and non-held expenses', () => {
        // Make the unheld total differ from the full total so the partial amount is considered valid for an expense report
        renderHoldMenu({iouReport: {...mockIOUReport, unheldTotal: (mockIOUReport.total ?? 0) / 2}});

        expect(mockHoldMenuPropsHolder.current?.hasNonHeldExpenses).toBe(true);
        expect(mockHoldMenuPropsHolder.current?.nonHeldAmount).toBeDefined();
    });

    it('omits the non-held amount when every expense is on hold', () => {
        renderHoldMenu({transactions: [heldTransaction]});

        expect(mockHoldMenuPropsHolder.current?.hasNonHeldExpenses).toBe(false);
        expect(mockHoldMenuPropsHolder.current?.nonHeldAmount).toBeUndefined();
    });

    it('starts the approved animation when confirming an approval', () => {
        renderHoldMenu({holdMenu: {...defaultHoldMenuState, requestType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE}});

        act(() => {
            mockHoldMenuPropsHolder.current?.onConfirm?.(true);
        });

        expect(mockActionsValue.startApprovedAnimation).toHaveBeenCalled();
        expect(mockActionsValue.startAnimation).not.toHaveBeenCalled();
    });

    it('starts the paid animation when confirming a payment', () => {
        renderHoldMenu();

        act(() => {
            mockHoldMenuPropsHolder.current?.onConfirm?.(true);
        });

        expect(mockActionsValue.startAnimation).toHaveBeenCalled();
        expect(mockActionsValue.startApprovedAnimation).not.toHaveBeenCalled();
    });
});
