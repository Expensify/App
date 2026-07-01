import type {ImageContentFit} from 'expo-image';
import type {ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {MergeExclusive} from 'type-fest';
import type ImageSVGProps from '@components/ImageSVG/types';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type IconAsset from '@src/types/utils/IconAsset';

type BaseFeatureTrainingContentProps = {
    /** The aspect ratio to preserve for the icon, video or animation */
    illustrationAspectRatio?: number;

    /** Style for the inner container of the animation */
    illustrationInnerContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the outer container of the animation */
    illustrationOuterContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** Whether to show `Don't show me this again` option */
    shouldShowDismissModalOption?: boolean;

    /** A callback to call when user confirms the tutorial */
    onConfirm?: (willShowAgain: boolean) => void;

    /** A callback to call when modal closes */
    onClose?: () => void;

    /** Called whenever the "don't show again" checkbox value changes */
    onWillShowAgainChange?: (willShowAgain: boolean) => void;

    /** Text to show on secondary button */
    helpText?: string;

    /** Link to navigate to when user wants to learn more */
    onHelp?: () => void;

    /** Styles for the content container */
    contentInnerContainerStyles?: StyleProp<ViewStyle>;

    /** Styles for the content outer container */
    contentOuterContainerStyles?: StyleProp<ViewStyle>;

    /** Styles for the modal inner container */
    modalInnerContainerStyle?: ViewStyle;

    /** Children to show below title and description and above buttons (single-page mode only) */
    children?: ReactNode;

    /** Modal width */
    width?: number;

    /** Whether to disable the modal */
    isModalDisabled?: boolean;

    /** Whether the modal description is written in HTML */
    shouldRenderHTMLDescription?: boolean;

    /** Whether the modal will be closed on confirm */
    shouldCloseOnConfirm?: boolean;

    /** Whether the modal should avoid the keyboard */
    avoidKeyboard?: boolean;

    /** Whether the modal content is scrollable */
    shouldUseScrollView?: boolean;

    /** Whether to navigate back when closing the modal */
    shouldGoBack?: boolean;

    /** Whether to call onHelp when modal is hidden completely */
    shouldCallOnHelpWhenModalHidden?: boolean;

    /** Sentry label for the help/skip button */
    helpSentryLabel?: string;

    /** Sentry label for the confirm/submit button */
    confirmSentryLabel?: string;
};

type FeatureTrainingContentBodyProps = {
    /** Title for the modal */
    title?: string | React.ReactNode;

    /** Subtitle for the modal */
    subtitle?: string;

    /** Describe what is showing */
    description?: string;

    /** Text to show on primary button */
    confirmText: string;
};

type FeatureTrainingContentIllustrationVideoProps = {
    /** Animation to show when video is unavailable. Useful when app is offline */
    animation?: DotLottieAnimation;

    /** Additional styles for the animation */
    animationStyle?: StyleProp<ViewStyle>;

    /** URL for the video */
    videoURL?: string;
};

type FeatureTrainingContentIllustrationSVGProps = {
    /** Expensicon for the page */
    image: IconAsset;

    /** Determines how the image should be resized to fit its container */
    contentFitImage?: ImageContentFit;

    /** The width of the image */
    imageWidth?: ImageSVGProps['width'];

    /** The height of the image */
    imageHeight?: ImageSVGProps['height'];
};

// Illustration requires either an icon or a video/animation, but not both.
type FeatureTrainingContentIllustrationProps = MergeExclusive<FeatureTrainingContentIllustrationVideoProps, FeatureTrainingContentIllustrationSVGProps>;

type FeatureTrainingContentDataProps = FeatureTrainingContentIllustrationProps & FeatureTrainingContentBodyProps;

// Single-page mode
type FeatureTrainingContentProps = BaseFeatureTrainingContentProps & FeatureTrainingContentDataProps;

// Carousel mode
type FeatureTrainingCarouselProps = BaseFeatureTrainingContentProps & {
    /** Renders a horizontal paging carousel */
    pages: FeatureTrainingContentDataProps[];

    /** Called when the user swipes to a different page. */
    onPageChange?: (index: number) => void;
};

export type {
    BaseFeatureTrainingContentProps,
    FeatureTrainingContentBodyProps,
    FeatureTrainingContentIllustrationProps,
    FeatureTrainingContentDataProps,
    FeatureTrainingContentProps,
    FeatureTrainingCarouselProps,
};
