import type {RefObject} from 'react';
import type {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';

type PaymentType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE | typeof CONST.IOU.REPORT_ACTION_TYPE>;

type WorkspaceMemberBulkActionType = DeepValueOf<typeof CONST.POLICY.MEMBERS_BULK_ACTION_TYPES>;

type WorkspaceDistanceRatesBulkActionType = DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>;

type WorkspaceTaxRatesBulkActionType = DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>;

type ReportExportType = DeepValueOf<typeof CONST.REPORT.EXPORT_OPTIONS>;

type DropdownOption<TValueType> = {
    value: TValueType;
    text: string;
    icon?: IconAsset;
    iconWidth?: number;
    iconHeight?: number;
    iconDescription?: string;
    onSelected?: () => void;
    disabled?: boolean;
    iconFill?: string;
    interactive?: boolean;
    numberOfLinesTitle?: number;
    titleStyle?: ViewStyle;
    shouldCloseModalOnSelect?: boolean;
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
    buttonSize: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;

    /** Should the confirmation button be disabled? */
    isDisabled?: boolean;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Menu options to display */
    /** e.g. [{text: 'Pay with Expensify', icon: Wallet}] */
    options: Array<DropdownOption<TValueType>>;

    /** The anchor alignment of the popover menu */
    anchorAlignment?: AnchorAlignment;

    /* ref for the button */
    buttonRef?: RefObject<View>;

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
};

export type {
    PaymentType,
    WorkspaceMemberBulkActionType,
    WorkspaceDistanceRatesBulkActionType,
    DropdownOption,
    ButtonWithDropdownMenuProps,
    WorkspaceTaxRatesBulkActionType,
    ReportExportType,
};
