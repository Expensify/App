import {clearPolicyTagsLoadingState, openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {RefObject} from 'react';

import {useEffect, useRef} from 'react';

import useCanReadPolicyFeature from './useCanReadPolicyFeature';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Fetches a policy's tags on demand when a tag picker mounts, so a lazy-loaded account does not show only the tag
 * already on the expense. `OpenPolicyTagsPage` is the only tag read available to the client today.
 *
 * The guard is the RAM-only loading state written by `openPolicyTagsPage`, not "we already tried once": a read that
 * failed leaves `hasOnceLoaded` false, so the next mount or reconnect retries it. Gating on the collection existing
 * would not work either, since a partial collection holding just the selected tag is indistinguishable from a
 * complete one.
 *
 * `API.read` does not dedupe in-flight reads, and the optimistic `isLoading` reaches Onyx only after every picker that
 * mounted in the same render has run its effect. Until then, `pendingReadOwners` stops a second picker for the same
 * policy from sending its own read.
 *
 * Only roles that can read the workspace's tags send the read, since Auth rejects it for every other role. Those
 * members get the tags with the report through `OpenReport` instead.
 */
/** Policies whose tags read was sent before its optimistic `isLoading` reached Onyx, mapped to the picker that sent it */
const pendingReadOwners = new Map<string, RefObject<string | undefined>>();

function useLoadPolicyTags(policyID: string | undefined) {
    const [loadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const canReadTags = useCanReadPolicyFeature(policyID, CONST.POLICY.POLICY_FEATURE.TAGS);
    const isLoading = !!loadingState?.isLoading;
    const hasOnceLoaded = !!loadingState?.hasOnceLoaded;
    const hasTags = policyTags !== undefined;

    // The policyID this instance has already dispatched a read for. A failed read clears `isLoading` without setting
    // `hasOnceLoaded`, which would otherwise re-satisfy the effect's guard and retry in a tight loop. Scoping the
    // attempt to this instance keeps the retry cadence at "next time a picker opens" (or the next reconnect below).
    const requestedPolicyIDRef = useRef<string>(undefined);

    const {isOffline} = useNetwork({
        onReconnect: () => {
            if (!policyID || !canReadTags || hasOnceLoaded) {
                return;
            }
            // A read cut off by the disconnect never gets a response, so its `failureData` never applies and
            // `isLoading` would stay true for the rest of the session. Clear it so the effect below can retry.
            requestedPolicyIDRef.current = undefined;
            pendingReadOwners.delete(policyID);
            clearPolicyTagsLoadingState(policyID);
        },
    });

    useEffect(() => {
        if (!policyID) {
            return;
        }
        // Once the read's loading state is in Onyx, it guards every picker, so the pending entry is no longer needed
        if (isLoading || hasOnceLoaded) {
            pendingReadOwners.delete(policyID);
            return;
        }
        if (isOffline || !canReadTags || requestedPolicyIDRef.current === policyID || pendingReadOwners.has(policyID)) {
            return;
        }
        if (requestedPolicyIDRef.current && pendingReadOwners.get(requestedPolicyIDRef.current) === requestedPolicyIDRef) {
            pendingReadOwners.delete(requestedPolicyIDRef.current);
        }
        requestedPolicyIDRef.current = policyID;
        pendingReadOwners.set(policyID, requestedPolicyIDRef);
        openPolicyTagsPage(policyID);
    }, [policyID, canReadTags, isOffline, isLoading, hasOnceLoaded]);

    // A picker that unmounts before its read's loading state lands releases the entry, so it cannot block later pickers
    useEffect(() => {
        const ownerRef = requestedPolicyIDRef;
        return () => {
            const requestedPolicyID = ownerRef.current;
            if (!requestedPolicyID || pendingReadOwners.get(requestedPolicyID) !== ownerRef) {
                return;
            }
            pendingReadOwners.delete(requestedPolicyID);
        };
    }, []);

    // True only while the read is unsettled and there is nothing to render yet, so the picker shows a skeleton instead
    // of an empty list. The `policyID` and `canReadTags` checks mirror the effect's guard: when no read is ever
    // dispatched, the absent loading state would otherwise keep the skeleton up forever.
    const isLoadingPolicyTags = !!policyID && canReadTags && !isOffline && !hasOnceLoaded && !hasTags && (isLoading || loadingState === undefined);

    // Only a completed read guarantees the collection holds every tag list, so callers that rely on the full list count check this
    return {isLoadingPolicyTags, hasLoadedPolicyTags: hasOnceLoaded};
}

export default useLoadPolicyTags;
