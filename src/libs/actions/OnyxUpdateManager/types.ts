import type {OnyxUpdatesFromServer} from '@src/types/onyx';

type DeferredUpdatesDictionary = Record<number, OnyxUpdatesFromServer>;

type DetectGapAndSplitResult = {applicableUpdates: DeferredUpdatesDictionary; updatesAfterGaps: DeferredUpdatesDictionary; latestMissingUpdateID: number | undefined};

export type {DeferredUpdatesDictionary, DetectGapAndSplitResult};
