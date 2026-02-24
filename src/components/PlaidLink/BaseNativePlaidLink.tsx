import {useEffect} from 'react';
import {create, dismissLink, open, usePlaidEmitter} from 'react-native-plaid-link-sdk';
import type {LinkEvent} from 'react-native-plaid-link-sdk';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type PlaidLinkProps from './types';

function BaseNativePlaidLink({token, onSuccess = () => {}, onExit = () => {}, onEvent}: PlaidLinkProps) {
    usePlaidEmitter((event: LinkEvent) => {
        Log.info('[PlaidLink] Handled Plaid Event: ', false, {...event});
        onEvent(event.eventName, event.metadata);
    });
    useEffect(() => {
        onEvent(CONST.BANK_ACCOUNT.PLAID.EVENTS_NAME.OPEN);
        create({token, noLoadingState: false});
        open({
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

export default BaseNativePlaidLink;
