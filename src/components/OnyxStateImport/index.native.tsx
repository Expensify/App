import React from 'react';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import type {UnknownRecord} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentPicker from '@components/AttachmentPicker';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {KEYS_TO_PRESERVE} from '@libs/actions/App';
import Navigation from '@libs/Navigation/Navigation';
import type {OnyxValues} from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {keysToOmit, transformNumericKeysToArray} from './utils';

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
        })
        .catch((error) => {
            throw error;
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

export default function OnyxStateImport({setIsLoading}: {setIsLoading: (isLoading: boolean) => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleFileRead = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        setIsLoading(true);
        readFileInChunks(file.uri)
            .then((fileContent) => {
                const importedState = JSON.parse(fileContent) as UnknownRecord;
                const transformedState = transformNumericKeysToArray(importedState) as OnyxValues;

                Object.keys(transformedState).forEach((key) => {
                    const shouldOmit = keysToOmit.some((onyxKey) => key.startsWith(onyxKey));

                    if (shouldOmit) {
                        delete transformedState[key as keyof OnyxValues];
                    }
                });

                Onyx.clear(KEYS_TO_PRESERVE).then(() => {
                    applyStateInChunks(transformedState).then(() => {
                        setIsLoading(false);
                        Navigation.navigate(ROUTES.HOME);
                    });
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <AttachmentPicker>
            {({openPicker}) => {
                return (
                    <MenuItem
                        icon={Expensicons.Upload}
                        title={translate('initialSettingsPage.troubleshoot.importOnyxState')}
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                        onPress={() => {
                            openPicker({
                                onPicked: handleFileRead,
                            });
                        }}
                    />
                );
            }}
        </AttachmentPicker>
    );
}
