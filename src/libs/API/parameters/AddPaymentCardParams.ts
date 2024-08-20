import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AddPaymentCardParams = {
    cardNumber: string;
    cardYear: string;
    cardMonth: string;
    cardCVV: string;
    addressName: string;
    addressZip: string;
    currency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;
    isP2PDebitCard: boolean;
};
export default AddPaymentCardParams;
