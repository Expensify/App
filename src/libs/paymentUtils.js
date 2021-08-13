import _ from 'underscore';
import CONST from '../CONST';
import {translateLocal} from './translate';

function getPaymentMethodsList(bankAccountList, cardList, payPalMeUsername) {
    const combinedPaymentMethods = [];

    _.each(bankAccountList, (bankAccount) => {
        // Add all bank accounts besides the wallet
        if (bankAccount.type !== CONST.BANK_ACCOUNT_TYPES.WALLET) {
            const formattedBankAccountNumber = bankAccount.accountNumber
                ? `${translateLocal('paymentMethodList.accountLastFour')} ${bankAccount.accountNumber.slice(-4)
                }`
                : null;
            combinedPaymentMethods.push({
                title: bankAccount.addressName,
                number: bankAccount.accountNumber,
                id: bankAccount.bankAccountID,
                description: formattedBankAccountNumber,
                key: `bankAccount-${bankAccount.bankAccountID}`,
                type: 'bank',
            });
        }
    });

    _.each(cardList, (card) => {
        // Add all cards besides the "cash" card
        if (card.cardName !== CONST.CARD_TYPES.DEFAULT_CASH) {
            const formattedCardNumber = card.cardNumber
                ? `${translateLocal('paymentMethodList.cardLastFour')} ${card.cardNumber.slice(-4)}`
                : null;
            combinedPaymentMethods.push({
                title: card.cardName,
                number: card.cardNumber,
                id: card.cardID,
                description: formattedCardNumber,
                key: `card-${card.cardID}`,
                type: 'card',
            });
        }
    });

    if (payPalMeUsername) {
        combinedPaymentMethods.push({
            title: 'PayPal.me',
            description: payPalMeUsername,
            key: 'payPalMePaymentMethod',
            id: 'payPalMe',
            type: 'payPalMe',
        });
    }

    return combinedPaymentMethods;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPaymentMethodsList,
};
