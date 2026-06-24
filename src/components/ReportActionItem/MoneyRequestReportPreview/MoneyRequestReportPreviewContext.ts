import type {Context, RefObject} from 'react';
import {createContext, useContext} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {ReportPreviewHoldMenuHandle} from './ReportPreviewHoldMenu';
import type {MoneyRequestReportPreviewStyleType} from './types';
import type usePreviewMessageAnimation from './usePreviewMessageAnimation';
import type useReportPreviewCarousel from './useReportPreviewCarousel';

/**
 * Context for the money request report preview, modeled on `ReportActionCompose`'s `ComposerContext`: the provider
 * owns all state/derivations once and exposes it as slices split by concept + "temperature", so a change to one slice
 * never re-renders consumers of another. Components read only the slice(s) they need instead of having data drilled.
 *
 * - Hot   — `CarouselState`: arrow-disabled flags, change on every scroll. `AnimationState`: pay/approve animation
 *           running flags, flip during a settle/approve.
 * - Warm  — `Data` (report subject), `UIState` (presentation/loading), `CarouselList`.
 * - Frozen— `Actions` (stable callbacks), `Meta` (stable refs).
 */

// Hot — changes on every carousel scroll
type ReportPreviewCarouselState = {
    isPreviousDisabled: boolean;
    isNextDisabled: boolean;
};

// Hot — flips while a pay/approve animation runs; consumed only by the body (to feed the action button), so it is
// kept out of UIState to avoid re-rendering the header/total/carousel when an animation starts or ends.
type ReportPreviewAnimationState = {
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    isSubmittingAnimationRunning: boolean;
};

// Warm — the report subject; changes when the report's transactions/data update
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

// Warm — presentation/loading state + animation-running flags
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

// Warm — the carousel FlashList data + handlers (consumed only by the carousel body)
type ReportPreviewCarouselList = Pick<
    ReturnType<typeof useReportPreviewCarousel>,
    'carouselTransactions' | 'carouselKey' | 'snapOffsets' | 'renderItem' | 'getItemType' | 'renderSeparator' | 'viewabilityConfig' | 'onViewableItemsChanged' | 'adjustScroll'
>;

// Frozen — stable callbacks
type ReportPreviewActions = {
    openReportFromPreview: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean) => void;
    onPaymentOptionsShow?: () => void;
    onPaymentOptionsHide?: () => void;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
    goToPrevious: () => void;
    goToNext: () => void;
};

// Frozen — stable refs
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
export type {ReportPreviewCarouselState, ReportPreviewAnimationState, ReportPreviewData, ReportPreviewUIState, ReportPreviewCarouselList, ReportPreviewActions, ReportPreviewMeta};
