import type {ConnectPolicyToMergeParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';

import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';

function getMergeSetupLink(policyID: string, integration: MergeHRProviderSlug | MergeATSProviderSlug) {
    const params: ConnectPolicyToMergeParams = {policyID, integration};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_MERGE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

export default getMergeSetupLink;
