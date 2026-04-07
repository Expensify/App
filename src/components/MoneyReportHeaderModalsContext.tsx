import {createContext, useContext} from 'react';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {ActionHandledType} from './Modal/Global/HoldMenuModalWrapper';
import type {RejectModalAction} from './MoneyReportHeaderEducationalModals';

type HoldMenuParams = {
    requestType: ActionHandledType;
    paymentType?: PaymentMethodType;
    methodID?: number;
    onConfirm?: (full: boolean) => void;
};

type MoneyReportHeaderModalsContextValue = {
    openHoldMenu: (params: HoldMenuParams) => Promise<void>;
    openPDFDownload: () => void;
    openHoldEducational: () => void;
    openRejectModal: (action: RejectModalAction) => void;
    showOfflineModal: () => void;
    showDownloadErrorModal: () => void;
};

const defaultValue: MoneyReportHeaderModalsContextValue = {
    openHoldMenu: () => Promise.resolve(),
    openPDFDownload: () => {},
    openHoldEducational: () => {},
    openRejectModal: () => {},
    showOfflineModal: () => {},
    showDownloadErrorModal: () => {},
};

const MoneyReportHeaderModalsContext = createContext<MoneyReportHeaderModalsContextValue>(defaultValue);

function useMoneyReportHeaderModals() {
    return useContext(MoneyReportHeaderModalsContext);
}

export default MoneyReportHeaderModalsContext;
export {useMoneyReportHeaderModals};
export type {HoldMenuParams};
