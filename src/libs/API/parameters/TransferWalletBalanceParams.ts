import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type TransferWalletBalanceParams = Partial<Record<ValueOf<typeof CONST.PAYMENT_METHOD_ID_KEYS>, number | undefined>>;

export default TransferWalletBalanceParams;
