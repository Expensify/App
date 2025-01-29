import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import {setIsUsingImportedState, setPreservedUserSession} from '@libs/actions/App';
import {setShouldForceOffline} from '@libs/actions/Network';
import Navigation from '@libs/Navigation/Navigation';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseImportOnyxState from './BaseImportOnyxState';
import type ImportOnyxStateProps from './types';
import {cleanAndTransformState, processStateImport} from './utils';

export default function ImportOnyxState({setIsLoading}: ImportOnyxStateProps) {
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const handleFileRead = (file: FileObject) => {
        if (!file.uri) {
            return;
        }

        setIsLoading(true);

        const blob = new Blob([file as BlobPart]);
        const response = new Response(blob);

        response
            .text()
            .then((text) => {
                const fileContent = text;

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
            .catch((error) => {
                console.error('Error importing state:', error);
                setIsErrorModalVisible(true);
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
