import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function getMakeDefaultPaymentOnyxData(
    bankAccountID: number,
    fundID?: number,
    previousPaymentMethod?: PaymentMethod,
    currentPaymentMethod?: PaymentMethod,
    isOptimisticData = true,
): Array<OnyxUpdate<typeof ONYXKEYS.USER_WALLET | typeof ONYXKEYS.BANK_ACCOUNT_LIST | typeof ONYXKEYS.FUND_LIST>> {
    const onyxData: Array<OnyxUpdate<typeof ONYXKEYS.USER_WALLET | typeof ONYXKEYS.BANK_ACCOUNT_LIST | typeof ONYXKEYS.FUND_LIST>> = [
        isOptimisticData
            ? {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: ONYXKEYS.USER_WALLET,
                  value: {
                      walletLinkedAccountID: bankAccountID || fundID,
                      walletLinkedAccountType: bankAccountID ? CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT : CONST.PAYMENT_METHODS.DEBIT_CARD,
                      // Only clear the error if this is optimistic data. If this is failure data, we do not want to clear the error that came from the server.
                      errors: null,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: ONYXKEYS.USER_WALLET,
                  value: {
                      walletLinkedAccountID: bankAccountID || fundID,
                      walletLinkedAccountType: bankAccountID ? CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT : CONST.PAYMENT_METHODS.DEBIT_CARD,
                  },
              },
    ];

    if (previousPaymentMethod?.methodID) {
        onyxData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: previousPaymentMethod.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.FUND_LIST,
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
            key: currentPaymentMethod.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.FUND_LIST,
            value: {
                [currentPaymentMethod.methodID]: {
                    isDefault: isOptimisticData,
                },
            },
        });
    }

    return onyxData;
}

export default getMakeDefaultPaymentOnyxData;
