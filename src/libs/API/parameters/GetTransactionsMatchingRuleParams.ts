import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type GetTransactionsMatchingRuleParams = {
    scope: ValueOf<typeof CONST.RULES.SCOPE>;
    scopeID: string;
    filters: string;
};

export default GetTransactionsMatchingRuleParams;
