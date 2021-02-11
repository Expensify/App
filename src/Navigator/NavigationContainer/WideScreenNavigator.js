import _ from 'underscore';
import React from 'react';
import {View, Animated, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/core';
import {StackRouter} from '@react-navigation/routers';
import withWindowDimensions from '../../components/withWindowDimensions';
import SidebarPage from '../../pages/home/SidebarPage';
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

    getDescriptorForRoute(path) {
        const currentDescriptor = _.find(this.props.descriptors, (value, key) => key.includes(path));
        return currentDescriptor || {
            render() {
                return <View />;
            },
        };
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
        return (
            <View
                style={{
                    height: '100%',
                    width: this.props.windowDimensions.width,
                    flexDirection: 'row',
                }}
            >
                {/* This is the sidebar view */}
                {this.props.authenticated && (
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
                        <SidebarPage />
                    </Animated.View>
                )}

                {/* This is the main view */}
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
                    {_.map(this.props.mainRoutes, mainRoute => (
                        <React.Fragment key={mainRoute.path}>
                            {this.getDescriptorForRoute(mainRoute.path).render()}
                        </React.Fragment>
                    ))}
                </Animated.View>

                {/* These are all modal views. Probably this would get refactored to say what kind of
                modal we want this to be and other settings externally. For now, we are just passing
                two different versions one which is screen only and one which is Modal wrapped in
                a screen */}
                {_.map(this.props.modalRoutes || [], modalRouteConfig => (
                    <Modal
                        key={modalRouteConfig.path}
                        isVisible={this.props.currentRoute.includes(`/${modalRouteConfig.path.toLowerCase()}`)}
                        backgroundColor={themeColors.componentBG}
                        type={modalRouteConfig.modalType}
                        onClose={() => Navigator.dismissModal()}
                    >
                        {this.getDescriptorForRoute(modalRouteConfig.path).render()}
                    </Modal>
                ))}
            </View>
        );
    }
}

function WideScreenNavigator({
    modalRoutes,
    mainRoutes,
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
    })(withWindowDimensions(WideScreenNavigator)),
);
