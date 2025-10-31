import * as API from '@libs/API';
import type OpenPolicyRulesPageParams from '@libs/API/parameters/OpenPolicyRulesPageParams';
import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

function openPolicyRulesPage(policyID: string | undefined) {
    console.log('openPolicyRulesPage', policyID);
    if (!policyID) {
        Log.warn('openPolicyRulesPage invalid params', {policyID});
        return;
    }
    const params: OpenPolicyRulesPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_RULES_PAGE, params);
}

// eslint-disable-next-line import/prefer-default-export
export {openPolicyRulesPage};
