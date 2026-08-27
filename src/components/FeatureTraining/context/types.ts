type FeatureTrainingStateValue = {
    /** Whether the "don't show me this again" option is currently unchecked (i.e. modal will show again) */
    willShowAgain: boolean;

    /** Whether the confirm action should show a spinner immediately on press */
    shouldShowLoadingImmediatelyOnPress: boolean | undefined;

    /** Whether this content is being rendered inside a carousel */
    isCarousel: boolean;

    /** Sentry label for the confirm button */
    confirmSentryLabel: string | undefined;

    /** Carousel-only: current 0-based page index (undefined in single-page mode) */
    currentPage: number | undefined;

    /** Carousel-only: total number of pages (undefined in single-page mode) */
    pageCount: number | undefined;

    /** Carousel-only: true when currentPage is the last one (undefined in single-page mode) */
    isLastPage: boolean | undefined;

    /** Carousel-only: locked minimum content height once all page heights are measured */
    contentMinHeight: number | undefined;
};

type FeatureTrainingActionsValue = {
    /** Toggles the "don't show again" state */
    toggleWillShowAgain: () => void;

    /** Fires the consumer's onConfirm callback with the current willShowAgain value; also closes when configured */
    handleConfirm: () => void;

    /** Closes the modal */
    handleClose: () => void;

    /** Carousel-only: advances to the next page (undefined in single-page mode) */
    advance: (() => void) | undefined;

    /** Carousel-only: returns to the previous page (undefined in single-page mode) */
    goBack: (() => void) | undefined;
};

export type {FeatureTrainingStateValue, FeatureTrainingActionsValue};
