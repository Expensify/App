import React from 'react';
import Onyx from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentPicker from '@components/AttachmentPicker';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {KEYS_TO_PRESERVE, setIsUsingImportedState} from '@libs/actions/App';
import {setShouldForceOffline} from '@libs/actions/Network';
import Navigation from '@libs/Navigation/Navigation';
import type {OnyxValues} from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {cleanAndTransformState} from './utils';

export default function OnyxStateImport({setIsLoading}: {setIsLoading: (isLoading: boolean) => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleFileRead = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        const blob = new Blob([file as BlobPart]);
        const response = new Response(blob);

        response.text().then((text) => {
            setIsLoading(true);
            const fileContent = text;
            const transformedState = cleanAndTransformState<OnyxValues>(fileContent);
            setShouldForceOffline(true);
            Onyx.clear(KEYS_TO_PRESERVE).then(() => {
                Onyx.multiSet(transformedState)
                    .then(() => {
                        setIsUsingImportedState(true);
                        Navigation.navigate(ROUTES.HOME);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            });
        });
    };

    return (
        <AttachmentPicker acceptedFileTypes={['text']}>
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
