import React, {useState} from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util';
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

const CHUNK_SIZE = 100;

function readOnyxFile(fileUri: string) {
    const filePath = decodeURIComponent(fileUri.replace('file://', ''));

    return ReactNativeBlobUtil.fs.exists(filePath).then((exists) => {
        if (!exists) {
            throw new Error('File does not exist');
        }
        console.timeEnd('Read Onyx file');
        return ReactNativeBlobUtil.fs.readFile(filePath, 'utf8');
    });
}

function chunkArray<T>(array: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

function applyStateInChunks(state: OnyxValues) {
    console.time('applyStateInChunks');
    const entries = Object.entries(state);
    const chunks = chunkArray(entries, CHUNK_SIZE);

    let promise = Promise.resolve();
    chunks.forEach((chunk) => {
        const partialOnyxState = Object.fromEntries(chunk) as Partial<OnyxValues>;
        promise = promise.then(() => Onyx.multiSet(partialOnyxState));
    });
    console.timeEnd('applyStateInChunks');
    return promise;
}

export default function ImportOnyxState({setIsLoading}: ImportOnyxStateProps) {
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const handleFileRead = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        setIsLoading(true);
        console.time('Read Onyx file');
        readOnyxFile(file.uri)
            .then((fileContent: string) => {
                console.time('Clean and transform state');
                const transformedState = cleanAndTransformState<OnyxValues>(fileContent);
                console.timeEnd('Clean and transform state');
                console.time('current user session copy');
                const currentUserSessionCopy = {...session};
                console.timeEnd('current user session copy');
                setPreservedUserSession(currentUserSessionCopy);
                setShouldForceOffline(true);
                console.time('Onyx clear and apply in chunks');
                Onyx.clear(KEYS_TO_PRESERVE).then(() => {
                    applyStateInChunks(transformedState).then(() => {
                        setIsUsingImportedState(true);
                        Navigation.navigate(ROUTES.HOME);
                    });
                });
                console.timeEnd('Onyx clear and apply in chunks');
            })
            .catch(() => {
                setIsErrorModalVisible(true);
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
