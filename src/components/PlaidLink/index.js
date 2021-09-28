import React from 'react';
import {View} from 'react-native';
import styles from '../../styles/styles';
import {plaidLinkPropTypes, plaidLinkDefaultProps} from './plaidLinkPropTypes';

class PlaidLink extends React.Component {
    constructor(props) {
        super(props);
        this.onMessage = this.onMessage.bind(this);
        this.state = {
            isHidden: false,
        };
    }

    componentDidMount() {
        window.addEventListener('plaidEvent', this.onMessage);
    }

    componentWillUnmount() {
        window.removeEventListener('plaidEvent', this.onMessage);
    }

    onMessage(e) {
        switch (e.detail.eventName) {
            case 'plaid-on-load':
                console.debug('Plaid loaded');
                return;
            case 'plaid-on-event':
                console.debug('Plaid event: ', {event: e.detail.event, metadata: e.detail.metadata});
                if (e.detail.event === 'ERROR') {
                    this.props.onError(e.detail.metadata);
                }
                if (e.detail.event === 'HANDOFF') {
                    this.setState({isHidden: true});
                }
                return;
            case 'plaid-on-success':
                // eslint-disable-next-line no-case-declarations
                const linkSuccess = {publicToken: e.detail.public_token, metadata: e.detail.metadata};
                console.debug('Plaid success: ', linkSuccess);
                this.props.onSuccess(linkSuccess);
                return;
            case 'plaid-on-exit':
                this.props.onExit();
                return;
            default:
                console.debug(e);
        }
    }

    render() {
        if (this.state.isHidden) {
            return null;
        }

        return (
            <View
                style={styles.plaidLink}
            >
                <iframe
                    ref={el => this.iframe = el}
                    src={`/plaid.html?token=${this.props.token}`}
                    height="100%"
                    width="100%"
                    seamless="seamless"
                    scrolling="no"
                    title="Connect with Plaid"
                    frameBorder="0"
                />

            </View>
        );
    }
}

PlaidLink.propTypes = plaidLinkPropTypes;
PlaidLink.defaultProps = plaidLinkDefaultProps;
PlaidLink.displayName = 'PlaidLink';
export default PlaidLink;
