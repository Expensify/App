import type {LinkEvent} from 'react-native-plaid-link-sdk';
import {dismissLink, openLink, usePlaidEmitter} from 'react-native-plaid-link-sdk';
import useEffectOnce from '@hooks/useEffectOnce';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type PlaidLinkProps from './types';

function PlaidLink({token, onSuccess = () => {}, onExit = () => {}, onEvent}: PlaidLinkProps) {
    usePlaidEmitter((event: LinkEvent) => {
        Log.info('[PlaidLink] Handled Plaid Event: ', false, {...event});
        onEvent(event.eventName, event.metadata);
    });
    useEffectOnce(() => {
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
    });
    return null;
}

PlaidLink.displayName = 'PlaidLink';

export default PlaidLink;
