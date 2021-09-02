import React from 'react';
import {NativeEventEmitter} from 'react-native';
import {openLink} from 'react-native-plaid-link-sdk';
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
        if (this.listener) {
            this.listener.remove();
        }
    }

    /**
     * @param {*} event
     */
    onEvent(event) {
        console.debug('[PlaidLink] Handled Plaid Event: ', event);
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
