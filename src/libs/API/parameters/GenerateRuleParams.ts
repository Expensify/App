import type {GeneratedRuleType} from '@src/types/onyx/GeneratedRule';

type GenerateRuleParams = {
    policyID: string;
    generationID: string;
    ruleType: GeneratedRuleType;
    prompt: string;
};

export default GenerateRuleParams;
