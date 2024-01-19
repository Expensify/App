import type {ReactNode} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {Action} from '@hooks/useSingleExecution';
import type {StepCounterParams} from '@src/languages/types';
import type {AnchorPosition} from '@src/styles';
import type {PersonalDetails, Policy, Report} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';

type ThreeDotsMenuItem = {
    /** An icon element displayed on the left side */
    icon?: IconAsset;

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

    /** Whether we should show a get assistance (question mark) button */
    shouldShowGetAssistanceButton?: boolean;

    /** Whether we should disable the get assistance button */
    shouldDisableGetAssistanceButton?: boolean;

    /** Whether we should show a pin button */
    shouldShowPinButton?: boolean;

    /** Whether we should show a more options (threedots) button */
    shouldShowThreeDotsButton?: boolean;

    /** Whether we should disable threedots button */
    shouldDisableThreeDotsButton?: boolean;

    /** List of menu items for more(three dots) menu */
    threeDotsMenuItems?: ThreeDotsMenuItem[];

    /** The anchor position of the menu */
    threeDotsAnchorPosition?: AnchorPosition;

    /** Whether we should show a close button */
    shouldShowCloseButton?: boolean;

    /** Whether we should show a back button */
    shouldShowBackButton?: boolean;

    /** The guides call taskID to associate with the get assistance button, if we show it */
    guidesCallTaskID?: string;

    /** Data to display a step counter in the header */
    stepCounter?: StepCounterParams;

    /** Whether we should show an avatar */
    shouldShowAvatarWithDisplay?: boolean;

    /** Parent report, if provided it will override props.report for AvatarWithDisplay */
    parentReport?: OnyxEntry<Report>;

    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report?: OnyxEntry<Report>;

    /** The report's policy, if we're showing the details for a report and need info about it for AvatarWithDisplay */
    policy?: OnyxEntry<Policy>;

    /** Policies, if we're showing the details for a report and need participant details for AvatarWithDisplay */
    personalDetails?: OnyxCollection<PersonalDetails>;

    /** Single execution function to prevent concurrent navigation actions */
    singleExecution?: <T extends unknown[]>(action: Action<T>) => Action<T>;

    /** Whether we should navigate to report page when the route have a topMostReport  */
    shouldNavigateToTopMostReport?: boolean;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    iconFill?: string;

    /** Whether the popover menu should overlay the current view */
    shouldOverlay?: boolean;

    /** Whether we should enable detail page navigation */
    shouldEnableDetailPageNavigation?: boolean;
};

export type {ThreeDotsMenuItem};
export default HeaderWithBackButtonProps;
