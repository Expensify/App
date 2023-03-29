import {useEffect, useRef} from 'react';
import {openLink, useDeepLinkRedirector, usePlaidEmitter} from 'react-native-plaid-link-sdk';
import Log from '../../libs/Log';
import CONST from '../../CONST';
import {plaidLinkPropTypes, plaidLinkDefaultProps} from './plaidLinkPropTypes';

const PlaidLink = (props) => {
    // We are stashing initial props in a ref since we don't want a new token to trigger the link to open again
    // and just want openLink() to be called once
    const propsRef = useRef(props.token);
    useDeepLinkRedirector();
    usePlaidEmitter((event) => {
        Log.info('[PlaidLink] Handled Plaid Event: ', false, event);
        if (event.eventName === CONST.PLAID.EVENT.ERROR) {
            props.onError(event.metadata);
        }
    });
    useEffect(() => {
        openLink({
            tokenConfig: {
                token: propsRef.current.token,
            },
            onSuccess: ({publicToken, metadata}) => {
                propsRef.current.onSuccess({publicToken, metadata});
            },
            onExit: (exitError, metadata) => {
                Log.info('[PlaidLink] Exit: ', false, {exitError, metadata});
                propsRef.current.onExit();
            },
        });
    }, []);
    return null;
};

PlaidLink.propTypes = plaidLinkPropTypes;
PlaidLink.defaultProps = plaidLinkDefaultProps;
PlaidLink.displayName = 'PlaidLink';

export default PlaidLink;
