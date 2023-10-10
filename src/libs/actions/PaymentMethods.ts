import {createRef} from 'react';
import Onyx, {OnyxUpdate} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import ONYXKEYS, {OnyxValues} from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Navigation from '../Navigation/Navigation';
import * as CardUtils from '../CardUtils';
import ROUTES from '../../ROUTES';
import {PaymentMethod} from '../PaymentUtils';

type KYCWallRef = {
    continue?: () => void;
};

type PaymentCardParams = {expirationDate: string; cardNumber: string; securityCode: string; nameOnCard: string; addressZipCode: string};

type FilterMethodPaymentType = typeof CONST.PAYMENT_METHODS.DEBIT_CARD | typeof CONST.PAYMENT_METHODS.BANK_ACCOUNT | null;

/**
 * Sets up a ref to an instance of the KYC Wall component.
 */
const kycWallRef = createRef<KYCWallRef>();

/**
 * When we successfully add a payment method or pass the KYC checks we will continue with our setup action if we have one set.
 */
function continueSetup() {
    if (!kycWallRef.current?.continue) {
        Navigation.goBack(ROUTES.HOME);
        return;
    }

    // Close the screen (Add Debit Card, Add Bank Account, or Enable Payments) on success and continue with setup
    Navigation.goBack(ROUTES.HOME);
    kycWallRef.current.continue();
}

function openWalletPage() {
    return API.read(
        'OpenPaymentsPage',
        {},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
                    value: true,
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
                    value: false,
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
                    value: false,
                },
            ],
        },
    );
}

function getMakeDefaultPaymentOnyxData(
    bankAccountID: number,
    fundID: number,
    previousPaymentMethod: PaymentMethod,
    currentPaymentMethod: PaymentMethod,
    isOptimisticData = true,
): OnyxUpdate[] {
    const onyxData: OnyxUpdate[] = [
        isOptimisticData
            ? {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: ONYXKEYS.USER_WALLET,
                  value: {
                      walletLinkedAccountID: bankAccountID || fundID,
                      walletLinkedAccountType: bankAccountID ? CONST.PAYMENT_METHODS.BANK_ACCOUNT : CONST.PAYMENT_METHODS.DEBIT_CARD,
                      // Only clear the error if this is optimistic data. If this is failure data, we do not want to clear the error that came from the server.
                      errors: null,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: ONYXKEYS.USER_WALLET,
                  value: {
                      walletLinkedAccountID: bankAccountID || fundID,
                      walletLinkedAccountType: bankAccountID ? CONST.PAYMENT_METHODS.BANK_ACCOUNT : CONST.PAYMENT_METHODS.DEBIT_CARD,
                  },
              },
    ];

    if (previousPaymentMethod?.methodID) {
        onyxData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: previousPaymentMethod.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.FUND_LIST,
            value: {
                [previousPaymentMethod.methodID]: {
                    isDefault: !isOptimisticData,
                },
            },
        });
    }

    if (currentPaymentMethod?.methodID) {
        onyxData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: currentPaymentMethod.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.FUND_LIST,
            value: {
                [currentPaymentMethod.methodID]: {
                    isDefault: isOptimisticData,
                },
            },
        });
    }

    return onyxData;
}

type MakeDefaultPaymentMethodParams = {
    bankAccountID: number;
    fundID: number;
};

/**
 * Sets the default bank account or debit card for an Expensify Wallet
 *
 */
function makeDefaultPaymentMethod(bankAccountID: number, fundID: number, previousPaymentMethod: PaymentMethod, currentPaymentMethod: PaymentMethod) {
    const parameters: MakeDefaultPaymentMethodParams = {
        bankAccountID,
        fundID,
    };

    API.write('MakeDefaultPaymentMethod', parameters, {
        optimisticData: getMakeDefaultPaymentOnyxData(bankAccountID, fundID, previousPaymentMethod, currentPaymentMethod, true),
        failureData: getMakeDefaultPaymentOnyxData(bankAccountID, fundID, previousPaymentMethod, currentPaymentMethod, false),
    });
}

type AddPaymentCardParams = {
    cardNumber: string;
    cardYear: string;
    cardMonth: string;
    cardCVV: string;
    addressName: string;
    addressZip: string;
    currency: ValueOf<typeof CONST.CURRENCY>;
    isP2PDebitCard: boolean;
};

/**
 * Calls the API to add a new card.
 *
 */
function addPaymentCard(params: PaymentCardParams) {
    const cardMonth = CardUtils.getMonthFromExpirationDateString(params.expirationDate);
    const cardYear = CardUtils.getYearFromExpirationDateString(params.expirationDate);

    const parameters: AddPaymentCardParams = {
        cardNumber: params.cardNumber,
        cardYear,
        cardMonth,
        cardCVV: params.securityCode,
        addressName: params.nameOnCard,
        addressZip: params.addressZipCode,
        currency: CONST.CURRENCY.USD,
        isP2PDebitCard: true,
    };

    API.write('AddPaymentCard', parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
                value: {isLoading: true},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
                value: {isLoading: false},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
                value: {isLoading: false},
            },
        ],
    });
}

