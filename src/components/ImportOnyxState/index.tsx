import React, {useState} from 'react';
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

export default function ImportOnyxState({setIsLoading, isLoading}: ImportOnyxStateProps) {
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

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
            })
            .catch(() => {
                setIsErrorModalVisible(true);
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
