import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type TransactionStateType = ValueOf<typeof CONST.TRANSACTION.STATE>;

export default TransactionStateType;
