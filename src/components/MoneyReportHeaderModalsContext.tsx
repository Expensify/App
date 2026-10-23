import type {ActionHandledType} from '@hooks/useHoldMenuSubmit';
import type {RejectModalAction} from '@hooks/useHoldRejectEducationalModal';

import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import {createContext, useContext} from 'react';

type HoldMenuParams = {
    requestType?: ActionHandledType;
    paymentType?: PaymentMethodType;
    methodID?: number;
    onConfirm?: (full: boolean) => void;
};

type MoneyReportHeaderModalsContextValue = {
    openHoldMenu: (params: HoldMenuParams) => Promise<void>;
    openPDFDownload: (options?: {onCancel?: () => void}) => void;
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
