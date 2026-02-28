import React from 'react';
import BaseOpenAppFailureModal from './BaseOpenAppFailureModal';

/** Reloads the app to trigger OpenApp reconnection */
const reloadApp = () => {
    window.location.reload();
};

function OpenAppFailureModal() {
    return <BaseOpenAppFailureModal onRefreshAndTryAgainButtonPress={reloadApp} />;
}

export default OpenAppFailureModal;
