import React, {Component} from 'react';
import {Linking, Platform} from 'react-native';
import {NavigationContainer, getStateFromPath} from '@react-navigation/native';
import {navigationRef} from '../index';
import withWindowDimensions from '../../components/withWindowDimensions';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';

class ReactNavigationContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            initialUrl: '',
        };
    }

    componentDidMount() {
        Linking.getInitialURL()
            .then((initialUrl) => {
                this.setState({initialUrl, loading: false});
            });
    }

    render() {
        if (this.state.loading) {
            return null;
        }

        // If we are on web, desktop, or a widescreen width we will use our custom navigator to create the wider layout
        return (
            <NavigationContainer
                initialState={

                    // When we are on web or coming from a deep link we will not restore the state
                    (Platform.OS !== 'web' && !this.state.initialUrl && this.props.initialRoute)
                        ? getStateFromPath(this.props.initialRoute, linkingConfig.config)
                        : null
                }
                onStateChange={(state) => {
                    this.props.onStateChange(state);
                }}
                ref={navigationRef}
                linking={linkingConfig}
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
