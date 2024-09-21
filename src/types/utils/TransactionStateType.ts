import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type TransactionStateType = ValueOf<typeof CONST.TRANSACTION_STATE>;

export default TransactionStateType;