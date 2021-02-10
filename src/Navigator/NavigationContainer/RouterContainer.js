import _ from 'underscore';
import React, {Component} from 'react';
import Onyx from 'react-native-onyx';
import {Animated, Keyboard, View} from 'react-native';
import {Route, Router} from '../../libs/Router';
import ONYXKEYS from '../../ONYXKEYS';
import {routerRef} from '../index';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import withWindowDimensions from '../../components/withWindowDimensions';
import ROUTES from '../../ROUTES';
import Modal from '../../components/Modal';

class RouterContainer extends Component {
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
        const {sidebarRoute} = this.props;
        const PublicScreen = this.props.publicRoute.Component;
        return (
            <Router
                ref={routerRef}
            >
                <Route
                    path="*"
                    render={({match}) => {
                        if (match.url === this.props.currentRoute) {
                            return;
                        }

                        Onyx.merge(ONYXKEYS.CURRENT_ROUTE, match.url);
                    }}
                />
                {!this.props.authenticated
                    ? (
                        <PublicScreen />
                    )
                    : (
                        <>
                            <Route
                                path="/r/:reportID"
                                render={({match}) => {
                                    if (match.params.reportID === this.props.currentlyViewedReportID) {
                                        return;
                                    }

                                    Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, match.params.reportID);
                                }}
                            />

                            {/* App container here is the entire view */}
                            <View
                                style={{
                                    height: '100%',
                                    width: this.props.windowDimensions.width,
                                    flexDirection: 'row',
                                }}
                            >
                                {/* This is the sidebar view */}
                                <Animated.View
                                    key={sidebarRoute.path}
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
                                    <Route
                                        path={[sidebarRoute.path]}
                                        component={sidebarRoute.Component}
                                        key={sidebarRoute.path}
                                    />
                                </Animated.View>
                                {/* These views are all non modal views */}
                                {_.map(this.props.mainRoutes, route => (
                                    <Route
                                        path={[route.path, ...(route.additionalPaths || [])]}
                                        key={route.path}
                                        render={() => (
                                            <Animated.View
                                                key={route.path}
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
                                                <route.Component />
                                            </Animated.View>
                                        )}
                                    />
                                ))}

                                {/* These are all modal views. Probably this would get refactored to say what kind of
                                modal we want this to be and other settings externally. For now, we are just passing
                                two different versions one which is screen only and one which is Modal wrapped in
                                a screen */}
                                {_.map(this.props.modalRoutes, (modalRoute) => {
                                    const ModalContent = modalRoute.Component;
                                    return (
                                        <Modal
                                            isVisible={this.props.currentRoute === modalRoute.path}
                                            backgroundColor={themeColors.componentBG}
                                            type={modalRoute.modalType}
                                        >
                                            <ModalContent />
                                        </Modal>
                                    )
                                })}
                            </View>
                        </>
                    )}
            </Router>
        );
    }
}

export default withWindowDimensions(RouterContainer);
