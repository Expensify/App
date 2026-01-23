import React from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util';
import useDecisionModal from '@hooks/useDecisionModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setIsUsingImportedState, setPreservedUserSession} from '@libs/actions/App';
import {setShouldForceOffline} from '@libs/actions/Network';
import {rollbackOngoingRequest} from '@libs/actions/PersistedRequests';
import {cleanAndTransformState, importState} from '@libs/ImportOnyxStateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';
import BaseImportOnyxState from './BaseImportOnyxState';
import type ImportOnyxStateProps from './types';

function readOnyxFile(fileUri: string) {
    const filePath = decodeURIComponent(fileUri.replace('file://', ''));

    return ReactNativeBlobUtil.fs.exists(filePath).then((exists) => {
        if (!exists) {
            throw new Error('File does not exist');
        }
        return ReactNativeBlobUtil.fs.readFile(filePath, 'utf8');
    });
}

export default function ImportOnyxState({setIsLoading}: ImportOnyxStateProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const {showDecisionModal} = useDecisionModal();
    const {translate} = useLocalize();

    const handleFileRead = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        setIsLoading(true);
        readOnyxFile(file.uri)
            .then((fileContent: string) => {
                rollbackOngoingRequest();
                const transformedState = cleanAndTransformState<OnyxValues>(fileContent);
                const currentUserSessionCopy = {...session};
                setPreservedUserSession(currentUserSessionCopy);
                setShouldForceOffline(true);
                return importState(transformedState);
            })
            .then(() => {
                setIsUsingImportedState(true);
                Navigation.navigate(ROUTES.HOME);
            })
            .catch((error) => {
                console.error('Error importing state:', error);
                showDecisionModal({
                    title: translate('initialSettingsPage.troubleshoot.invalidFile'),
                    prompt: translate('initialSettingsPage.troubleshoot.invalidFileDescription'),
                    secondOptionText: translate('common.ok'),
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return <BaseImportOnyxState onFileRead={handleFileRead} />;
}
