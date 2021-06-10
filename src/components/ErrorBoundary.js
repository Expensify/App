import React from 'react';
import PropTypes from 'prop-types';
import crashlytics from '@react-native-firebase/crashlytics';

import Log from '../libs/Log';

const propTypes = {
    /* An message posted to the server (along with the error) when this component intercepts an error */
    errorMessage: PropTypes.string.isRequired,

    /* Actual content wrapped by this error boundary */
    children: PropTypes.node.isRequired,
};

/**
 * This component captures an error in the child component tree and logs it to the server
 * It can be used to wrap the entire app as well as to wrap specific parts for more granularity
 * @see {@link https://reactjs.org/docs/error-boundaries.html#where-to-place-error-boundaries}
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to the server
        Log.info(this.props.errorMessage, true, {error, errorInfo});

        // Since the error was handled we need to manually tell crashlytics about it
        crashlytics().log(`errorInfo: ${errorInfo}`);
        crashlytics().recordError(error);
    }

    render() {
        if (this.state.hasError) {
            // For the moment we've decided not to render any fallback UI
            return null;
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = propTypes;

export default ErrorBoundary;
