import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type TransactionStateType = ValueOf<typeof CONST.TRANSACTION.STATE>;

export default TransactionStateType;