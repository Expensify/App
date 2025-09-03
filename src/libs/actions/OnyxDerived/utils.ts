import Onyx from 'react-native-onyx';
import type {OnyxInput} from 'react-native-onyx';
import type {NonEmptyTuple} from 'type-fest';
import Log from '@libs/Log';
import type {OnyxDerivedKey, OnyxKey} from '@src/ONYXKEYS';
import type {DerivedValueContext} from './types';

/**
 * Check if a specific key exists in sourceValue from OnyxDerived
 */
const hasKeyTriggeredCompute = <K extends OnyxKey, Deps extends NonEmptyTuple<Exclude<OnyxKey, K>>>(key: K, sourceValues: DerivedValueContext<K, Deps>['sourceValues']) => {
    if (!sourceValues) {
        return false;
    }
    return Object.keys(sourceValues).some((sourceKey) => sourceKey === key);
};

const batchedUpdatesQueue = new Map<OnyxDerivedKey, OnyxInput<OnyxDerivedKey>>();
let isFlushScheduled = false;
let batchStartTime: number | null = null;

const flushBatchedUpdatesNow = () => {
    if (batchedUpdatesQueue.size === 0) {
        return;
    }

    const updates = Array.from(batchedUpdatesQueue.entries());
    const batchSize = updates.length;
    const processingTime = batchStartTime ? performance.now() - batchStartTime : 0;

    Log.info(`[OnyxDerived] Flushing batch of ${batchSize} derived value updates (queued for ${processingTime.toFixed(2)}ms)`);

    batchedUpdatesQueue.clear();
    isFlushScheduled = false;
    batchStartTime = null;
    // Apply all updates synchronously
    updates.forEach(([key, value]) => {
        Onyx.set(key, value, {
            skipCacheCheck: true,
        });
    });
};

/**
 * Schedule a flush using setTimeout(0) for better batching of synchronous updates
 */
const scheduleFlush = () => {
    if (isFlushScheduled) {
        return;
    }

    isFlushScheduled = true;
    setTimeout(flushBatchedUpdatesNow, 0);
};

/**
 * Set a derived value in Onyx
 * As a performance optimization, it skips the cache check and null removal
 * For derived values, we fully control their lifecycle and recompute them when any dependency changes - so we don’t need a deep comparison
 * Also, null may be a legitimate result of the computation, so pruning it is unnecessary
 */
const setDerivedValue = (key: OnyxDerivedKey, value: OnyxInput<OnyxDerivedKey>) => {
    // Mark the start time for this batch if it's the first update
    if (batchedUpdatesQueue.size === 0) {
        batchStartTime = performance.now();
    }

    // Add or update the value in the batch queue (automatically deduplicates)
    batchedUpdatesQueue.set(key, value);

    // Schedule the batch to be flushed using setTimeout(0) for better synchronous batching
    scheduleFlush();
};

export {hasKeyTriggeredCompute, setDerivedValue};
