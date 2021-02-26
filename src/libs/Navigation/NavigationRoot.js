import _ from 'underscore';
import React, {Component} from 'react';
import {Linking} from 'react-native';
import PropTypes from 'prop-types';
import {
    getStateFromPath,
    getPathFromState,
    NavigationContainer,
} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import modalRoutesPropTypes from './AppNavigator/modalRoutesPropTypes';
import mainRoutesPropTypes from './AppNavigator/mainRoutesPropTypes';
import sidebarRoutePropTypes from './AppNavigator/sidebarRoutePropTypes';
import publicRoutePropTypes from './AppNavigator/publicRoutePropTypes';
import getPathName from './getPathName';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';

const propTypes = {
    modalRoutes: modalRoutesPropTypes.isRequired,
    mainRoutes: mainRoutesPropTypes.isRequired,
    sidebarRoute: sidebarRoutePropTypes.isRequired,
    publicRoute: publicRoutePropTypes.isRequired,
    authenticated: PropTypes.bool.isRequired,
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    currentlyViewedReportID: null,
};

class NavigationRoot extends Component {
    constructor(props) {
        super(props);

        this.initialState = undefined;
        this.state = {
            loading: true,
            initialState: undefined,
            drawerOpenByDefault: true,
        };
    }

    componentDidMount() {
        Linking.getInitialURL()
            .then((initialUrl) => {
                // On web we should be able to parse this. It will be null on native for now until deep links are
                // hooked up
                const path = getPathName(initialUrl);
                let initialState = getStateFromPath(path, linkingConfig.config);
                Onyx.set(ONYXKEYS.CURRENT_URL, path);

                // If we are landing on something other than the report screen or site root then we MUST set the
                // initial route to the currently viewed report so there some history to navigate back from
                if (path !== ROUTES.HOME && !path.includes(ROUTES.REPORT)) {
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

                // If we are navigating to something besides the root view then close the drawer
                let drawerOpenByDefault = true;
                if (path && path !== ROUTES.HOME) {
                    drawerOpenByDefault = false;
                }

                this.setState({loading: false, initialState, drawerOpenByDefault});
            });
    }

    render() {
        if (this.state.loading) {
            return null;
        }

        // If we are on web, desktop, or a widescreen width we will use our custom navigator to create the wider layout
        return (
            <NavigationContainer
                initialState={this.state.initialState}
                onStateChange={(state) => {
                    const path = getPathFromState(state, linkingConfig.config);
                    if (path.includes(ROUTES.REPORT)) {
                        const reportID = Number(_.last(path.slice(1).split('/')));
                        if (!_.isNaN(reportID)) {
                            Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, String(reportID));
                        }
                    }

                    Onyx.merge(ONYXKEYS.CURRENT_URL, path);
                }}
                ref={navigationRef}
                linking={linkingConfig}
                documentTitle={{
                    formatter: () => 'Expensify.cash',
                }}
            >
                <AppNavigator
                    modalRoutes={this.props.modalRoutes}
                    mainRoutes={this.props.mainRoutes}
                    sidebarRoute={this.props.sidebarRoute}
                    authenticated={this.props.authenticated}
                    publicRoute={this.props.publicRoute}
                    isDrawerOpenByDefault={this.state.drawerOpenByDefault}
                />
            </NavigationContainer>
        );
    }
}

NavigationRoot.propTypes = propTypes;
NavigationRoot.defaultProps = defaultProps;
export default NavigationRoot;
