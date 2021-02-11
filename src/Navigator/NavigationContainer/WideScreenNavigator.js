import _ from 'underscore';
import React from 'react';
import {View, Animated, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/core';
import {StackRouter} from '@react-navigation/routers';
import withWindowDimensions from '../../components/withWindowDimensions';
import ROUTES from '../../ROUTES';
import variables from '../../styles/variables';
import Modal from '../../components/Modal';
import themeColors from '../../styles/themes/default';
import ONYXKEYS from '../../ONYXKEYS';
import Navigator from '../index';

class WideScreenView extends React.Component {
    constructor(props) {
        super(props);

        const isCurrentRouteRoot = this.props.currentRoute === ROUTES.HOME;
        this.state = {
            sidebarAnimation: new Animated.Value(
                isCurrentRouteRoot ? 0 : 1,
            ),
            mainAnimation: new Animated.Value(
                isCurrentRouteRoot ? 1 : 0,
            ),
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentRoute === this.props.currentRoute) {
            return;
        }

        if (prevProps.currentRoute === ROUTES.HOME && this.props.currentRoute !== ROUTES.HOME) {
            this.animateSidebar(false);
        }

        if (prevProps.currentRoute !== ROUTES.HOME && this.props.currentRoute === ROUTES.HOME) {
            Keyboard.dismiss();
            this.animateSidebar(true);
        }
    }

    getDescriptorByName(name) {
        const currentDescriptor = _.find(this.props.descriptors, (value, key) => key.includes(name));
        return currentDescriptor || {
            render() {
                return <View />;
            },
        };
    }

    getTopViewDescriptor() {
        const currentDescriptor = _.first(_.values(this.props.descriptors));
        return currentDescriptor;
    }

    getMainRoute() {
        const routeToRender = _.find(this.props.mainRoutes, mainRouteConfig => (
            this.props.currentMainRoute && this.props.currentMainRoute.includes(mainRouteConfig.path)
        ));

        if (!routeToRender) {
            return <View />;
        }

        const MainComponent = routeToRender.Component;
        return <MainComponent />;
    }

    /**
     * Animates the navigationMenu in and out
     *
     * @param {Boolean} didNavigateToRoot
     */
    animateSidebar(didNavigateToRoot) {
        Animated.parallel([
            Animated.timing(this.state.sidebarAnimation, {
                toValue: didNavigateToRoot ? 0 : 1,
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(this.state.mainAnimation, {
                toValue: didNavigateToRoot ? 1 : 0,
                duration: 250,
                useNativeDriver: false,
            }),
        ]).start();
    }

    render() {
        const SidebarComponent = this.props.sidebarRoute.Component;
        return (
            <View
                style={{
                    height: '100%',
                    width: this.props.windowDimensions.width,
                    flexDirection: this.props.authenticated ? 'row' : 'column',
                }}
            >
                {this.props.authenticated && (
                    <>
                        {/* This is the sidebar view */}
                        <Animated.View
                            style={[
                                this.props.isSmallScreenWidth
                                    ? {
                                        position: 'absolute',
                                        height: '100%',
                                        width: this.props.windowDimensions.width,
                                        transform: [
                                            {
                                                translateX: this.state.sidebarAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [
                                                        0,
                                                        -this.props.windowDimensions.width,
                                                    ],
                                                }),
                                            },
                                            {
                                                scale: this.state.sidebarAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [
                                                        1, 0.9,
                                                    ],
                                                }),
                                            },
                                        ],
                                        opacity: this.state.sidebarAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 0],
                                        }),
                                    }
                                    : {
                                        width: variables.sideBarWidth,
                                        height: '100%',
                                    },
                            ]}
                        >
                            {/* We are not using a descriptor here or for the main route since it would only show
                            when we navigate to the site root and we want it to persist at all times. */}
                            <SidebarComponent />
                        </Animated.View>

                        {/* This is the main view. A main view must always be shown so similar to the Sidebar we do not
                         use the descriptors to render these on wider screens. Instead we'll look at the
                         currentMainRoute key. */}
                        <Animated.View
                            style={this.props.isSmallScreenWidth
                                ? {
                                    position: 'absolute',
                                    height: '100%',
                                    width: this.props.windowDimensions.width,
                                    transform: [
                                        {
                                            translateX: this.state.mainAnimation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [
                                                    0,
                                                    this.props.windowDimensions.width,
                                                ],
                                            }),
                                        },
                                        {
                                            scale: this.state.sidebarAnimation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.9, 1],
                                            }),
                                        },
                                    ],
                                    opacity: this.state.sidebarAnimation,
                                }
                                : {
                                    flex: 1,
                                }}
                        >
                            {this.getMainRoute()}
                        </Animated.View>

                        {/* These are all modal views. Probably this would get refactored to say what kind of
                        modal we want this to be and other settings externally. For now, we are just passing
                        two different versions one which is screen only and one which is Modal wrapped in
                        a screen */}
                        {_.map(this.props.modalRoutes || [], modalRouteConfig => (
                            <Modal
                                key={modalRouteConfig.name}
                                isVisible={this.props.currentRoute && this.props.currentRoute.includes(modalRouteConfig.path)}
                                backgroundColor={themeColors.componentBG}
                                type={modalRouteConfig.modalType}
                                onClose={() => Navigator.dismissModal()}
                            >
                                {this.getDescriptorByName(modalRouteConfig.name).render()}
                            </Modal>
                        ))}
                    </>
                )}

                {/* If we are not authenticated just render the main public route */}
                {!this.props.authenticated && this.getTopViewDescriptor().render()}
            </View>
        );
    }
}

function WideScreenNavigator({
    modalRoutes,
    mainRoutes,
    sidebarRoute,
    authenticated,
    initialRouteName,
    children,
    ...rest
}) {
    const {state, navigation, descriptors} = useNavigationBuilder(StackRouter, {
        initialRouteName,
        children,
    });

    return (
        <WideScreenView
            state={state}
            navigation={navigation}
            descriptors={descriptors}
            modalRoutes={modalRoutes}
            mainRoutes={mainRoutes}
            sidebarRoute={sidebarRoute}
            authenticated={authenticated}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default createNavigatorFactory(
    withOnyx({
        currentRoute: {
            key: ONYXKEYS.CURRENT_ROUTE,
        },
        currentMainRoute: {
            key: ONYXKEYS.CURRENT_MAIN_ROUTE,
        },
    })(withWindowDimensions(WideScreenNavigator)),
);
