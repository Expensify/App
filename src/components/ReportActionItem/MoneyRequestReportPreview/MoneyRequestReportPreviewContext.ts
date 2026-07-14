import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import type CONST from '@src/CONST';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {Context} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {createContext, useContext} from 'react';

import type {MoneyRequestReportPreviewStyleType} from './types';
import type usePreviewMessageAnimation from './usePreviewMessageAnimation';
import type useReportPreviewCarousel from './useReportPreviewCarousel';

type ReportPreviewCarouselState = {
    isPreviousDisabled: boolean;
    isNextDisabled: boolean;
};

type ReportPreviewAnimationState = {
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    isSubmittingAnimationRunning: boolean;
};

type ReportPreviewData = {
    iouReportID: string | undefined;
    chatReportID: string | undefined;
    action: ReportAction;
    iouReport: OnyxEntry<Report>;
    chatReport: OnyxEntry<Report>;
    transactions: Transaction[];
    policy: OnyxEntry<Policy>;
    invoiceReceiverPolicy: OnyxEntry<Policy>;
    invoiceReceiverPersonalDetail: OnyxEntry<PersonalDetails> | null;
};

type ReportPreviewTransactionViolations = {
    /** Violations scoped to `ReportPreviewData.transactions`, computed once by the provider so branch buttons don't each re-select the whole collection. */
    transactionViolations: OnyxCollection<TransactionViolations>;
};

type ReportPreviewUIState = {
    isTransitionPending: boolean;
    shouldShowPreviewLoading: boolean;
    shouldShowAccessPlaceHolder: boolean;
    shouldShowEmptyPlaceholder: boolean;
    shouldShowSkeleton: boolean;
    showStatusAndSkeleton: boolean;
    shouldShowCarouselArrows: boolean;
    isScanning: boolean;
    previewCarouselMinWidth: number;
    skeletonReasonAttributes: SkeletonSpanReasonAttributes;
    carouselReasonAttributes: SkeletonSpanReasonAttributes;
    previewMessageStyle: ReturnType<typeof usePreviewMessageAnimation>['previewMessageStyle'];
    reportPreviewStyles: MoneyRequestReportPreviewStyleType;
    buttonMaxWidth: {maxWidth?: number};
};

type ReportPreviewCarouselList = Pick<
    ReturnType<typeof useReportPreviewCarousel>,
    'carouselTransactions' | 'carouselKey' | 'snapOffsets' | 'renderItem' | 'getItemType' | 'renderSeparator' | 'viewabilityConfig' | 'onViewableItemsChanged' | 'adjustScroll'
>;

type ReportPreviewActionState = {
    reportPreviewAction: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>;
    canIOUBePaid: boolean;
    onlyShowPayElsewhere: boolean;
    shouldShowPayButton: boolean;
    connectedIntegration: ConnectionName | undefined;
};

type ReportPreviewActions = {
    openReportFromPreview: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean, methodID?: number) => void;
    onHoldMenuClose: () => void;
    onPaymentOptionsShow?: () => void;
    onPaymentOptionsHide?: () => void;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
    goToPrevious: () => void;
    goToNext: () => void;
};

type ReportPreviewHoldMenuState = {
    requestType: ActionHandledType;
    paymentType: PaymentMethodType | undefined;
    canPay: boolean;
    methodID: number | undefined;
};

type ReportPreviewMeta = {
    setCarouselRef: ReturnType<typeof useReportPreviewCarousel>['setCarouselRef'];
};

const ReportPreviewCarouselStateContext = createContext<ReportPreviewCarouselState | undefined>(undefined);
const ReportPreviewAnimationStateContext = createContext<ReportPreviewAnimationState | undefined>(undefined);
const ReportPreviewDataContext = createContext<ReportPreviewData | undefined>(undefined);
const ReportPreviewTransactionViolationsContext = createContext<ReportPreviewTransactionViolations | undefined>(undefined);
const ReportPreviewUIStateContext = createContext<ReportPreviewUIState | undefined>(undefined);
const ReportPreviewCarouselListContext = createContext<ReportPreviewCarouselList | undefined>(undefined);
const ReportPreviewActionStateContext = createContext<ReportPreviewActionState | undefined>(undefined);
const ReportPreviewActionsContext = createContext<ReportPreviewActions | undefined>(undefined);
const ReportPreviewHoldMenuContext = createContext<ReportPreviewHoldMenuState | null | undefined>(undefined);
const ReportPreviewMetaContext = createContext<ReportPreviewMeta | undefined>(undefined);

function useSliceContext<T>(context: Context<T | undefined>, name: string): T {
    const value = useContext(context);
    if (!value) {
        throw new Error(`${name} must be used within a MoneyRequestReportPreviewProvider`);
    }
    return value;
}

const useReportPreviewCarouselState = () => useSliceContext(ReportPreviewCarouselStateContext, 'useReportPreviewCarouselState');
const useReportPreviewAnimationState = () => useSliceContext(ReportPreviewAnimationStateContext, 'useReportPreviewAnimationState');
const useReportPreviewData = () => useSliceContext(ReportPreviewDataContext, 'useReportPreviewData');
const useReportPreviewTransactionViolations = () => useSliceContext(ReportPreviewTransactionViolationsContext, 'useReportPreviewTransactionViolations');
const useReportPreviewUIState = () => useSliceContext(ReportPreviewUIStateContext, 'useReportPreviewUIState');
const useReportPreviewCarouselList = () => useSliceContext(ReportPreviewCarouselListContext, 'useReportPreviewCarouselList');
const useReportPreviewActionState = () => useSliceContext(ReportPreviewActionStateContext, 'useReportPreviewActionState');
const useReportPreviewActions = () => useSliceContext(ReportPreviewActionsContext, 'useReportPreviewActions');
const useReportPreviewHoldMenu = () => {
    const value = useContext(ReportPreviewHoldMenuContext);
    if (value === undefined) {
        throw new Error('useReportPreviewHoldMenu must be used within a MoneyRequestReportPreviewProvider');
    }
    return value;
};
const useReportPreviewMeta = () => useSliceContext(ReportPreviewMetaContext, 'useReportPreviewMeta');

export {
    ReportPreviewCarouselStateContext,
    ReportPreviewAnimationStateContext,
    ReportPreviewDataContext,
    ReportPreviewTransactionViolationsContext,
    ReportPreviewUIStateContext,
    ReportPreviewCarouselListContext,
    ReportPreviewActionStateContext,
    ReportPreviewActionsContext,
    ReportPreviewHoldMenuContext,
    ReportPreviewMetaContext,
    useReportPreviewCarouselState,
    useReportPreviewAnimationState,
    useReportPreviewData,
    useReportPreviewTransactionViolations,
    useReportPreviewUIState,
    useReportPreviewCarouselList,
    useReportPreviewActionState,
    useReportPreviewActions,
    useReportPreviewHoldMenu,
    useReportPreviewMeta,
};
export type {ReportPreviewActionState};
