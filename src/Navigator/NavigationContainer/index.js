import _ from 'underscore';
import React, {Component} from 'react';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import {NavigationContainer, getStateFromPath} from '@react-navigation/native';
import {navigationRef} from '../index';
import withWindowDimensions from '../../components/withWindowDimensions';
import linkingConfig from '../linkingConfig';
import AppNavigator from './AppNavigator';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';

class ReactNavigationContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    getInitialState(initialUrl) {
        if (initialUrl) {
            const cleanUrl = initialUrl.replace('http://localhost:8080', '');
            if (cleanUrl.includes(ROUTES.REPORT)) {
                const reportID = _.last(cleanUrl.slice(1).split('/'));
                Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, reportID);
            }

            Onyx.merge(ONYXKEYS.CURRENT_ROUTE, cleanUrl);
            return getStateFromPath(cleanUrl, linkingConfig.config);
        }

        // This would return the user to the last thing they were doing... disabled for now...
        // if (this.props.initialRoute) {
        //     return getStateFromPath(this.props.initialRoute, linkingConfig.config);
        // }

        return undefined;
    }

    componentDidMount() {
        Linking.getInitialURL()
            .then((initialUrl) => {
                this.initialState = this.getInitialState(initialUrl);
                this.setState({loading: false});
            });
    }

    render() {
        if (this.state.loading) {
            return null;
        }

        // If we are on web, desktop, or a widescreen width we will use our custom navigator to create the wider layout
        return (
            <NavigationContainer
                initialState={this.initialState}
                onStateChange={(state) => {
                    this.props.onStateChange(state);
                }}
                ref={navigationRef}
                linking={linkingConfig}
                documentTitle={{
                    formatter: (options, route) => `Expensify.cash | ${options?.title ?? route?.name}`,
                }}
            >
                <AppNavigator
                    isSmallScreenWidth={this.props.isSmallScreenWidth}
                    modalRoutes={this.props.modalRoutes}
                    mainRoutes={this.props.mainRoutes}
                    sidebarRoute={this.props.sidebarRoute}
                    authenticated={this.props.authenticated}
                    publicRoute={this.props.publicRoute}
                />
            </NavigationContainer>
        );
    }
}

export default withWindowDimensions(ReactNavigationContainer);
