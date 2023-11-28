import {useCallback, useEffect, useState} from 'react';
import {PlaidLinkOnSuccessMetadata, usePlaidLink} from 'react-plaid-link';
import Log from '@libs/Log';
import PlaidLinkProps from './types';

function PlaidLink({token, onSuccess = () => {}, onError = () => {}, onExit = () => {}, onEvent, receivedRedirectURI}: PlaidLinkProps) {
    const [isPlaidLoaded, setIsPlaidLoaded] = useState(false);
    const successCallback = useCallback(
        (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
            onSuccess({publicToken, metadata});
        },
        [onSuccess],
    );

    const {open, ready, error} = usePlaidLink({
        token,
        onSuccess: successCallback,
        onExit: (exitError, metadata) => {
            Log.info('[PlaidLink] Exit: ', false, {exitError, metadata});
            onExit();
        },
        onEvent: (event, metadata) => {
            Log.info('[PlaidLink] Event: ', false, {event, metadata});
            onEvent(event, metadata);
        },
        onLoad: () => setIsPlaidLoaded(true),

        // The redirect URI with an OAuth state ID. Needed to re-initialize the PlaidLink after directing the
        // user to their respective bank platform
        receivedRedirectUri: receivedRedirectURI,
    });

    useEffect(() => {
        if (error) {
            onError(error);
            return;
        }

        if (!ready) {
            return;
        }

        if (!isPlaidLoaded) {
            return;
        }

        open();
    }, [ready, error, isPlaidLoaded, open, onError]);

    return null;
}

PlaidLink.displayName = 'PlaidLink';
export default PlaidLink;
