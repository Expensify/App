import type {ActionHandledType} from '@hooks/useHoldMenuSubmit';
import type {RejectModalAction} from '@hooks/useHoldRejectEducationalModal';

import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import {createContext, useContext} from 'react';

import type {ModalStateChangePayload} from './Modal/Global/ModalContext';

type HoldMenuParams = {
    requestType?: ActionHandledType;
    paymentType?: PaymentMethodType;
    methodID?: number;
    onConfirm?: (full: boolean) => void;
};

type MoneyReportHeaderModalsContextValue = {
    openHoldMenu: (params: HoldMenuParams) => Promise<void>;
    /** Resolves once the PDF download modal has finished hiding, with `CLOSE` if it was dismissed while the PDF was still generating */
    openPDFDownload: () => Promise<ModalStateChangePayload | undefined>;
    openHoldEducational: () => void;
    openRejectModal: (action: RejectModalAction) => void;
    showOfflineModal: () => void;
    showDownloadErrorModal: () => void;
};

const defaultValue: MoneyReportHeaderModalsContextValue = {
    openHoldMenu: () => Promise.resolve(),
    openPDFDownload: () => Promise.resolve(undefined),
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
