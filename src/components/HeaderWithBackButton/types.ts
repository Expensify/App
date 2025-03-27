import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {Action} from '@hooks/useSingleExecution';
import type {StepCounterParams} from '@src/languages/params';
import type {AnchorPosition} from '@src/styles';
import type {Policy, Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';

type ThreeDotsMenuItem = {
    /** An icon element displayed on the left side */
    icon: IconAsset;

    /** Text label */
    text: string;

    /** A callback triggered when the item is selected */
    onSelected: () => void;
};

type HeaderWithBackButtonProps = Partial<ChildrenProps> & {
    /** Title of the Header */
    title?: string;

    /** Subtitle of the header */
    subtitle?: ReactNode;

    /** Title color */
    titleColor?: string;

    /**
     * Icon displayed on the left of the title.
     * If it is passed, the new styling is applied to the component:
     * taller header on desktop and different font of the title.
     * */
    icon?: IconAsset;

    /** Icon Width */
    iconWidth?: number;

    /** Icon Height */
    iconHeight?: number;

    /** Any additional styles to pass to the icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** Method to trigger when pressing download button of the header */
    onDownloadButtonPress?: () => void;

    /** Method to trigger when pressing close button of the header */
    onCloseButtonPress?: () => void;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    /** Method to trigger when pressing more options button of the header */
    onThreeDotsButtonPress?: () => void;

    /** Whether we should show a border on the bottom of the Header */
    shouldShowBorderBottom?: boolean;

    /** Whether we should show a download button */
    shouldShowDownloadButton?: boolean;

    /** Whether we should show a loading indicator replacing the download button */
    isDownloading?: boolean;

    /** Whether we should show a pin button */
    shouldShowPinButton?: boolean;

    /** Whether we should show a more options (threedots) button */
    shouldShowThreeDotsButton?: boolean;

    /** Whether we should disable threedots button */
    shouldDisableThreeDotsButton?: boolean;

    /** Whether we should set modal visibility when three dot menu opens */
    shouldSetModalVisibility?: boolean;

    /** List of menu items for more(three dots) menu */
    threeDotsMenuItems?: PopoverMenuItem[];

    /** The anchor position of the menu */
    threeDotsAnchorPosition?: AnchorPosition;

    /** The anchor alignment of the menu */
    threeDotsAnchorAlignment?: AnchorAlignment;

    /** Icon displayed on the right of the title */
    threeDotsMenuIcon?: IconAsset;

    /** The fill color to pass into the icon. */
    threeDotsMenuIconFill?: string;

    /** Whether we should show a close button */
    shouldShowCloseButton?: boolean;

    /** Whether we should show a back button */
    shouldShowBackButton?: boolean;

    /** Data to display a step counter in the header */
    stepCounter?: StepCounterParams;

    /** Whether we should show a report avatar */
    shouldShowReportAvatarWithDisplay?: boolean;

    /** Parent report, if provided it will override props.report for AvatarWithDisplay */
    parentReport?: OnyxEntry<Report>;

    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report?: OnyxEntry<Report>;

    /** The report's policy, if we're showing the details for a report and need info about it for AvatarWithDisplay */
    policy?: OnyxEntry<Policy>;

    /** Single execution function to prevent concurrent navigation actions */
    singleExecution?: <T extends unknown[]>(action: Action<T>) => Action<T>;

    /** Whether we should navigate to report page when the route have a topMostReport  */
    shouldNavigateToTopMostReport?: boolean;

    /** Whether the header should use the headline header style */
    shouldUseHeadlineHeader?: boolean;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    iconFill?: string;

    /** Whether the popover menu should overlay the current view */
    shouldOverlay?: boolean;

    /** Whether we should enable detail page navigation */
    shouldEnableDetailPageNavigation?: boolean;

    /** Whether we should overlay the 3 dots menu */
    shouldOverlayDots?: boolean;

    /** Whether we should display the button that opens the help pane */
    shouldDisplayHelpButton?: boolean;

    /** Whether we should display the button that opens new SearchRouter */
    shouldDisplaySearchRouter?: boolean;

    /** 0 - 100 number indicating current progress of the progress bar */
    progressBarPercentage?: number;

    /** Policy avatar to display in the header */
    policyAvatar?: Icon;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** The URL link associated with the attachment's subtitle, if available */
    subTitleLink?: string;
};

export type {ThreeDotsMenuItem};
export default HeaderWithBackButtonProps;
