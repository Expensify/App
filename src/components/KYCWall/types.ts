import type {ForwardedRef, SyntheticEvent} from 'react';
import type {NativeTouchEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

type Source = ValueOf<typeof CONST.KYC_WALL_SOURCE>;

type TransferMethod = ValueOf<typeof CONST.WALLET.TRANSFER_METHOD_TYPE>;

type DOMRectProperties = 'top' | 'bottom' | 'left' | 'right' | 'height' | 'x' | 'y';

type DomRect = Pick<DOMRect, DOMRectProperties>;

type AnchorAlignment = {
    horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
    vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
};

type AnchorPosition = {
    anchorPositionVertical: number;
    anchorPositionHorizontal: number;
};

type PaymentMethod = ValueOf<typeof CONST.PAYMENT_METHODS>;

type KYCWallProps = {
    /** Route for the Add Bank Account screen for a given navigation stack */
    addBankAccountRoute: Route;

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute?: Route;

    /** Route for the KYC enable payments screen for a given navigation stack */
    enablePaymentsRoute: Route;

    /** Listen for window resize event on web and desktop */
    shouldListenForResize?: boolean;

    /** Wrapped components should be disabled, and not in spinner/loading state */
    isDisabled?: boolean;

    /** The source that triggered the KYC wall */
    source?: Source;

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID?: string;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxEntry<Report>;

    /** Where the popover should be positioned relative to the anchor points. */
    anchorAlignment?: AnchorAlignment;

    /** Whether the option to add a debit card should be included */
    shouldIncludeDebitCard?: boolean;

    /** Callback for when a payment method has been selected */
    onSelectPaymentMethod?: (paymentMethod: PaymentMethod) => void;

    /** Whether the personal bank account option should be shown */
    shouldShowPersonalBankAccountOption?: boolean;

    /** Callback for the end of the onContinue trigger on option selection */
    onSuccessfulKYC: (currentSource?: Source, iouPaymentType?: TransferMethod) => void;

    /** Children to build the KYC */
    children: (continueAction: (event: SyntheticEvent<NativeTouchEvent>, method: TransferMethod) => void, anchorRef: ForwardedRef<HTMLElement>) => void;
};

export type {AnchorPosition, KYCWallProps, PaymentMethod, TransferMethod, DomRect};
