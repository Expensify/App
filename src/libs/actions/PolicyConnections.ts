import * as API from '@libs/API';
import type {OpenPolicyAccountingPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';

function openPolicyAccountingPage(policyID: string) {
    const parameters: OpenPolicyAccountingPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_ACCOUNTING_PAGE, parameters);
}

// More action functions will be added later
// eslint-disable-next-line import/prefer-default-export
export {openPolicyAccountingPage};
