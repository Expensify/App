import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';

type BasePolicyParams = {
    policy?: OnyxEntry<OnyxTypes.Policy>;
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyRecentlyUsedTags?: OnyxEntry<RecentlyUsedTags>;
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
};

export default BasePolicyParams;
