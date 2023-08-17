import PropTypes from 'prop-types';
import {useEffect} from 'react';
import {Linking} from 'react-native';
import * as App from '../../libs/actions/App';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
};

function DeeplinkWrapper({isAuthenticated, children}) {
    useEffect(() => {
        Linking.getInitialURL().then((url) => App.openDeeplinkAfterSignIn(url, isAuthenticated));
        Linking.addEventListener('url', (state) => App.openDeeplinkAfterSignIn(state.url, isAuthenticated));
    }, []);
    return children;
}

DeeplinkWrapper.propTypes = propTypes;

export default DeeplinkWrapper;
