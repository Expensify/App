import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import type {Action} from '@hooks/useSingleExecution';

import type CONST from '@src/CONST';
import type {StepCounterParams} from '@src/languages/params';
import type {TranslationPaths} from '@src/languages/types';
import type {Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

type ThreeDotsMenuItem = {
    /** An icon element displayed on the left side */
    icon: Extract<ExpensifyIconName, 'ChatBubbles' | 'CommentBubbles' | 'Pin' | 'QrCode'>;

    /** Translation key for the label */
    translationKey: TranslationPaths;

    onSelected: () => void;
};

type HeaderWithBackButtonProps = Partial<ChildrenProps> & {
    title?: string;
    subtitle?: string;
    titleColor?: string;

    /**
     * Icon displayed on the left of the title.
     * If it is passed, the new styling is applied to the component:
     * taller header on desktop and different font of the title.
     * */
    icon?: IconAsset;

    iconWidth?: number;
    iconHeight?: number;

    /** Any additional styles to pass to the icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** Method to trigger when pressing download button of the header */
    onDownloadButtonPress?: () => void;

    /** Method to trigger when pressing rotate button of the header */
    onRotateButtonPress?: () => void;

    /** Method to trigger when pressing close button of the header */
    onCloseButtonPress?: () => void;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    /** Method to trigger when pressing more options button of the header */
    onThreeDotsButtonPress?: () => void;

    shouldShowBorderBottom?: boolean;

    /** Whether we should display the status of the report */
    shouldDisplayStatus?: boolean;

    shouldShowDownloadButton?: boolean;

    /** Whether we should show a loading indicator replacing the download button */
    isDownloading?: boolean;

    shouldShowRotateButton?: boolean;

    /** Whether we should show a loading indicator replacing the rotate button */
    isRotating?: boolean;

    shouldShowPinButton?: boolean;
    shouldShowThreeDotsButton?: boolean;
    shouldDisableThreeDotsButton?: boolean;

    /** Whether we should set modal visibility when three dot menu opens */
    shouldSetModalVisibility?: boolean;

    threeDotsMenuItems?: PopoverMenuItem[];

    /** The anchor alignment of the menu */
    threeDotsAnchorAlignment?: AnchorAlignment;

    /** Icon displayed on the right of the title */
    threeDotsMenuIcon?: IconAsset;

    /** The fill color to pass into the icon. */
    threeDotsMenuIconFill?: string;

    shouldShowCloseButton?: boolean;
    shouldShowBackButton?: boolean;

    /** Data to display a step counter in the header */
    stepCounter?: StepCounterParams;

    shouldShowReportAvatarWithDisplay?: boolean;

    /** Parent report, if provided it will override props.report for AvatarWithDisplay */
    parentReport?: OnyxEntry<Report>;

    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report?: OnyxEntry<Report>;

    /** Single execution function to prevent concurrent navigation actions */
    singleExecution?: <T extends unknown[]>(action: Action<T>) => Action<T>;

    /** Whether we should navigate to report page when the route have a topMostReport  */
    shouldNavigateToTopMostReport?: boolean;

    shouldUseHeadlineHeader?: boolean;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    iconFill?: string;

    /** Whether the popover menu should overlay the current view */
    shouldOverlay?: boolean;

    shouldEnableDetailPageNavigation?: boolean;
    numberOfTitleLines?: number;

    /** Whether we should overlay the 3 dots menu */
    shouldOverlayDots?: boolean;

    /** Whether we should display the button that opens the Help Panel */
    shouldDisplayHelpButton?: boolean;

    /** Whether we should display the button that opens new SearchRouter */
    shouldDisplaySearchRouter?: boolean;

    /** Policy avatar to display in the header */
    policyAvatar?: Icon;

    /** Size of the policy avatar. Defaults to CONST.AVATAR_SIZE.DEFAULT */
    policyAvatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;

    titleStyles?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;

    /** The URL link associated with the attachment's subtitle, if available */
    subTitleLink?: string;

    /** If true, display the individual button instead of the three-dot menu when there's only one menu item */
    shouldMinimizeMenuButton?: boolean;
    /** Whether to open the parent report link in the current tab if possible */
    openParentReportInCurrentTab?: boolean;

    /** Whether to skip focus of the first interactive element inside the header after the RHP transition for screen reader announcement.  */
    shouldSkipFocusAfterTransition?: boolean;
};

export type {ThreeDotsMenuItem};
export default HeaderWithBackButtonProps;
