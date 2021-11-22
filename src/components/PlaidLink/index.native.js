import {useEffect} from 'react';
import {openLink, useDeepLinkRedirector, usePlaidEmitter} from 'react-native-plaid-link-sdk';
import Log from '../../libs/Log';
import CONST from '../../CONST';
import {plaidLinkPropTypes, plaidLinkDefaultProps} from './plaidLinkPropTypes';


const PlaidLink = (props) => {
    useDeepLinkRedirector();
    usePlaidEmitter((event) => {
        Log.info('[PlaidLink] Handled Plaid Event: ', false, event);
        if (event.eventName === CONST.PLAID.EVENT.ERROR) {
            props.onError(event.metadata);
        } else if (event.eventName === CONST.PLAID.EVENT.EXIT) {
            props.onExit();
        }
    });
    useEffect(() => {
        openLink({
            tokenConfig: {
                token: props.token,
            },
            onSuccess: ({publicToken, metadata}) => {
                props.onSuccess({publicToken, metadata});
            },
        });
    }, []);

    return null;
};

PlaidLink.propTypes = plaidLinkPropTypes;
PlaidLink.defaultProps = plaidLinkDefaultProps;
export default PlaidLink;
