import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type MoneyReportHeaderPrimaryActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, methodID?: number) => void;
    onExportModalOpen: () => void;
};

type SimpleActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
};

export type {MoneyReportHeaderPrimaryActionProps, SimpleActionProps};
