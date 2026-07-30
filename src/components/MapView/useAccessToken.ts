import {setAccessToken} from '@rnmapbox/maps';
import {useEffect, useState} from 'react';

type UseAccessTokenProps = {
    accessToken: string;
};

function useAccessToken({accessToken}: UseAccessTokenProps) {
    const [isAccessTokenSet, setIsAccessTokenSet] = useState(false);

    useEffect(() => {
        let ignore = false;
        setAccessToken(accessToken).then((token) => {
            if (ignore || !token) {
                return;
            }
            setIsAccessTokenSet(true);
        });

        return () => {
            ignore = true;
        };
    }, [accessToken]);

    return isAccessTokenSet;
}

export default useAccessToken;
