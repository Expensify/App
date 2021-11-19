import {useEffect} from 'react';
import {NativeEventEmitter} from 'react-native';
import {openLink, useDeepLinkRedirector} from 'react-native-plaid-link-sdk';
import Log from '../../libs/Log';
import CONST from '../../CONST';
import nativeModule from './nativeModule';
import {plaidLinkPropTypes, plaidLinkDefaultProps} from './plaidLinkPropTypes';


const PlaidLink  = (props) => {
    let listener = undefined;
    useDeepLinkRedirector();
    useEffect(() => {
        const emitter = new NativeEventEmitter(nativeModule);
        listener = emitter.addListener('onEvent', (event) => {
            Log.info('[PlaidLink] Handled Plaid Event: ', false, event);
            if (event.eventName === CONST.PLAID.EVENT.ERROR) {
                props.onError(event.metadata);
            } else if (event.eventName === CONST.PLAID.EVENT.EXIT) {
                props.onExit();
            }
        });

        openLink({
            tokenConfig: {
                token: props.token,
            },
            onSuccess: ({publicToken, metadata}) => {
                props.onSuccess({publicToken, metadata});
            },
        });

        return () => {
            if (listener) {
                return;
            }

            listener.remove();
        }
    }, []);

    return null;
};

PlaidLink.propTypes = plaidLinkPropTypes;
PlaidLink.defaultProps = plaidLinkDefaultProps;
export default PlaidLink;
