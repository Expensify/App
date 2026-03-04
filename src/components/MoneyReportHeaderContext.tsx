import React, {createContext, useContext, useRef} from 'react';
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

/**
 * Provides a stable ref-based context value for MoneyReportHeader children.
 * Modal triggers are registered imperatively via refs so the provider value never changes,
 * preventing unnecessary re-renders of consumers.
 */
function MoneyReportHeaderProvider({children, value}: {children: React.ReactNode; value: MoneyReportHeaderContextType}) {
    const stableRef = useRef(value);
    stableRef.current = value;

    // Stable callbacks that delegate to the latest ref
    const stableValue = useRef<MoneyReportHeaderContextType>({
        showHoldMenu: (...args) => stableRef.current.showHoldMenu(...args),
        showDownloadError: () => stableRef.current.showDownloadError(),
        showExportDownloadError: () => stableRef.current.showExportDownloadError(),
        showOfflineModal: () => stableRef.current.showOfflineModal(),
        showPDFModal: (...args) => stableRef.current.showPDFModal(...args),
        showHoldEducationalModal: () => stableRef.current.showHoldEducationalModal(),
        setRejectModalAction: (...args) => stableRef.current.setRejectModalAction(...args),
        showRateErrorModal: () => stableRef.current.showRateErrorModal(),
        showDuplicatePerDiemErrorModal: () => stableRef.current.showDuplicatePerDiemErrorModal(),
        confirmPayment: (...args) => stableRef.current.confirmPayment(...args),
        confirmApproval: () => stableRef.current.confirmApproval(),
    }).current;

    return <MoneyReportHeaderContext.Provider value={stableValue}>{children}</MoneyReportHeaderContext.Provider>;
}

export {useMoneyReportHeaderContext, MoneyReportHeaderProvider};
export type {MoneyReportHeaderContextType, RejectModalActionType};
