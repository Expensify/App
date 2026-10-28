import useAppState from '@hooks/useAppState';

import type {AppStateStatus} from 'react-native';
import type {PermissionStatus} from 'react-native-permissions';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {RESULTS} from 'react-native-permissions';

import {getContactPermission} from './index';

type UseContactPermissionsProps = {
    importAndSaveContacts: () => void;
    setContacts: (contacts: never[]) => void;
    contactPermissionState: PermissionStatus;
    setContactPermissionState: (status: PermissionStatus) => void;
};

function useContactPermissions({importAndSaveContacts, setContacts, contactPermissionState, setContactPermissionState}: UseContactPermissionsProps): void {
    const checkPermissionAndUpdateContacts = () => {
        return getContactPermission()
            .then((newStatus) => {
                const isNewStatusGranted = newStatus === RESULTS.GRANTED || newStatus === RESULTS.LIMITED; // Permission is enabled, or just became enabled

                if (isNewStatusGranted) {
                    importAndSaveContacts();
                } else {
                    if (newStatus !== contactPermissionState) {
                        setContactPermissionState(newStatus);
                    }
                    setContacts([]);
                }
            })
            .catch((error) => {
                console.error('Failed to check contact permission:', error);
            });
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState !== 'active') {
            return;
        }

        checkPermissionAndUpdateContacts();
    };

    useAppState({onAppStateChange: handleAppStateChange});

    useFocusEffect(
        useCallback(() => {
            checkPermissionAndUpdateContacts();
        }, [checkPermissionAndUpdateContacts]),
    );
}

export default useContactPermissions;
