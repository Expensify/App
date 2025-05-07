import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {AppState} from 'react-native';
import type {AppStateStatus} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import {getContactPermission} from '@libs/ContactPermission';

type UseAppStateContactPermissionHandlerProps = {
    importAndSaveContacts: () => void;
    setContacts: (contacts: never[]) => void;
    contactPermissionState: PermissionStatus;
    setContactPermissionState: (status: PermissionStatus) => void;
};

function useAppStateContactPermissionHandler({importAndSaveContacts, setContacts, contactPermissionState, setContactPermissionState}: UseAppStateContactPermissionHandlerProps): void {
    const checkPermissionAndReact = useCallback(() => {
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
                // eslint-disable-next-line no-console
                console.error('Failed to check contact permission:', error);
            });
    }, [contactPermissionState, importAndSaveContacts, setContacts, setContactPermissionState]);

    useFocusEffect(
        useCallback(() => {
            checkPermissionAndReact();
        }, [checkPermissionAndReact]),
    );

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState !== 'active') {
                return;
            }

            checkPermissionAndReact();
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [checkPermissionAndReact]);
}

export default useAppStateContactPermissionHandler;
