import lodashGet from 'lodash/get';
import React, {useState} from 'react';
import Onyx, {useOnyx} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import {KEYS_TO_PRESERVE, setIsUsingImportedState, setPreservedUserSession} from '@libs/actions/App';
import {setShouldForceOffline} from '@libs/actions/Network';
import Navigation from '@libs/Navigation/Navigation';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseImportOnyxState from './BaseImportOnyxState';
import type ImportOnyxStateProps from './types';
import {cleanAndTransformState} from './utils';

export default function ImportOnyxState({setIsLoading}: ImportOnyxStateProps) {
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const processStateImport = (transformedState: OnyxValues) => {
        console.time('Processing state import');

        const collectionKeys = new Set(Object.values(ONYXKEYS.COLLECTION || {}));
        // Use Map for better performance with large datasets
        const collectionsMap = new Map<string, Record<string, unknown>>();
        const regularState: Partial<OnyxValues> = {};

        console.time('Grouping collections');
        Object.entries(transformedState).forEach(([key, value]) => {
            const baseKey = key.split('_').at(0);
            const collectionKey = `${baseKey}_`;

            if (collectionKeys.has(collectionKey)) {
                if (!collectionsMap.has(collectionKey)) {
                    collectionsMap.set(collectionKey, {});
                }
                // Add to existing collection group
                const collection = collectionsMap.get(collectionKey)!;
                collection[key] = value;
            } else {
                regularState[key as keyof OnyxValues] = value;
            }
        });
        console.timeEnd('Grouping collections');

        return Onyx.clear(KEYS_TO_PRESERVE)
            .then(() => {
                console.time('Collections processing');
                const collectionPromises = Array.from(collectionsMap.entries()).map(([baseKey, items]) => {
                    console.log(`Setting collection ${baseKey} with ${Object.keys(items).length} items`);
                    return Onyx.setCollection(baseKey, items);
                });
                return Promise.all(collectionPromises);
            })
            .then(() => {
                console.timeEnd('Collections processing');
                console.time('Regular keys processing');

                if (Object.keys(regularState).length > 0) {
                    return Onyx.multiSet(regularState);
                }
                return Promise.resolve();
            })
            .then(() => {
                console.timeEnd('Regular keys processing');
                console.timeEnd('Processing state import');
            });
    };

    const handleFileRead = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        console.time('Total import operation');
        setIsLoading(true);

        console.time('File processing');
        const blob = new Blob([file as BlobPart]);
        const response = new Response(blob);

        response
            .text()
            .then((text) => {
                console.timeEnd('File processing');
                const fileContent = text;

                console.time('State transformation');
                const transformedState = cleanAndTransformState<OnyxValues>(fileContent);
                console.timeEnd('State transformation');

                console.time('Session handling');
                const currentUserSessionCopy = {...session};
                setPreservedUserSession(currentUserSessionCopy);
                setShouldForceOffline(true);
                console.timeEnd('Session handling');

                return processStateImport(transformedState);
            })
            .then(() => {
                setIsUsingImportedState(true);
                Navigation.navigate(ROUTES.HOME);
                console.timeEnd('Total import operation');
            })
            .catch((error) => {
                console.error('Error importing state:', error);
                setIsErrorModalVisible(true);
                setIsLoading(false);
                console.timeEnd('Total import operation');
            });
    };

    return (
        <BaseImportOnyxState
            onFileRead={handleFileRead}
            isErrorModalVisible={isErrorModalVisible}
            setIsErrorModalVisible={setIsErrorModalVisible}
        />
    );
}
