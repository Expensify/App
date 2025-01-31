import React, {useState} from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {useOnyx} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import {setIsUsingImportedState, setPreservedUserSession} from '@libs/actions/App';
import {setShouldForceOffline} from '@libs/actions/Network';
import {rollbackOngoingRequest} from '@libs/actions/PersistedRequests';
import Navigation from '@libs/Navigation/Navigation';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseImportOnyxState from './BaseImportOnyxState';
import type ImportOnyxStateProps from './types';
import {cleanAndTransformState, processStateImport} from './utils';

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
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const handleFileRead = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        rollbackOngoingRequest();
        setIsLoading(true);
        readOnyxFile(file.uri)
            .then((fileContent: string) => {
                const transformedState = cleanAndTransformState<OnyxValues>(fileContent);
                const currentUserSessionCopy = {...session};
                setPreservedUserSession(currentUserSessionCopy);
                setShouldForceOffline(true);
                return processStateImport(transformedState);
            })
            .then(() => {
                setIsUsingImportedState(true);
                Navigation.navigate(ROUTES.HOME);
            })
            .catch(() => {
                setIsErrorModalVisible(true);
            })
            .finally(() => {
                setIsLoading(false);
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
