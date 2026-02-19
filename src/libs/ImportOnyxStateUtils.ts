import cloneDeep from 'lodash/cloneDeep';
import type {OnyxEntry, OnyxKey} from 'react-native-onyx';
import type {UnknownRecord} from 'type-fest';
import type {OnyxCollectionKey, OnyxCollectionValuesMapping} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxState from '@src/types/onyx/OnyxState';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import {clearOnyxStateBeforeImport, importOnyxCollectionState, importOnyxRegularState} from './actions/ImportOnyxState';

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

    for (const key of Object.keys(parsedState)) {
        const shouldOmit = keysToOmit.some((onyxKey) => key.startsWith(onyxKey));

        if (shouldOmit) {
            delete parsedState[key];
        }
    }

    const transformedState = transformNumericKeysToArray(parsedState) as T;
    return transformedState;
}

function importState(transformedState: OnyxState): Promise<void> {
    const collectionKeys = [...new Set(Object.values(ONYXKEYS.COLLECTION))];
    const collectionsMap = new Map<keyof OnyxCollectionValuesMapping, CollectionDataSet<OnyxCollectionKey>>();
    const regularState: Partial<Record<OnyxKey, OnyxEntry<OnyxKey>>> = {};

    for (const [entryKey, entryValue] of Object.entries(transformedState)) {
        const key = entryKey as OnyxKey;
        const value = entryValue as NonNullable<OnyxEntry<OnyxKey>>;

        const collectionKey = collectionKeys.find((cKey) => key.startsWith(cKey));
        if (collectionKey) {
            if (!collectionsMap.has(collectionKey)) {
                collectionsMap.set(collectionKey, {});
            }

            const collection = collectionsMap.get(collectionKey);
            if (!collection) {
                continue;
            }

            collection[key as OnyxCollectionKey] = value;
        } else {
            regularState[key] = value;
        }
    }

    return clearOnyxStateBeforeImport()
        .then(() => importOnyxCollectionState(collectionsMap))
        .then(() => importOnyxRegularState(regularState));
}

export {cleanAndTransformState, importState, transformNumericKeysToArray};
