import type {Context, RefObject} from 'react';
import {createContext, useContext} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
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
};

type ReportPreviewCarouselList = Pick<
    ReturnType<typeof useReportPreviewCarousel>,
    'carouselTransactions' | 'carouselKey' | 'snapOffsets' | 'renderItem' | 'getItemType' | 'renderSeparator' | 'viewabilityConfig' | 'onViewableItemsChanged' | 'adjustScroll'
>;

type ReportPreviewActions = {
    openReportFromPreview: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean, methodID?: number) => void;
    onPaymentOptionsShow?: () => void;
    onPaymentOptionsHide?: () => void;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
    goToPrevious: () => void;
    goToNext: () => void;
};

/** Imperative handle exposed by the hold menu so the sibling action button can open it. */
type ReportPreviewHoldMenuHandle = {
    open: (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean, methodID?: number) => void;
};

type ReportPreviewMeta = {
    setCarouselRef: ReturnType<typeof useReportPreviewCarousel>['setCarouselRef'];
    holdMenuRef: RefObject<ReportPreviewHoldMenuHandle | null>;
};

const ReportPreviewCarouselStateContext = createContext<ReportPreviewCarouselState | undefined>(undefined);
const ReportPreviewAnimationStateContext = createContext<ReportPreviewAnimationState | undefined>(undefined);
const ReportPreviewDataContext = createContext<ReportPreviewData | undefined>(undefined);
const ReportPreviewUIStateContext = createContext<ReportPreviewUIState | undefined>(undefined);
const ReportPreviewCarouselListContext = createContext<ReportPreviewCarouselList | undefined>(undefined);
const ReportPreviewActionsContext = createContext<ReportPreviewActions | undefined>(undefined);
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
const useReportPreviewUIState = () => useSliceContext(ReportPreviewUIStateContext, 'useReportPreviewUIState');
const useReportPreviewCarouselList = () => useSliceContext(ReportPreviewCarouselListContext, 'useReportPreviewCarouselList');
const useReportPreviewActions = () => useSliceContext(ReportPreviewActionsContext, 'useReportPreviewActions');
const useReportPreviewMeta = () => useSliceContext(ReportPreviewMetaContext, 'useReportPreviewMeta');

export {
    ReportPreviewCarouselStateContext,
    ReportPreviewAnimationStateContext,
    ReportPreviewDataContext,
    ReportPreviewUIStateContext,
    ReportPreviewCarouselListContext,
    ReportPreviewActionsContext,
    ReportPreviewMetaContext,
    useReportPreviewCarouselState,
    useReportPreviewAnimationState,
    useReportPreviewData,
    useReportPreviewUIState,
    useReportPreviewCarouselList,
    useReportPreviewActions,
    useReportPreviewMeta,
};
export type {ReportPreviewHoldMenuHandle};
