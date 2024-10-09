import * as API from '@libs/API';
import type {ConnectPolicyToQuickBooksDesktopParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

function getQuickbooksDesktopCodatSetupLink(policyID: string) {
    const params: ConnectPolicyToQuickBooksDesktopParams = {policyID};

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_DESKTOP, params);
}

// eslint-disable-next-line import/prefer-default-export
export {getQuickbooksDesktopCodatSetupLink};
