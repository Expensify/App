import React from 'react';
import {NativeEventEmitter, Platform} from 'react-native';
import {openLink, useDeepLinkRedirector} from 'react-native-plaid-link-sdk';
import Log from '../../libs/Log';
import CONST from '../../CONST';
import nativeModule from './nativeModule';
import {plaidLinkPropTypes, plaidLinkDefaultProps} from './plaidLinkPropTypes';

class PlaidLink extends React.Component {
    constructor(props) {
        super(props);
        this.listener = undefined;
    }

    componentDidMount() {
        const emitter = new NativeEventEmitter(nativeModule);
        this.listener = emitter.addListener('onEvent', this.onEvent.bind(this));

        // Use this hook so that deep linking works for plaid on iOS
        useDeepLinkRedirector();

        openLink({
            tokenConfig: {
                token: this.props.token,
            },
            onSuccess: ({publicToken, metadata}) => {
                this.props.onSuccess({publicToken, metadata});
            },
        });
    }

    componentWillUnmount() {
        if (!this.listener) {
            return;
        }

        this.listener.remove();
    }

    /**
     * @param {*} event
     */
    onEvent(event) {
        Log.info('[PlaidLink] Handled Plaid Event: ', false, event);
        if (event.eventName === CONST.PLAID.EVENT.ERROR) {
            this.props.onError(event.metadata);
        } else if (event.eventName === CONST.PLAID.EVENT.EXIT) {
            this.props.onExit();
        }
    }

    render() {
        return null;
    }
}

PlaidLink.propTypes = plaidLinkPropTypes;
PlaidLink.defaultProps = plaidLinkDefaultProps;
export default PlaidLink;
