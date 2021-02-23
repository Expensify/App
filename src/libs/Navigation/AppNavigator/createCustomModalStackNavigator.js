import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/core';
import {StackRouter} from '@react-navigation/routers';
import withWindowDimensions from '../../../components/withWindowDimensions';
import Modal from '../../../components/Modal';
import themeColors from '../../../styles/themes/default';
import ONYXKEYS from '../../../ONYXKEYS';
import Navigation from '../Navigation';
import compose from '../../compose';
import modalRoutesPropTypes from './modalRoutesPropTypes';

const propTypes = {
    // Internal react-navigation stuff used to determine which view we should display
    state: PropTypes.shape({
        index: PropTypes.number,
        routes: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.string,
        })),
    }).isRequired,

    // The current view object that has a render method to call
    descriptors: PropTypes.objectOf(PropTypes.shape({
        render: PropTypes.func,
    })).isRequired,

    // The modal routes
    modalRoutes: modalRoutesPropTypes.isRequired,

    // Current url we are navigated to
    currentURL: PropTypes.string,
};

const defaultProps = {
    currentURL: '',
};


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
                        isVisible={this.props.currentURL
                            && this.props.currentURL.includes(modalRouteConfig.path)}
                        backgroundColor={themeColors.componentBG}
                        type={modalRouteConfig.modalType}
                        onClose={() => Navigation.dismissModal()}
                    >
                        {this.getCurrentViewDescriptor().render()}
                    </Modal>
                ))}
            </>
        );
    }
}

ResponsiveView.propTypes = propTypes;
ResponsiveView.defaultProps = defaultProps;

const ResponsiveViewWithHOCs = compose(
    withWindowDimensions,
    withOnyx({
        currentURL: {
            key: ONYXKEYS.CURRENT_URL,
        },
    }),
)(ResponsiveView);

const ResponsiveNavigator = ({
    modalRoutes,
    children,
    ...rest
}) => {
    const {state, navigation, descriptors} = useNavigationBuilder(StackRouter, {
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

ResponsiveNavigator.propTypes = {
    modalRoutes: modalRoutesPropTypes.isRequired,
    children: PropTypes.node.isRequired,
};

export default createNavigatorFactory(ResponsiveNavigator);
