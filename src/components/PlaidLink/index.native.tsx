import {useEffect, useState} from 'react';
import {NativeModules} from 'react-native';
import type {LinkEvent} from 'react-native-plaid-link-sdk';
import {dismissLink, openLink, usePlaidEmitter} from 'react-native-plaid-link-sdk';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type PlaidLinkProps from './types';

const {AppStateTracker} = NativeModules;

function PlaidLink({token, onSuccess = () => {}, onExit = () => {}, onEvent}: PlaidLinkProps) {
    const [plaidLinkStarted, setPlaidLinkStarted] = useState(false);
    usePlaidEmitter((event: LinkEvent) => {
        Log.info('[PlaidLink] Handled Plaid Event: ', false, {...event});
        onEvent(event.eventName, event.metadata);
    });
    useEffect(() => {
        if (plaidLinkStarted) {
            return;
        }
        setPlaidLinkStarted(true);

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

                if (getPlatform() === CONST.PLATFORM.ANDROID) {
                    AppStateTracker.getWasAppRelaunchedFromIcon().then((wasAppRelaunchedFromIcon) => {
                        if (wasAppRelaunchedFromIcon) {
                            setPlaidLinkStarted(false);
                            return;
                        }
                        onExit();
                    });
                    return;
                }

                onExit();
            },
        });

        return () => {
            dismissLink();
        };

        // We generally do not need to include the token as a dependency here as it is only provided once via props and should not change
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [plaidLinkStarted]);
    return null;
}

PlaidLink.displayName = 'PlaidLink';

export default PlaidLink;
