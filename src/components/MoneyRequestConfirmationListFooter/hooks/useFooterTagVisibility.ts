import type {OnyxEntry} from 'react-native-onyx';
import usePrevious from '@hooks/usePrevious';
import {getTagVisibility} from '@libs/TagsOptionsListUtils';
import type * as OnyxTypes from '@src/types/onyx';

type UseFooterTagVisibilityParams = {
    /** Whether tags should be shown for the current confirmation (gated by policy + chat type) */
    shouldShowTags: boolean;

    /** The policy whose tag rules drive visibility */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The full set of policy tag lists (one entry per tag list defined on the policy) */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** The transaction whose tags drive per-list visibility */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function useFooterTagVisibility({shouldShowTags, policy, policyTags, transaction}: UseFooterTagVisibilityParams) {
    const tagVisibility = getTagVisibility({shouldShowTags, policy, policyTags, transaction});
    const previousTagsVisibility = usePrevious(tagVisibility.map((v) => v.shouldShow)) ?? [];
    return {tagVisibility, previousTagsVisibility};
}

export default useFooterTagVisibility;
