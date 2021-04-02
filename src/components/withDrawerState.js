import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NavigationContext} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

export const withDrawerPropTypes = {
    isDrawerOpen: PropTypes.bool.isRequired,
};

export default function withDrawerState(WrappedComponent) {
    class HOC_Wrapper extends Component {
        constructor(props) {
            super(props);

            this.state = {
                isDrawerOpen: true,
            };
        }

        componentDidMount() {
            this.removeOpenListener = this.context.addListener('drawerOpen', () => {
                this.setState({isDrawerOpen: true});
            });

            this.removeCloseListener = this.context.addListener('drawerClose', () => {
                this.setState({isDrawerOpen: false});
            });
        }

        componentWillUnmount() {
            this.removeOpenListener();
            this.removeCloseListener();
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    isDrawerOpen={this.state.isDrawerOpen}
                />
            );
        }
    }

    HOC_Wrapper.contextType = NavigationContext;
    HOC_Wrapper.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return HOC_Wrapper;
}
