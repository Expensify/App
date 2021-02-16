import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/core';
import {StackRouter} from '@react-navigation/routers';
import withWindowDimensions from '../../../components/withWindowDimensions';
import Modal from '../../../components/Modal';
import themeColors from '../../../styles/themes/default';
import ONYXKEYS from '../../../ONYXKEYS';
import Navigator from '../../index';
import compose from '../../../libs/compose';

class ResponsiveView extends React.Component {
    getCurrentViewDescriptor() {
        const currentRoute = this.props.state.routes[this.props.state.index];
        const currentRouteKey = currentRoute.key;
        const currentDescriptor = this.props.descriptors[currentRouteKey];
        return currentDescriptor;
    }

    render() {
        return (
            <>
                {/* These are all modal views. Probably this would get refactored to say what kind of
                modal we want this to be and other settings externally. For now, we are just passing
                two different versions one which is screen only and one which is Modal wrapped in
                a screen */}
                {_.map(this.props.modalRoutes || [], modalRouteConfig => (
                    <Modal
                        key={modalRouteConfig.name}
                        isVisible={this.props.currentRoute
                            && this.props.currentRoute.includes(modalRouteConfig.path)}
                        backgroundColor={themeColors.componentBG}
                        type={modalRouteConfig.modalType}
                        onClose={() => Navigator.dismissModal()}
                    >
                        {this.getCurrentViewDescriptor().render()}
                    </Modal>
                ))}
            </>
        );
    }
}

const ResponsiveViewWithHOCs = compose(
    withWindowDimensions,
    withOnyx({
        currentRoute: {
            key: ONYXKEYS.CURRENT_ROUTE,
        },
    }),
)(ResponsiveView);

const ResponsiveNavigator = ({
    modalRoutes,
    initialRouteName,
    children,
    ...rest
}) => {
    const {state, navigation, descriptors} = useNavigationBuilder(StackRouter, {
        initialRouteName,
        children,
    });

    return (
        <ResponsiveViewWithHOCs
            state={state}
            navigation={navigation}
            descriptors={descriptors}
            modalRoutes={modalRoutes}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
};

export default createNavigatorFactory(ResponsiveNavigator);
