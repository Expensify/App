import React, { useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import compose from "../../libs/compose";
import withLocalize from "../withLocalize";
import {withOnyx} from "react-native-onyx";
import ONYXKEYS from "../../ONYXKEYS";
import {plaidLinkDefaultProps, plaidLinkPropTypes} from "../PlaidLink/plaidLinkPropTypes";
import PlaidLink from "../PlaidLink";
import ScreenWrapper from "../ScreenWrapper";
import HeaderWithCloseButton from "../HeaderWithCloseButton";
import Navigation from "../../libs/Navigation/Navigation";
import ROUTES from "../../ROUTES";
import WorkspaceSection from "../../pages/workspace/WorkspaceSection";
import {BankArrowPink} from "../Icon/Illustrations";
import Text from "../Text";
import WorkspaceResetBankAccountModal from "../../pages/workspace/WorkspaceResetBankAccountModal";

const OAuthLink = (props) => {
    console.log("in OAuthLink");
    console.log(props);

    // The Link token from the first Link initialization
    // const linkToken = localStorage.getItem('link_token');
    const linkToken = props.plaidLinkToken;
    const onSuccess = React.useCallback((publicToken, metadata) => {
        // send public_token to server, retrieve access_token and item_id
        // return to "https://example.com" upon completion
        console.log("in success for OAuthLink");
        props.onSuccess({publicToken, metadata})
    }, []);
    const onExit = (err, metatdata) => {
        console.log(err);
        // handle error...
    };
    const config = {
        token: linkToken,
        receivedRedirectUri: props.receivedRedirectUri, //the redirect URI with an OAuth state ID parameter
        onSuccess,
        onExit,
    };
    const { open, ready, error } = usePlaidLink(config);
    // automatically reinitialize Link
    useEffect(() => {
        if (ready) {
            open();
        }
    }, [ready, open]);
    return <></>;
};
OAuthLink.propTypes = plaidLinkPropTypes;
OAuthLink.defaultProps = plaidLinkDefaultProps;
OAuthLink.displayName = 'OAuthLink';

export default compose(
    withOnyx({
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,

            // We always fetch a new token to call Plaid. If we don't then it's possible to open multiple Plaid Link instances. In particular, this can cause issues for Android e.g.
            // inability to hand off to React Native once the bank connection is made. This is because an old stashed token will mount the PlaidLink component then it gets set again
            // which will mount another PlaidLink component.
            initWithStoredValues: false,
        }
    })
)(OAuthLink);

