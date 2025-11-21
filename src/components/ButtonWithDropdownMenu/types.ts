import type {RefObject} from 'react';
import type {GestureResponderEvent, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';

type PaymentType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE | typeof CONST.IOU.REPORT_ACTION_TYPE>;

type WorkspaceMemberBulkActionType = DeepValueOf<typeof CONST.POLICY.MEMBERS_BULK_ACTION_TYPES>;

type RoomMemberBulkActionType = DeepValueOf<typeof CONST.REPORT.ROOM_MEMBERS_BULK_ACTION_TYPES>;

type WorkspaceDistanceRatesBulkActionType = DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>;

type WorkspaceTaxRatesBulkActionType = DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>;

type ReportExportType = DeepValueOf<typeof CONST.REPORT.EXPORT_OPTIONS>;

type OnboardingHelpType = DeepValueOf<typeof CONST.ONBOARDING_HELP>;

type DropdownOption<TValueType> = {
    value: TValueType;
    text: string;
    icon?: IconAsset;
    shouldShowButtonRightIcon?: boolean;
    iconWidth?: number;
    iconHeight?: number;
    iconDescription?: string;
    additionalIconStyles?: StyleProp<ViewStyle>;
    onSelected?: () => void | Promise<void>;
    disabled?: boolean;
    iconFill?: string;
    interactive?: boolean;
    numberOfLinesTitle?: number;
    titleStyle?: StyleProp<TextStyle>;
    shouldCloseModalOnSelect?: boolean;
    description?: string;
    descriptionTextStyle?: StyleProp<TextStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
    displayInDefaultIconColor?: boolean;
    /** Whether the selected index should be updated when the option is selected even if we have onSelected callback */
    shouldUpdateSelectedIndex?: boolean;
    subMenuItems?: PopoverMenuItem[];
    backButtonText?: string;
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
    shouldShow?: boolean;
    /** Whether to show a loading spinner for this option */
    shouldShowLoadingSpinnerIcon?: boolean;
};

type ButtonWithDropdownMenuProps<TValueType> = {
    /** The custom text to display on the main button instead of selected option */
    customText?: string;

    /** Text to display for the menu header */
    menuHeaderText?: string;

    /** Callback to execute when the main button is pressed */
    onPress: (event: GestureResponderEvent | KeyboardEvent | undefined, value: TValueType) => void;

    /** Callback to execute when a dropdown option is selected */
    onOptionSelected?: (option: DropdownOption<TValueType>) => void;

    /** Callback when the options popover is shown */
    onOptionsMenuShow?: () => void;

    /** Callback when the options popover is shown */
    onOptionsMenuHide?: () => void;

    /** Call the onPress function on main button when Enter key is pressed */
    pressOnEnter?: boolean;

    /** Whether we should show a loading state for the main button */
    isLoading?: boolean;

    /** The size of button size */
    buttonSize?: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;

    /** Render button in extra-small size */
    extraSmall?: boolean;

    /** Should the confirmation button be disabled? */
    isDisabled?: boolean;

    /** Whether the button should stay visually normal even when disabled. */
    shouldStayNormalOnDisable?: boolean;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Additional styles to add to the component when it's disabled */
    disabledStyle?: StyleProp<ViewStyle>;

    /** Menu options to display */
    /** e.g. [{text: 'Pay with Expensify', icon: Wallet}] */
    options: Array<DropdownOption<TValueType>>;

    /** The anchor alignment of the popover menu */
    anchorAlignment?: AnchorAlignment;

    /* ref for the button */
    buttonRef?: RefObject<View | null>;

    /** The priority to assign the enter key event listener to buttons. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** Whether the button should use success style or not */
    success?: boolean;

    /** Whether the dropdown menu should be shown even if it has only one option */
    shouldAlwaysShowDropdownMenu?: boolean;

    /** Additional style to add to the wrapper */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Whether the button should use split style or not */
    isSplitButton?: boolean;

    /** Whether to use keyboard shortcuts for confirmation or not */
    useKeyboardShortcuts?: boolean;

    /** Decides which index in menuItems should be selected */
    defaultSelectedIndex?: number;

    /** Whether selected items should be marked as selected */
    shouldShowSelectedItemCheck?: boolean;

    /** Used to locate the component in the tests */
    testID?: string;

    /** The second line text displays under the first line */
    secondLineText?: string;

    /** Callback to execute when a dropdown submenu option is selected */
    onSubItemSelected?: (selectedItem: PopoverMenuItem, index: number, event?: GestureResponderEvent | KeyboardEvent) => void;

    /** Icon for main button */
    icon?: IconAsset;

    /** Whether the popover content should be scrollable */
    shouldPopoverUseScrollView?: boolean;

    /** Container style to be applied to the popover of the dropdown menu */
    containerStyles?: StyleProp<ViewStyle>;

    /** Whether to use modal padding style for the popover menu */
    shouldUseModalPaddingStyle?: boolean;

    /** Whether to use short form for the button */
    shouldUseShortForm?: boolean;

    /** Whether to display the option icon when only one option is available */
    shouldUseOptionIcon?: boolean;

    /** Reference to the outer element */
    ref?: React.Ref<ButtonWithDropdownMenuRef>;
};

type ButtonWithDropdownMenuRef = {
    setIsMenuVisible: (visible: boolean) => void;
};

export type {
    PaymentType,
    WorkspaceMemberBulkActionType,
    RoomMemberBulkActionType,
    WorkspaceDistanceRatesBulkActionType,
    DropdownOption,
    ButtonWithDropdownMenuProps,
    WorkspaceTaxRatesBulkActionType,
    ReportExportType,
    OnboardingHelpType,
    ButtonWithDropdownMenuRef,
};
