import React, {useEffect} from 'react';
import {AppState} from 'react-native';
import {openApp} from '@libs/actions/App';
import {setIsOpenAppFailureModalOpen} from '@libs/actions/isOpenAppFailureModalOpen';
import BaseOpenAppFailureModal from './BaseOpenAppFailureModal';

/** Triggers OpenApp reconnection */
const retryOpenApp = () => {
    setIsOpenAppFailureModalOpen(false);
    openApp();
};

function OpenAppFailureModal() {
    useEffect(() => {
        // Close OpenAppFailureModal if app goes inactive
        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (!nextAppState.match(/inactive|background/)) {
                return;
            }

            setIsOpenAppFailureModalOpen(false);
        });

        return () => {
            appStateSubscription.remove();
        };
    }, []);

    return <BaseOpenAppFailureModal onRefreshAndTryAgainButtonPress={retryOpenApp} />;
}

export default OpenAppFailureModal;
