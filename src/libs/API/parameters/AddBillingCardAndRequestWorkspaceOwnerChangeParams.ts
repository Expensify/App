import type {ValueOf} from '@src/types/utils/ValueOf';
import CONST from '@src/CONST';

type AddBillingCardAndRequestWorkspaceOwnerChangeParams = {
    policyID: string;
    cardNumber: string;
    cardYear: string;
    cardMonth: string;
    cardCVV: string;
    addressName: string;
    addressZip: string;
    currency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;
};

export default AddBillingCardAndRequestWorkspaceOwnerChangeParams;
