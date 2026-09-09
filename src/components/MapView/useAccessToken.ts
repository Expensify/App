import {setAccessToken} from '@rnmapbox/maps';
import {useEffect, useState} from 'react';

type UseAccessTokenProps = {
    accessToken: string;
};

function useAccessToken({accessToken}: UseAccessTokenProps) {
    const [hasSetAccessToken, setHasSetAccessToken] = useState(false);

    useEffect(() => {
        // Never call `setAccessToken('')` for a cleared/empty token. The Mapbox token lives in a single
        // per-process native global (`MapboxOptions.accessToken`) whose native setter only null-guards
        // (`accessToken?.let`), so an empty string would clobber that global with "". A native MapView
        // (re)constructed while the global is blank then throws (Sentry APP-HTR:
        // MapboxConfigurationException from MapView.<init>). Skipping the call keeps the last valid token.
        if (!accessToken) {
            return;
        }

        let ignore = false;
        setAccessToken(accessToken).then((token) => {
            if (ignore || !token) {
                return;
            }
            setHasSetAccessToken(true);
        });

        return () => {
            ignore = true;
        };
    }, [accessToken]);

    // Gate the map on the current token being present, not just on "a token was set once". When the token
    // is cleared at runtime (expiry/refresh, app-foreground, reconnect) `accessToken` becomes '', so this
    // returns false and consumers fall back to PendingMapView instead of leaving a map mounted / letting a
    // fresh native MapView be constructed while the token is blank.
    return hasSetAccessToken && !!accessToken;
}

export default useAccessToken;
