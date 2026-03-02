import type {OnyxKey} from 'react-native-onyx';
import type {AnyOnyxUpdatesFromServer, OnyxUpdatesFromServer} from '@src/types/onyx';

/**
 * Maps last update IDs to their corresponding Onyx server updates, allowing multiple updates to be enqueued simultaneously
 *
 * This type was created as a solution during the migration away from the large OnyxKey union and is useful for contexts where the specific Onyx keys are not known ahead of time.
 * It should only be used in legacy code where providing exact key types would require major restructuring.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDeferredUpdatesDictionary = Record<number, AnyOnyxUpdatesFromServer>;

/** Maps last update IDs to their corresponding Onyx server updates, allowing multiple updates to be enqueued simultaneously */
type DeferredUpdatesDictionary<TKey extends OnyxKey> = Record<number, OnyxUpdatesFromServer<TKey>>;

type AnyDetectGapAndSplitResult = {
    applicableUpdates: AnyDeferredUpdatesDictionary;
    updatesAfterGaps: AnyDeferredUpdatesDictionary;
    latestMissingUpdateID: number | undefined;
};

export type {DeferredUpdatesDictionary, AnyDetectGapAndSplitResult, AnyDeferredUpdatesDictionary};
