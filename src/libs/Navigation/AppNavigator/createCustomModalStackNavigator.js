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

    // Current url we are navigated to
    currentURL: PropTypes.string,

    // Path for the modal parent to match on
    path: PropTypes.string.isRequired,
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
