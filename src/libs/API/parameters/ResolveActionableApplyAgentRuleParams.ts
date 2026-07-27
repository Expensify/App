import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type ResolveActionableApplyAgentRuleParams = {
    reportActionID: string;
    resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_APPLY_AGENT_RULE_RESOLUTION>;
};

export default ResolveActionableApplyAgentRuleParams;
