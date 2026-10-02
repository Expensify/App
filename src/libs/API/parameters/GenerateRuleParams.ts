import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type GenerateRuleParams = {
    policyID: string;
    generationID: string;
    ruleType: ValueOf<typeof CONST.GENERATED_RULE.RULE_TYPE>;
    prompt: string;
};

export default GenerateRuleParams;
