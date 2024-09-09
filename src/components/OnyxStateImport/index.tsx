import React from 'react';
import Onyx from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentPicker from '@components/AttachmentPicker';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {KEYS_TO_PRESERVE} from '@libs/actions/App';
import {setShouldForceOffline} from '@libs/actions/Network';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import transformNumericKeysToArray from './utils';

// List of Onyx keys from the .txt file we want to keep for the local override
const keysToOmit = [ONYXKEYS.ACTIVE_CLIENTS, ONYXKEYS.BETAS, ONYXKEYS.FREQUENTLY_USED_EMOJIS, ONYXKEYS.NETWORK, ONYXKEYS.CREDENTIALS, ONYXKEYS.SESSION];

export default function OnyxStateImport({setIsLoading}: {setIsLoading: (isLoading: boolean) => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const onExportFilePicked = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        const reader = new FileReader();

        reader.readAsText(file);

        reader.onload = (e) => {
            setIsLoading(true);
            const fileContent = e.target?.result as string;
            const importedState = JSON.parse(fileContent) as Record<string, unknown>;
            const parsedState = {...importedState};

            Object.keys(parsedState).forEach((key) => {
                const shouldOmit = keysToOmit.some((onyxKey) => key.startsWith(onyxKey));

                if (shouldOmit) {
                    delete parsedState[key];
                }
            });
            const cleanState = transformNumericKeysToArray(parsedState);
            setShouldForceOffline(true);
            Onyx.clear(KEYS_TO_PRESERVE).then(() => {
                Onyx.multiSet(cleanState)
                    .then(() => {
                        Navigation.navigate(ROUTES.HOME);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            });
        };
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
                                onPicked: onExportFilePicked,
                            });
                        }}
                    />
                );
            }}
        </AttachmentPicker>
    );
}
