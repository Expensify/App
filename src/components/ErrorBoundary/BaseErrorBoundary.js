import React from 'react';
import PropTypes from 'prop-types';
import BootSplash from '../../libs/BootSplash';
import GenericErrorPage from '../../pages/ErrorPage/GenericErrorPage';

const propTypes = {
    /* A message posted to `logError` (along with error data) when this component intercepts an error */
    errorMessage: PropTypes.string.isRequired,

    /* A function to perform the actual logging since different platforms support different tools */
    logError: PropTypes.func,

    /* Actual content wrapped by this error boundary */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    logError: () => {},
};

/**
 * This component captures an error in the child component tree and logs it to the server
 * It can be used to wrap the entire app as well as to wrap specific parts for more granularity
 * @see {@link https://reactjs.org/docs/error-boundaries.html#where-to-place-error-boundaries}
 */
class BaseErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
        this.clearError = this.clearError.bind(this);
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        this.props.logError(this.props.errorMessage, error, errorInfo);

        // We hide the splash screen since the error might happened during app init
        BootSplash.hide();
    }

    clearError() {
        this.setState({hasError: false});
    }

    render() {
        if (this.state.hasError) {
            return <GenericErrorPage onRefresh={this.clearError} />;
        }

        return this.props.children;
    }
}

BaseErrorBoundary.propTypes = propTypes;
BaseErrorBoundary.defaultProps = defaultProps;

export default BaseErrorBoundary;
