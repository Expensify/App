import React from 'react';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

// List of Onyx keys from the .txt file we want to omit for the local override
const keysToOmit = [ONYXKEYS.ACTIVE_CLIENTS, ONYXKEYS.BETAS, ONYXKEYS.FREQUENTLY_USED_EMOJIS, ONYXKEYS.NETWORK];

function transformNumericKeysToArray(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    // Check if all keys are numeric and sequential starting from 0
    const keys = Object.keys(obj);
    const allKeysAreNumeric = keys.every((key) => !isNaN(key));
    const keysAreSequential = keys.every((key, index) => parseInt(key) === index);

    if (allKeysAreNumeric && keysAreSequential) {
        // Convert object to array
        return keys.map((key) => transformNumericKeysToArray(obj[key]));
    }

    // Recursively apply transformation to each property
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            obj[key] = transformNumericKeysToArray(obj[key]);
        }
    }

    return obj;
}
export default function OnyxStateImport({setIsLoading}: {setIsLoading: (isLoading: boolean) => void}) {
    const {translate} = useLocalize();
    return (
        <AttachmentPicker>
            {({openPicker}) => {
                return (
                    <Button
                        text={translate('initialSettingsPage.troubleshoot.importOnyxState')}
                        onPress={() => {
                            // TODO should directly use 'react-native-document-picker'
                            openPicker({
                                onPicked: (file) => {
                                    if (!file.uri) {
                                        return;
                                    }

                                    // 1. Read the file content
                                    RNFS.readFile(file.uri).then((fileContent) => {
                                        setIsLoading(true);
                                        const importedState = JSON.parse(fileContent);
                                        // TODO: this needs to be exactly the same as we get from running the App.openApp command?
                                        const parsedState = {...importedState};

                                        // 2. Only keep the keys that we're interested in
                                        Object.keys(parsedState).forEach((key) => {
                                            const shouldOmit = keysToOmit.some((onyxKey) => key.startsWith(onyxKey));

                                            if (shouldOmit) {
                                                delete parsedState[key];
                                            }
                                        });

                                        const t = transformNumericKeysToArray(parsedState);
                                        // 3. Go offline
                                        Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true}).then(() => {
                                            // Onyx.clear(App.KEYS_TO_PRESERVE).then(() => {

                                            // 4. Apply the new state from the file
                                            Onyx.multiSet(t)
                                                .then(() => {
                                                    console.log('Applied imported state.');
                                                    Navigation.navigate(ROUTES.HOME);
                                                })
                                                .finally(() => {
                                                    setIsLoading(false);
                                                });
                                            // });
                                        });
                                    });
                                },
                            });
                        }}
                    />
                );
            }}
        </AttachmentPicker>
    );
}
