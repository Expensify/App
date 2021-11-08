import {useCallback, useEffect} from 'react';
import {usePlaidLink} from 'react-plaid-link';
import {plaidLinkPropTypes, plaidLinkDefaultProps} from './plaidLinkPropTypes';
import Log from '../../libs/Log';

const PlaidLink = (props) => {
    console.log("here in index PlaidLink");
    const onSuccess = useCallback((publicToken, metadata) => {
        props.onSuccess({publicToken, metadata});
    }, []);

    const {open, ready, error} = usePlaidLink({
        token: props.token,
        onSuccess,
        receivedRedirectUri: null, //the redirect URI with an OAuth state ID parameter
        onExit: (exitError, metadata) => {
            Log.info('[PlaidLink] Exit: ', false, {exitError, metadata});
            console.log(exitError);
            props.onExit();
        },
        onEvent: (event, metadata) => {
            Log.info('[PlaidLink] Event: ', false, {event, metadata});
        },
    });

    useEffect(() => {
        if (error) {
            props.onError(error);
            return;
        }

        if (!ready) {
            return;
        }

        open();
    }, [ready, error]);

    return null;
};

PlaidLink.propTypes = plaidLinkPropTypes;
PlaidLink.defaultProps = plaidLinkDefaultProps;
PlaidLink.displayName = 'PlaidLink';
export default PlaidLink;
