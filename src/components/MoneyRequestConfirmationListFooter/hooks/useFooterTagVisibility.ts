import type {OnyxEntry} from 'react-native-onyx';
import {tagSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';
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

    /** ID of the active transaction (the hook resolves `transaction.tag` internally) */
    transactionID: string | undefined;
};

function useFooterTagVisibility({shouldShowTags, policy, policyTags, transactionID}: UseFooterTagVisibilityParams) {
    const transaction = useTransactionSelector(transactionID, tagSliceSelector);
    const tagVisibility = getTagVisibility({shouldShowTags, policy, policyTags, transaction});
    const previousTagsVisibility = usePrevious(tagVisibility.map((v) => v.shouldShow)) ?? [];
    return {tagVisibility, previousTagsVisibility};
}

export default useFooterTagVisibility;
