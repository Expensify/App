import cloneDeep from 'lodash/cloneDeep';
import type {OnyxKey, OnyxMergeCollectionInput, OnyxValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {UnknownRecord, ValueOf} from 'type-fest';
import {KEYS_TO_PRESERVE} from '@libs/actions/App';
import type {OnyxCollectionKey, OnyxCollectionValuesMapping, OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';

// List of Onyx keys from the .txt file we want to keep for the local override
const keysToOmit = [ONYXKEYS.ACTIVE_CLIENTS, ONYXKEYS.FREQUENTLY_USED_EMOJIS, ONYXKEYS.NETWORK, ONYXKEYS.CREDENTIALS, ONYXKEYS.PREFERRED_THEME];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function transformNumericKeysToArray(data: UnknownRecord): UnknownRecord | unknown[] {
    const dataCopy = cloneDeep(data);
    if (!isRecord(dataCopy)) {
        return Array.isArray(dataCopy) ? (dataCopy as UnknownRecord[]).map(transformNumericKeysToArray) : dataCopy;
    }

    const keys = Object.keys(dataCopy);

    if (keys.length === 0) {
        return dataCopy;
    }
    const allKeysAreNumeric = keys.every((key) => !Number.isNaN(Number(key)));
    const keysAreSequential = keys.every((key, index) => parseInt(key, 10) === index);
    if (allKeysAreNumeric && keysAreSequential) {
        return keys.map((key) => transformNumericKeysToArray(dataCopy[key] as UnknownRecord));
    }

    for (const key in dataCopy) {
        if (key in dataCopy) {
            dataCopy[key] = transformNumericKeysToArray(dataCopy[key] as UnknownRecord);
        }
    }

    return dataCopy;
}

function cleanAndTransformState<T>(state: string): T {
    const parsedState = JSON.parse(state) as UnknownRecord;

    Object.keys(parsedState).forEach((key) => {
        const shouldOmit = keysToOmit.some((onyxKey) => key.startsWith(onyxKey));

        if (shouldOmit) {
            delete parsedState[key];
        }
    });

    const transformedState = transformNumericKeysToArray(parsedState) as T;
    return transformedState;
}

const processStateImport = (transformedState: OnyxValues) => {
    const collectionKeys = new Set(Object.values(ONYXKEYS.COLLECTION));
    const collectionsMap = new Map<keyof OnyxCollectionValuesMapping, ValueOf<OnyxValues>>();
    const regularState: Partial<OnyxValues> = {};

    Object.entries(transformedState).forEach(([key, value]) => {
        const baseKey = key.split('_').at(0);
        const collectionKey = `${baseKey}_` as OnyxCollectionKey;

        if (collectionKeys.has(collectionKey)) {
            if (!collectionsMap.has(collectionKey)) {
                collectionsMap.set(collectionKey, {});
            }
            const collection = collectionsMap.get(collectionKey);
            if (!collection) {
                return;
            }

            collection[key] = value;
        } else {
            regularState[key] = value;
        }
    });

    return Onyx.clear(KEYS_TO_PRESERVE)
        .then(() => {
            const collectionPromises = Array.from(collectionsMap.entries()).map(([baseKey, items]) => {
                return Onyx.setCollection(baseKey, items);
            });
            return Promise.all(collectionPromises);
        })
        .then(() => {
            if (Object.keys(regularState).length > 0) {
                return Onyx.multiSet(regularState);
            }
            return Promise.resolve();
        });
};

export {transformNumericKeysToArray, cleanAndTransformState, processStateImport};
