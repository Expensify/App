import React, {createContext, useContext} from 'react';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {RejectModalAction} from './MoneyReportHeaderEducationalModals';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';

type HoldMenuParams = {
    requestType: ActionHandledType;
    paymentType?: PaymentMethodType;
    methodID?: number;
    onConfirm?: (full: boolean) => void;
};

type MoneyReportHeaderModalsContextValue = {
    openHoldMenu: (params: HoldMenuParams) => void;
    closeHoldMenu: () => void;
    openPDFDownload: () => void;
    openHoldEducational: () => void;
    openRejectModal: (action: RejectModalAction) => void;
};

const defaultValue: MoneyReportHeaderModalsContextValue = {
    openHoldMenu: () => {},
    closeHoldMenu: () => {},
    openPDFDownload: () => {},
    openHoldEducational: () => {},
    openRejectModal: () => {},
};

const MoneyReportHeaderModalsContext = createContext<MoneyReportHeaderModalsContextValue>(defaultValue);

function useMoneyReportHeaderModals() {
    return useContext(MoneyReportHeaderModalsContext);
}

export default MoneyReportHeaderModalsContext;
export {useMoneyReportHeaderModals};
export type {HoldMenuParams};
