import type CONST from '@src/CONST';
import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';

import type {ValueOf} from 'type-fest';

type ConnectPolicyToMergeParams = {
    policyID: string;

    /** The Merge HR or ATS provider slug identifying which HR or ATS system to integrate with via merge dev */
    integration: MergeHRProviderSlug | MergeATSProviderSlug;

    /** The Merge category the integration belongs to */
    category: ValueOf<typeof CONST.MERGE.CATEGORY>;
};

export default ConnectPolicyToMergeParams;
