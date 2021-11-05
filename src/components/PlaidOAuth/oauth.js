import React, { useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
const OAuthLink = (callback, deps) => {
    // The Link token from the first Link initialization
    const linkToken = localStorage.getItem('link_token');
    const onSuccess = React.useCallback((public_token) => {
        // send public_token to server, retrieve access_token and item_id
        // return to "https://example.com" upon completion
    }, deps);
    const onExit = (err, metatdata) => {
        // handle error...
    };
    const config = {
        token: linkToken,
        receivedRedirectUri: window.location.href, //the redirect URI with an OAuth state ID parameter
        onSuccess,
        onExit,
};
    const { open, ready, error } = usePlaidLink(config);
    // automatically reinitialize Link
    useEffect(() => {
        if (ready) {
            open();
        }
    }, [ready, open]);
    return <></>;
};
export default OAuthLink;
