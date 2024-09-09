import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {ButtonSizeValue} from '@src/styles/utils/types';
import type {Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

type EnablePaymentsRoute = typeof ROUTES.ENABLE_PAYMENTS | typeof ROUTES.IOU_SEND_ENABLE_PAYMENTS | typeof ROUTES.SETTINGS_ENABLE_PAYMENTS;

type SettlementButtonProps = {
    /** Callback to execute when this button is pressed. Receives a single payment type argument. */
    onPress: (paymentType?: PaymentMethodType, payAsBusiness?: boolean) => void;

    /** Callback when the payment options popover is shown */
    onPaymentOptionsShow?: () => void;

    /** Callback when the payment options popover is closed */
    onPaymentOptionsHide?: () => void;

    /** The route to redirect if user does not have a payment method setup */
    enablePaymentsRoute: EnablePaymentsRoute;

    /** Call the onPress function on main button when Enter key is pressed */
    pressOnEnter?: boolean;

    /** Settlement currency type */
    currency?: string;

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID?: string;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxEntry<Report>;

    /** Should we show the payment options? */
    shouldHidePaymentOptions?: boolean;

    /** Should we show the payment options? */
    shouldShowApproveButton?: boolean;

    /** Should approve button be disabled? */
    shouldDisableApproveButton?: boolean;

    /** The policyID of the report we are paying */
    policyID?: string;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Additional styles to add to the component when it's disabled */
    disabledStyle?: StyleProp<ViewStyle>;

    /** Total money amount in form <currency><amount> */
    formattedAmount?: string;

    /** The size of button size */
    buttonSize?: ButtonSizeValue;

    /** Route for the Add Bank Account screen for a given navigation stack */
    addBankAccountRoute?: Route;

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute?: Route;

    /** Whether the button should be disabled */
    isDisabled?: boolean;

    /** Whether we should show a loading state for the main button */
    isLoading?: boolean;

    /** The anchor alignment of the popover menu for payment method dropdown */
    paymentMethodDropdownAnchorAlignment?: AnchorAlignment;

    /** The anchor alignment of the popover menu for KYC wall popover */
    kycWallAnchorAlignment?: AnchorAlignment;

    /** Whether the personal bank account option should be shown */
    shouldShowPersonalBankAccountOption?: boolean;

    /** The priority to assign the enter key event listener to buttons. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** Callback to open confirmation modal if any of the transactions is on HOLD */
    confirmApproval?: () => void;

    /** Whether to use keyboard shortcuts for confirmation or not */
    useKeyboardShortcuts?: boolean;
};

export default SettlementButtonProps;
