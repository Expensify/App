import React, {useState} from 'react';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import {KEYS_TO_PRESERVE, setIsUsingImportedState} from '@libs/actions/App';
import {setShouldForceOffline} from '@libs/actions/Network';
import Navigation from '@libs/Navigation/Navigation';
import type {OnyxValues} from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseImportOnyxState from './BaseImportOnyxState';
import type ImportOnyxStateProps from './types';
import {cleanAndTransformState} from './utils';

const CHUNK_SIZE = 100;

function readFileInChunks(fileUri: string, chunkSize = 1024 * 1024) {
    const filePath = decodeURIComponent(fileUri.replace('file://', ''));

    return RNFS.exists(filePath)
        .then((exists) => {
            if (!exists) {
                throw new Error('File does not exist');
            }
            return RNFS.stat(filePath);
        })
        .then((fileStats) => {
            const fileSize = fileStats.size;
            let fileContent = '';
            const promises = [];

            // Chunk the file into smaller parts to avoid memory issues
            for (let i = 0; i < fileSize; i += chunkSize) {
                promises.push(RNFS.read(filePath, chunkSize, i, 'utf8').then((chunk) => chunk));
            }

            // After all chunks have been read, join them together
            return Promise.all(promises).then((chunks) => {
                fileContent = chunks.join('');

                return fileContent;
            });
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
    const entries = Object.entries(state);
    const chunks = chunkArray(entries, CHUNK_SIZE);

    let promise = Promise.resolve();
    chunks.forEach((chunk) => {
        const partialOnyxState = Object.fromEntries(chunk) as Partial<OnyxValues>;
        promise = promise.then(() => Onyx.multiSet(partialOnyxState));
    });

    return promise;
}

export default function ImportOnyxState({setIsLoading, isLoading}: ImportOnyxStateProps) {
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

    const handleFileRead = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        setIsLoading(true);
        readFileInChunks(file.uri)
            .then((fileContent) => {
                const transformedState = cleanAndTransformState<OnyxValues>(fileContent);
                setShouldForceOffline(true);
                Onyx.clear(KEYS_TO_PRESERVE).then(() => {
                    applyStateInChunks(transformedState).then(() => {
                        setIsUsingImportedState(true);
                        Navigation.navigate(ROUTES.HOME);
                    });
                });
            })
            .catch(() => {
                setIsErrorModalVisible(true);
            })
            .finally(() => {
                setIsLoading(false);
            });

        if (isLoading) {
            setIsLoading(false);
        }
    };

    return (
        <BaseImportOnyxState
            onFileRead={handleFileRead}
            isErrorModalVisible={isErrorModalVisible}
            setIsErrorModalVisible={setIsErrorModalVisible}
        />
    );
}
