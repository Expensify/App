import React, {createContext, useContext} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {PaymentMethod} from './KYCWall/types';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';

type RejectModalActionType = ValueOf<
    typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK
>;

type MoneyReportHeaderContextType = {
    // Modal triggers - registered by MoneyReportHeaderModals
    showHoldMenu: (paymentType?: PaymentMethodType, requestType?: ActionHandledType) => void;
    showDownloadError: () => void;
    showExportDownloadError: () => void;
    showOfflineModal: () => void;
    showPDFModal: (reportID: string) => void;
    showHoldEducationalModal: () => void;
    setRejectModalAction: (action: RejectModalActionType) => void;
    showRateErrorModal: () => void;
    showDuplicatePerDiemErrorModal: () => void;

    // Shared action handlers
    confirmPayment: (type?: PaymentMethodType, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod) => void;
    confirmApproval: () => void;
};

const noop = () => {};

const MoneyReportHeaderContext = createContext<MoneyReportHeaderContextType>({
    showHoldMenu: noop,
    showDownloadError: noop,
    showExportDownloadError: noop,
    showOfflineModal: noop,
    showPDFModal: noop,
    showHoldEducationalModal: noop,
    setRejectModalAction: noop,
    showRateErrorModal: noop,
    showDuplicatePerDiemErrorModal: noop,
    confirmPayment: noop,
    confirmApproval: noop,
});

function useMoneyReportHeaderContext() {
    return useContext(MoneyReportHeaderContext);
}

function MoneyReportHeaderProvider({children, value}: {children: React.ReactNode; value: MoneyReportHeaderContextType}) {
    return <MoneyReportHeaderContext.Provider value={value}>{children}</MoneyReportHeaderContext.Provider>;
}

export {useMoneyReportHeaderContext, MoneyReportHeaderProvider};
export type {MoneyReportHeaderContextType, RejectModalActionType};
