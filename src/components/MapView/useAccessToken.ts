import {setAccessToken} from '@rnmapbox/maps';
import {useEffect, useState} from 'react';

type UseAccessTokenProps = {
    accessToken: string;
};

function useAccessToken({accessToken}: UseAccessTokenProps) {
    const [isAccessTokenSet, setIsAccessTokenSet] = useState(false);

    useEffect(() => {
        setAccessToken(accessToken).then((token) => {
            if (!token) {
                return;
            }
            setIsAccessTokenSet(true);
        });
    }, [accessToken]);

    return isAccessTokenSet;
}

export default useAccessToken;
