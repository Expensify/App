import useNetwork from '@hooks/useNetwork';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import {useState} from 'react';

/** Tracks whether the avatar's remote image failed to load, resetting the error state on network reconnect or source change. */
function useAvatarLoadError(originalSource?: AvatarSource) {
    const [errorSource, setErrorSource] = useState<AvatarSource | undefined>();
    const hasImageError = errorSource !== undefined && errorSource === originalSource;

    useNetwork({onReconnect: () => setErrorSource(undefined)});

    const onImageError = () => {
        setErrorSource(originalSource);
    };

    return {hasImageError, onImageError};
}

export default useAvatarLoadError;
