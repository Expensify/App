import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type TransferWalletBalanceParams = Partial<Record<ValueOf<typeof CONST.PAYMENT_METHOD_ID_KEYS>, number | undefined>>;

export default TransferWalletBalanceParams;
