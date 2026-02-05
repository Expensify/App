import type {OnyxKey} from 'react-native-onyx';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

type DeferredUpdatesDictionary<TKey extends OnyxKey = OnyxKey> = Record<number, OnyxUpdatesFromServer<TKey>>;

type DetectGapAndSplitResult = {applicableUpdates: DeferredUpdatesDictionary; updatesAfterGaps: DeferredUpdatesDictionary; latestMissingUpdateID: number | undefined};

export type {DeferredUpdatesDictionary, DetectGapAndSplitResult};
