import {clearPolicyTagsLoadingState, openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Fetches a policy's tags on demand when a tag picker mounts, so a lazy-loaded account does not show only the tag
 * already on the expense. `OpenPolicyTagsPage` is the only tag read available to the client today.
 *
 * The guard is the RAM-only loading state written by `openPolicyTagsPage`, not "we already tried once": a read that
 * failed leaves `hasOnceLoaded` false, so the next mount or reconnect retries it. Gating on the collection existing
 * would not work either, since a partial collection holding just the selected tag is indistinguishable from a
 * complete one. `isLoading` is applied optimistically, so concurrent pickers for the same policy do not each fire a
 * redundant read (`API.read` does not dedupe in flight reads).
 */
function useLoadPolicyTags(policyID: string | undefined) {
    const [loadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const isLoading = !!loadingState?.isLoading;
    const hasOnceLoaded = !!loadingState?.hasOnceLoaded;
    const hasTags = policyTags !== undefined;

    // The policyID this instance has already dispatched a read for. A failed read clears `isLoading` without setting
    // `hasOnceLoaded`, which would otherwise re-satisfy the effect's guard and retry in a tight loop. Scoping the
    // attempt to this instance keeps the retry cadence at "next time a picker opens" (or the next reconnect below).
    const requestedPolicyIDRef = useRef<string>(undefined);

    const {isOffline} = useNetwork({
        onReconnect: () => {
            if (!policyID || hasOnceLoaded) {
                return;
            }
            // A read cut off by the disconnect never gets a response, so its `failureData` never applies and
            // `isLoading` would stay true for the rest of the session. Clear it so the effect below can retry.
            requestedPolicyIDRef.current = undefined;
            clearPolicyTagsLoadingState(policyID);
        },
    });

    useEffect(() => {
        if (isOffline || !policyID || isLoading || hasOnceLoaded || requestedPolicyIDRef.current === policyID) {
            return;
        }
        requestedPolicyIDRef.current = policyID;
        openPolicyTagsPage(policyID);
    }, [policyID, isOffline, isLoading, hasOnceLoaded]);

    // True only while the read is unsettled AND there is nothing to render yet, so the picker can show a skeleton
    // instead of an empty list. An absent loading state means the read has not been dispatched yet, which covers the
    // frame before the optimistic `isLoading` lands. A failed read clears `isLoading` without setting `hasOnceLoaded`,
    // so this reaches a terminal false rather than leaving the skeleton up forever. Tags already in Onyx are rendered
    // right away and refreshed underneath: a stale-but-present list beats a skeleton on every app start.
    const isLoadingPolicyTags = !isOffline && !hasOnceLoaded && !hasTags && (isLoading || loadingState === undefined);

    return {isLoadingPolicyTags};
}

export default useLoadPolicyTags;