/**
 * Resets the values for the add debit card form back to their initial states
 */
function clearDebitCardFormErrorAndSubmit() {
    Onyx.set(ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM, {
        isLoading: false,
        errors: undefined,
        setupComplete: true,
    });
}

type TransferWalletBalanceParameters = Partial<Record<ValueOf<typeof CONST.PAYMENT_METHOD_ID_KEYS>, number | undefined>>;

/**
 * Call the API to transfer wallet balance.
 *
 */
function transferWalletBalance(paymentMethod: PaymentMethod) {
    const paymentMethodIDKey = paymentMethod.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT ? CONST.PAYMENT_METHOD_ID_KEYS.BANK_ACCOUNT : CONST.PAYMENT_METHOD_ID_KEYS.DEBIT_CARD;
    const parameters: TransferWalletBalanceParameters = {
        [paymentMethodIDKey]: paymentMethod.methodID,
    };

    API.write('TransferWalletBalance', parameters, {
        optimisticData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.WALLET_TRANSFER,
                value: {
                    loading: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.WALLET_TRANSFER,
                value: {
                    loading: false,
                    shouldShowSuccess: true,
                    paymentMethodType: paymentMethod.accountType,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.WALLET_TRANSFER,
                value: {
                    loading: false,
                    shouldShowSuccess: false,
                },
            },
        ],
    });
}

function resetWalletTransferData() {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {
        selectedAccountType: '',
        selectedAccountID: null,
        filterPaymentMethodType: null,
        loading: false,
        shouldShowSuccess: false,
    });
}

function saveWalletTransferAccountTypeAndID(selectedAccountType: string, selectedAccountID: string) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {selectedAccountType, selectedAccountID});
}

/**
 * Toggles the user's selected type of payment method (bank account or debit card) on the wallet transfer balance screen.
 *
 */
function saveWalletTransferMethodType(filterPaymentMethodType?: FilterMethodPaymentType) {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {filterPaymentMethodType});
}

function dismissSuccessfulTransferBalancePage() {
    Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {shouldShowSuccess: false});
    Navigation.goBack(ROUTES.SETTINGS_WALLET);
}

/**
 * Looks through each payment method to see if there is an existing error
 *
 */
function hasPaymentMethodError(bankList: OnyxValues[typeof ONYXKEYS.BANK_ACCOUNT_LIST], fundList: OnyxValues[typeof ONYXKEYS.FUND_LIST]): boolean {
    const combinedPaymentMethods = {...bankList, ...fundList};

    return Object.values(combinedPaymentMethods).some((item) => !!item.errors);
}

/**
 * Clears the error for the specified payment item
 * @param paymentListKey The onyx key for the provided payment method
 * @param paymentMethodID
 */
function clearDeletePaymentMethodError(paymentListKey: typeof ONYXKEYS.BANK_ACCOUNT_LIST | typeof ONYXKEYS.FUND_LIST, paymentMethodID: string) {
    Onyx.merge(paymentListKey, {
        [paymentMethodID]: {
            pendingAction: null,
            errors: null,
        },
    });
}

/**
 * If there was a failure adding a payment method, clearing it removes the payment method from the list entirely
 * @param paymentListKey The onyx key for the provided payment method
 * @param paymentMethodID
 */
function clearAddPaymentMethodError(paymentListKey: typeof ONYXKEYS.BANK_ACCOUNT_LIST | typeof ONYXKEYS.FUND_LIST, paymentMethodID: string) {
    Onyx.merge(paymentListKey, {
        [paymentMethodID]: null,
    });
}

/**
 * Clear any error(s) related to the user's wallet
 */
function clearWalletError() {
    Onyx.merge(ONYXKEYS.USER_WALLET, {errors: null});
}

/**
 * Clear any error(s) related to the user's wallet terms
 */
function clearWalletTermsError() {
    Onyx.merge(ONYXKEYS.WALLET_TERMS, {errors: null});
}

type DeletePaymentCardParams = {
    fundID: number;
};

function deletePaymentCard(fundID: number) {
    const parameters: DeletePaymentCardParams = {
        fundID,
    };

    API.write('DeletePaymentCard', parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.FUND_LIST}`,
                value: {[fundID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}},
            },
        ],
    });
}

export {
    deletePaymentCard,
    addPaymentCard,
    openWalletPage,
    makeDefaultPaymentMethod,
    kycWallRef,
    continueSetup,
    clearDebitCardFormErrorAndSubmit,
    dismissSuccessfulTransferBalancePage,
    transferWalletBalance,
    resetWalletTransferData,
    saveWalletTransferAccountTypeAndID,
    saveWalletTransferMethodType,
    hasPaymentMethodError,
    clearDeletePaymentMethodError,
    clearAddPaymentMethodError,
    clearWalletError,
    clearWalletTermsError,
};
