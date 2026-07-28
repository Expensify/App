import type {ReactNode} from 'react';
import type {ViewStyle} from 'react-native';

type FeatureTrainingProps = {
    /** Called when the user confirms the tutorial. `willShowAgain` reflects the DismissOption checkbox (true by default). */
    onConfirm?: (willShowAgain: boolean) => void;

    /** Called when the modal closes */
    onClose?: () => void;

    /** Called when the DismissOption checkbox is toggled */
    onWillShowAgainChange?: (willShowAgain: boolean) => void;

    /** Whether the modal should close after confirm (defaults to true) */
    shouldCloseOnConfirm?: boolean;

    /** Whether the content should render inside a ScrollView (auto-enabled in landscape) */
    shouldUseScrollView?: boolean;

    /** Modal content width on medium-or-larger screens */
    width?: number;

    /** Sentry label for the confirm button; can also be set per-primitive on <ConfirmButton sentryLabel=... /> */
    confirmSentryLabel?: string;

    /** Composed content — Illustration, Body, DismissOption, HelpButton, ConfirmButton, etc. */
    children?: ReactNode;
};

type FeatureTrainingCarouselProps = FeatureTrainingProps & {
    /** Called when the visible page changes */
    onPageChange?: (index: number) => void;
};

type FeatureTrainingModalProps = FeatureTrainingProps & {
    /** Style for the outer Modal inner container */
    modalInnerContainerStyle?: ViewStyle;
};

export type {FeatureTrainingProps, FeatureTrainingCarouselProps, FeatureTrainingModalProps};
