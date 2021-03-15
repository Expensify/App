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
import CONST from '../../../CONST';

const propTypes = {
    // Navigation state for this navigator
    // See: https://reactnavigation.org/docs/navigation-state/
    state: PropTypes.shape({
        // Index of the focused route object in the routes array
        index: PropTypes.number,

        // List of route objects (screens) which are rendered in the navigator. It also represents the history in a
        // stack navigator. There should be at least one item present in this array.
        routes: PropTypes.arrayOf(PropTypes.shape({

            // A unique key name for a screen. Created automatically by react-nav.
            key: PropTypes.string,
        })),
    }).isRequired,

    // Object containing descriptors for each route with the route keys as its properties
    // See: https://reactnavigation.org/docs/custom-navigators/#usenavigationbuilder
    descriptors: PropTypes.objectOf(PropTypes.shape({

        // A function which can be used to render the actual screen. Calling descriptors[route.key].render() will return
        // a React element containing the screen content.
        render: PropTypes.func,
    })).isRequired,

    // Current url we are navigated to
    currentURL: PropTypes.string,

    // Path for the modal parent to match on
    path: PropTypes.string.isRequired,
};

const defaultProps = {
    currentURL: '',
};


class ResponsiveView extends React.Component {
    /**
     * Returns the current descriptor for the focused screen in this navigators state. The descriptor has a function
     * called render() that we must call each time this navigator updates. It's important to use this method to render
     * a screen, otherwise any child navigators won't be connected to the navigation tree properly.
     *
     * @returns {Object}
     */
    getCurrentViewDescriptor() {
        const currentRoute = this.props.state.routes[this.props.state.index];
        const currentRouteKey = currentRoute.key;
        const currentDescriptor = this.props.descriptors[currentRouteKey];
        return currentDescriptor;
    }

    render() {
        const currentViewDescriptor = this.getCurrentViewDescriptor();
        return (
            <Modal
                isVisible={this.props.currentURL
                    && this.props.currentURL.includes(this.props.path)}
                backgroundColor={themeColors.componentBG}
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                onClose={() => Navigation.dismissModal()}
            >
                {currentViewDescriptor.render()}
            </Modal>
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
};

ResponsiveNavigator.propTypes = {
    children: PropTypes.node.isRequired,
};

export default createNavigatorFactory(ResponsiveNavigator);
