import _ from 'underscore';
import React, {Component} from 'react';
import {Linking} from 'react-native';
import PropTypes from 'prop-types';
import {
    getStateFromPath,
    getPathFromState,
    NavigationContainer,
} from '@react-navigation/native';
import {withOnyx} from 'react-native-onyx';
import {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import getPathName from './getPathName';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import {updateCurrentlyViewedReportID} from '../actions/Report';
import {setCurrentURL} from '../actions/App';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

const propTypes = {
    // Whether the current user is logged in with an authToken
    authenticated: PropTypes.bool.isRequired,

    // The current reportID that we are navigated to or should show in the ReportScreen
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    currentlyViewedReportID: null,
};

class NavigationRoot extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            initialState: undefined,
        };

        this.handleStateChange = this.handleStateChange.bind(this);
    }

    componentDidMount() {
        Linking.getInitialURL()
            .then((initialUrl) => {
                // On web we should be able to parse this. It will be null on native for now until deep links are
                // hooked up
                const path = getPathName(initialUrl);
                let initialState = getStateFromPath(path, linkingConfig.config);
                setCurrentURL(path);

                // If we are landing on something other than the report screen or site root then we MUST set the
                // initial route to the currently viewed report so there some history to navigate back from
                if (path !== `/${ROUTES.HOME}` && !path.includes(`/${ROUTES.REPORT}`)) {
                    const homeRoute = {
                        name: 'Home',
                    };

                    if (this.props.currentlyViewedReportID) {
                        homeRoute.params = {
                            screen: 'Report',
                            params: {
                                reportID: this.props.currentlyViewedReportID,
                            },
                        };
                    }

                    if (!initialState) {
                        initialState = {
                            routes: [],
                        };
                    }

                    initialState.routes = [
                        homeRoute,
                        ...initialState.routes,
                    ];
                }

                this.setState({loading: false, initialState});
            });
    }

    /**
     * Intercept state changes and perform different logic
     * @param {NavigationState} state
     */
    handleStateChange(state) {
        if (!state) {
            return;
        }

        const path = getPathFromState(state, linkingConfig.config);
        if (path.includes(ROUTES.REPORT)) {
            const reportID = Number(_.last(path.split('/')));
            if (reportID && !_.isNaN(reportID)) {
                updateCurrentlyViewedReportID(reportID);
            }
        }

        setCurrentURL(path);
    }

    /**
     * Render some fallback content until the navigation is ready
     * @returns {JSX.Element}
     */
    renderFallback() {
        return <FullScreenLoadingIndicator visible />;
    }

    render() {
        if (this.state.loading) {
            return this.renderFallback();
        }

        // If we are on web, desktop, or a widescreen width we will use our custom navigator to create the wider layout
        return (
            <NavigationContainer
                initialState={this.state.initialState}
                onStateChange={this.handleStateChange}
                ref={navigationRef}
                linking={linkingConfig}
                documentTitle={{
                    formatter: () => 'Expensify.cash',
                }}
            >
                <AppNavigator authenticated={this.props.authenticated} />
            </NavigationContainer>
        );
    }
}

NavigationRoot.propTypes = propTypes;
NavigationRoot.defaultProps = defaultProps;
export default withOnyx({
    currentlyViewedReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
})(NavigationRoot);
