import {useEffect} from 'react';
import {dismissLink, LinkEvent, openLink, useDeepLinkRedirector, usePlaidEmitter} from 'react-native-plaid-link-sdk';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import PlaidLinkProps from './types';

function PlaidLink({token, onSuccess = () => {}, onExit = () => {}, onEvent}: PlaidLinkProps) {
    useDeepLinkRedirector();
    usePlaidEmitter((event: LinkEvent) => {
        Log.info('[PlaidLink] Handled Plaid Event: ', false, {...event});
        onEvent(event.eventName, event.metadata);
    });
    useEffect(() => {
        onEvent(CONST.BANK_ACCOUNT.PLAID.EVENTS_NAME.OPEN);
        openLink({
            tokenConfig: {
                token,
                noLoadingState: false,
            },
            onSuccess: ({publicToken, metadata}) => {
                onSuccess({publicToken, metadata});
            },
            onExit: ({error, metadata}) => {
                Log.info('[PlaidLink] Exit: ', false, {error, metadata});
                onExit();
            },
        });

        return () => {
            dismissLink();
        };

        // We generally do not need to include the token as a dependency here as it is only provided once via props and should not change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}

PlaidLink.displayName = 'PlaidLink';

export default PlaidLink;
