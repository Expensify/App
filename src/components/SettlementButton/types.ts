import type {PaymentMethod} from '@components/KYCWall/types';

import type CONST from '@src/CONST';
import type ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

type EnablePaymentsRoute = typeof ROUTES.ENABLE_PAYMENTS | typeof ROUTES.IOU_SEND_ENABLE_PAYMENTS | ReturnType<typeof ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute>;

type PaymentActionParams = {
    paymentType?: PaymentMethodType;
    payAsBusiness?: boolean;
    methodID?: number;
    paymentMethod?: PaymentMethod;
    policyID?: string;
};

type SettlementButtonProps = WithSentryLabel & {
    /** Callback to execute when this button is pressed. Receives payment action params. */
    onPress: (params: PaymentActionParams) => void;

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

    shouldHidePaymentOptions?: boolean;

    /** The policyID of the report we are paying */
    policyID: string | undefined;

    style?: StyleProp<ViewStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
    disabledStyle?: StyleProp<ViewStyle>;

    /** Total money amount in form <currency><amount> */
    formattedAmount?: string;

    size?: ValueOf<typeof CONST.BUTTON_SIZE>;

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute?: Route;

    isDisabled?: boolean;

    /** Whether the button should stay visually normal even when disabled. */
    stayNormalOnDisable?: boolean;

    /** Whether we should show a loading state for the main button */
    isLoading?: boolean;

    /** The anchor alignment of the popover menu for payment method dropdown */
    paymentMethodDropdownAnchorAlignment?: AnchorAlignment;

    /** The anchor alignment of the popover menu for KYC wall popover */
    kycWallAnchorAlignment?: AnchorAlignment;

    shouldShowPersonalBankAccountOption?: boolean;

    /** The priority to assign the enter key event listener to buttons. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** Whether to use keyboard shortcuts for confirmation or not */
    useKeyboardShortcuts?: boolean;

    onlyShowPayElsewhere?: boolean;
    shouldUseShortForm?: boolean;

    /** Whether we the report has only held expenses */
    hasOnlyHeldExpenses?: boolean;
};

export default SettlementButtonProps;
export type {PaymentActionParams};
