import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

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
