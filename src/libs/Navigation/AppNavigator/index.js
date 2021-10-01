import React, {memo} from 'react';
import PropTypes from 'prop-types';
import ROUTES from '../../../ROUTES';
import AppNavigatorContext from './AppNavigatorContext';
import PublicScreens from './PublicScreens';
import AuthScreens from './AuthScreens';
import SharedScreens from './SharedScreens';

const propTypes = {
    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,

    /** The current URL to render */
    currentURL: PropTypes.string,
};

const defaultProps = {
    currentURL: null,
};

class AppNavigator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSharedRoute: ROUTES.isSharedRoute(props.currentURL),
        };
        this.exitSharedStack = this.exitSharedStack.bind(this);
    }

    exitSharedStack() {
        this.setState({isSharedRoute: false});
    }

    render() {
        let nestedNavigator;
        if (this.state.isSharedRoute) {
            nestedNavigator = <SharedScreens />;
        } else {
            nestedNavigator = this.props.authenticated
                ? (

                    // These are the protected screens and only accessible when an authToken is present
                    <AuthScreens />
                )
                : (
                    <PublicScreens />
                );
        }

        return (
            <AppNavigatorContext.Provider value={{exitSharedStack: this.exitSharedStack}}>
                {nestedNavigator}
            </AppNavigatorContext.Provider>
        );
    }
}

/**
 * We do not want to re-render the full navigator every time the currentURL changes, so only re-render this component if:
 *   1. The route changes from shared to not shared (or vice versa), OR
 *   2. Authenticated prop changes
 *
 * @param {Object} prevProps
 * @param {Object} nextProps
 * @returns {boolean}
 */
function areEqual(prevProps, nextProps) {
    return ROUTES.isSharedRoute(prevProps.currentURL) === ROUTES.isSharedRoute(nextProps.currentURL)
        && prevProps.authenticated === nextProps.authenticated;
}

AppNavigator.propTypes = propTypes;
AppNavigator.defaultProps = defaultProps;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
