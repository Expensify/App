/** Contract between the receipt partners page and the per-partner connection rows it renders */
import type CONST from '@src/CONST';

import type {ComponentType} from 'react';
import type {ValueOf} from 'type-fest';

type ReceiptPartnerName = ValueOf<typeof CONST.POLICY.RECEIPT_PARTNERS.NAME>;

/** Props every partner's connection row receives from the receipt partners page */
type ReceiptPartnerRowProps = {
    policyID: string;
};

type ReceiptPartnerRowComponent = ComponentType<ReceiptPartnerRowProps>;

export type {ReceiptPartnerName, ReceiptPartnerRowProps, ReceiptPartnerRowComponent};
