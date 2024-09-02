import React, {useState} from 'react';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import AttachmentPicker from '@components/AttachmentPicker';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {KEYS_TO_PRESERVE} from '@libs/actions/App';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

// List of Onyx keys from the .txt file we want to omit for the local override
const keysToOmit = [ONYXKEYS.ACTIVE_CLIENTS, ONYXKEYS.BETAS, ONYXKEYS.FREQUENTLY_USED_EMOJIS, ONYXKEYS.NETWORK, ONYXKEYS.CREDENTIALS, ONYXKEYS.SESSION];

function transformNumericKeysToArray(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(transformNumericKeysToArray);
    }

    const keys = Object.keys(obj);
    const length = keys.length;
    let allKeysAreNumericAndSequential = true;

    for (let i = 0; i < length; i++) {
        const key = keys[i];
        if (parseInt(key, 10) !== i) {
            allKeysAreNumericAndSequential = false;
            break;
        }
    }

    if (allKeysAreNumericAndSequential) {
        return keys.map((key) => transformNumericKeysToArray(obj[key]));
    }

    for (const key of keys) {
        obj[key] = transformNumericKeysToArray(obj[key]);
    }

    return obj;
}

function readFileInChunks(fileUri: string, chunkSize = 1024 * 1024) {
    console.log('File URI:', fileUri); // Log the file URI
    const filePath = decodeURIComponent(fileUri.replace('file://', ''));
    // Check if the file exists
    return RNFS.exists(filePath)
        .then((exists) => {
            if (!exists) {
                throw new Error('File does not exist');
            }
            console.log('File exists:', exists);
            return RNFS.stat(filePath);
        })
        .then((fileStats) => {
            console.log('File stats:', fileStats);
            const fileSize = fileStats.size;
            let fileContent = '';
            const promises = [];

            console.log('Start chunking');
            for (let i = 0; i < fileSize; i += chunkSize) {
                promises.push(
                    RNFS.read(filePath, chunkSize, i, 'utf8').then((chunk) => {
                        fileContent += chunk;
                    }),
                );
            }
            console.log('end chunking');

            return Promise.all(promises).then(() => fileContent);
        })
        .catch((error) => {
            console.error('Error reading file:', error);
            throw error;
        });
}

const CHUNK_SIZE = 100; // Adjust the chunk size based on your needs

function chunkArray<T>(array: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

function applyStateInChunks(state: Record<string, unknown>) {
    const entries = Object.entries(state);
    const chunks = chunkArray(entries, CHUNK_SIZE);

    let promise = Promise.resolve();
    chunks.forEach((chunk) => {
        promise = promise.then(() => Onyx.multiSet(Object.fromEntries(chunk)));
    });

    return promise;
}

export default function OnyxStateImport({setIsLoading}: {setIsLoading: (isLoading: boolean) => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [, setError] = useState(null);

    const handleFileRead = (fileUri: string) => {
        console.log('File URI:', fileUri); // Log the file URI
        setIsLoading(true);
        readFileInChunks(fileUri)
            .then((fileContent) => {
                const importedState = JSON.parse(fileContent);
                console.log('Parse imported state');
                const transformedState = transformNumericKeysToArray(importedState);
                console.log('Transformed state:');
                // Only keep the keys that we're interested in
                Object.keys(transformedState).forEach((key) => {
                    const shouldOmit = keysToOmit.some((onyxKey) => key.startsWith(onyxKey));
                    if (shouldOmit) {
                        delete transformedState[key];
                    }
                });
                console.log('Omgitted keys');

                Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true}).then(() => {
                    Onyx.clear(KEYS_TO_PRESERVE).then(() => {
                        // 4. Apply the new state from the file
                        applyStateInChunks(transformedState).then(() => {
                            setIsLoading(false);
                            console.log('Applied imported state.');
                            Navigation.navigate(ROUTES.HOME);
                        });
                    });
                });
            })
            .catch((err) => {
                setError(err.message);
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
                            // TODO should directly use 'react-native-document-picker'
                            openPicker({
                                onPicked: (file) => {
                                    if (!file.uri) {
                                        return;
                                    }

                                    handleFileRead(file.uri);
                                },
                            });
                        }}
                    />
                );
            }}
        </AttachmentPicker>
    );
}
