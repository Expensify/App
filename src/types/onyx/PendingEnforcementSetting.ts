import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type PendingEnforcementSetting = {
    /** The policy ID for which the enforcement setting should be enabled */
    policyID: string;

    /** The type of enforcement setting to enable */
    setting: ValueOf<typeof CONST.POLICY.ENFORCEMENT_SETTING>;
};

export default PendingEnforcementSetting;
