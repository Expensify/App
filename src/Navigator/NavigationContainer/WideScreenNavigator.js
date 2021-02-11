import _ from 'underscore';
import React from 'react';
import {View, Animated, Keyboard} from 'react-native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/core';
import {StackRouter} from '@react-navigation/routers';
import withWindowDimensions from '../../components/withWindowDimensions';
import SidebarPage from '../../pages/home/SidebarPage';
import ROUTES from '../../ROUTES';
import variables from '../../styles/variables';
import Modal from '../../components/Modal';
import themeColors from '../../styles/themes/default';

class WideScreenView extends React.Component {
    constructor(props) {
        super(props);

        const isCurrentRouteRoot = this.props.currentRoute === ROUTES.ROOT;
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

        if (prevProps.currentRoute === ROUTES.ROOT && this.props.currentRoute !== ROUTES.ROOT) {
            this.animateSidebar(false);
        }

        if (prevProps.currentRoute !== ROUTES.ROOT && this.props.currentRoute === ROUTES.ROOT) {
            Keyboard.dismiss();
            this.animateSidebar(true);
        }
    }

    getMainRoute() {
        const currentKey = _.first(_.keys(this.props.descriptors));
        const currentDescriptor = _.first(_.values(this.props.descriptors));

        console.log(currentRoute);

        return currentRoute;
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
                duration: 400,
                useNativeDriver: false,
            }),
            Animated.timing(this.state.mainAnimation, {
                toValue: didNavigateToRoot ? 1 : 0,
                duration: 400,
                useNativeDriver: false,
            }),
        ]).start();
    }

    render() {
        const mainRoute = this.getMainRoute();
        return (
            <View
                style={{
                    height: '100%',
                    width: this.props.windowDimensions.width,
                    flexDirection: 'row',
                }}
            >
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
                    <SidebarPage />
                </Animated.View>

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
                    {mainRoute.render()}
                </Animated.View>

                {/* These are all modal views. Probably this would get refactored to say what kind of
                modal we want this to be and other settings externally. For now, we are just passing
                two different versions one which is screen only and one which is Modal wrapped in
                a screen */}
                {_.map(this.props.modalRoutes || [], (modalRoute) => {
                    const subRoute = _.find(
                        modalRoute.subRoutes,
                        ({path}) => path === this.props.currentRoute,
                    );

                    if (!subRoute) {
                        return;
                    }

                    const SubRouteComponent = subRoute.Component;
                    return (
                        <Modal
                            isVisible={this.props.currentRoute.includes(modalRoute.path)}
                            backgroundColor={themeColors.componentBG}
                            type={modalRoute.modalType}
                            onClose={() => Navigator.dismissModal()}
                        >
                            <SubRouteComponent />
                        </Modal>
                    );
                })}
            </View>
        );
    }
}

function WideScreenNavigator({initialRouteName, children, ...rest}) {
    const {state, navigation, descriptors} = useNavigationBuilder(StackRouter, {
        initialRouteName,
        children,
    });

    return (
        <WideScreenView
            state={state}
            navigation={navigation}
            descriptors={descriptors}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default createNavigatorFactory(withWindowDimensions(WideScreenNavigator));
