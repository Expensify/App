import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type CreateTestBankAccountParams = {type: ValueOf<typeof CONST.TEST_BANK_ACCOUNT_TYPE>};

export default CreateTestBankAccountParams;
