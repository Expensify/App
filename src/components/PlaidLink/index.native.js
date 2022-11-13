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
            onExit: (exitError, metadata) => {
                Log.info('[PlaidLink] Exit: ', false, {exitError, metadata});
                props.onExit();
            },
        });
    }, []);

    return null;
};

PlaidLink.propTypes = plaidLinkPropTypes;
PlaidLink.defaultProps = plaidLinkDefaultProps;
PlaidLink.displayName = 'PlaidLink';

export default PlaidLink;
