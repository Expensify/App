import CONST from '@src/CONST';
import {BankAccountList, FundList, ReimbursementAccount, Report, UserWallet, WalletTerms} from '@src/types/onyx';
import { Route } from '@src/ROUTES';
import { ValueOf } from 'type-fest';
import { ForwardedRef, SyntheticEvent } from 'react';
import { NativeTouchEvent } from 'react-native';

type Source = ValueOf<typeof CONST.KYC_WALL_SOURCE>

type WalletTermsWithSource = WalletTerms & {source: Source}

type TransferMethod = ValueOf<typeof CONST.WALLET.TRANSFER_METHOD_TYPE>

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

    /** The user's wallet */
    userWallet?: UserWallet;

    /** Information related to the last step of the wallet activation flow */
    walletTerms?: WalletTermsWithSource;

    /** The source that triggered the KYC wall */
    source: Source;

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID?: string;

    /** List of user's cards */
    fundList?: FundList;

    /** List of bank accounts */
    bankAccountList?: BankAccountList;

    /** The chat report this report is linked to */
    chatReport?: Report;

    /** The IOU/Expense report we are paying */
    iouReport: Report;

    /** The reimbursement account linked to the Workspace */
    reimbursementAccount?: ReimbursementAccount;

    /** Where the popover should be positioned relative to the anchor points. */
    anchorAlignment?: {
        horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
        vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
    };

    /** Whether the option to add a debit card should be included */
    shouldIncludeDebitCard?: boolean;

    /** Callback for when a payment method has been selected */
    onSelectPaymentMethod?: (paymentMethod: PaymentMethod) => void;

    /** Whether the personal bank account option should be shown */
    shouldShowPersonalBankAccountOption?: boolean;

    onSuccessfulKYC: (currentSource: Source, iouPaymentType?: TransferMethod) => void;

    children: (continueAction: (event: SyntheticEvent<NativeTouchEvent>, method: TransferMethod) => void, anchorRef: ForwardedRef<HTMLElement>) => void
};

type DOMRectProperties = 'top' | 'bottom' | 'left' | 'right' | 'height' | 'x' | 'y';

type AnchorPosition = {
    anchorPositionVertical: number;
    anchorPositionHorizontal: number;
};

type PaymentMethod = ValueOf<typeof CONST.PAYMENT_METHODS>

export type {AnchorPosition, KYCWallProps, DOMRectProperties, PaymentMethod, TransferMethod};
