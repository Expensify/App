import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NavigationContext} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const navigationContextPropTypes = {
    // Whether this screen is focused
    isScreenFocused: PropTypes.bool.isRequired,
};

export default function (WrappedComponent) {
    class withNavigationContext extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isScreenFocused: false,
            };
        }

        componentDidMount() {
            this.unsubscribeFocus = this.context.addListener('focus', () => this.setState({
                isScreenFocused: true,
            }));
            this.unsubscribeBlur = this.context.addListener('blur', () => this.setState({
                isScreenFocused: false,
            }));
        }

        componentDidUpdate() {
            const isCurrentlyFocused = this.context.isFocused();
            if (this.state.isScreenFocused !== isCurrentlyFocused) {
                // If the value has changed since the last render, we need to update it.
                // This could happen if we missed an update from the event listeners during re-render.
                // React will process this update immediately, so the old subscription value won't be committed.
                // It is still nice to avoid returning a mismatched value though, so let's override the return value.
                // This is the same logic as in https://github.com/facebook/react/tree/master/packages/use-subscription

                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({
                    isScreenFocused: isCurrentlyFocused,
                });
            }
        }

        componentWillUnmount() {
            this.unsubscribeFocus();
            this.unsubscribeBlur();
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    isScreenFocused={this.state.isScreenFocused}
                />
            );
        }
    }

    withNavigationContext.contextType = NavigationContext;
    withNavigationContext.displayName = `withNavigationContext(${getComponentDisplayName(WrappedComponent)})`;
    return withNavigationContext;
}

export {
    navigationContextPropTypes,
};
