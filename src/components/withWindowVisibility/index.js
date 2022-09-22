import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {AppState} from 'react-native';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import Visibility from '../../libs/Visibility';

const windowVisibilityPropTypes = {
    isWindowVisible: PropTypes.bool.isRequired,
};

export default function (WrappedComponent) {
    const propTypes = {
        forwardedRef: PropTypes.func,
    };

    const defaultProps = {
        forwardedRef: () => {},
    };

    class WithWindowVisibility extends Component {
        constructor(props) {
            super(props);

            this.appStateChangeListener = null;

            this.state = {
                isVisible: Visibility.isVisible(),
            };
        }

        componentDidMount() {
            this.appStateChangeListener = AppState.addEventListener('change', () => {
                this.setState({isVisible: Visibility.isVisible()});
            });
        }

        componentWillUnmount() {
            if (!this.appStateChangeListener) {
                return;
            }
            this.appStateChangeListener.remove();
        }

        render() {
            // eslint-disable-next-line react/destructuring-assignment
            const {forwardedRef, ...rest} = this.props;
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                    ref={forwardedRef}
                    isWindowVisible={this.state.isVisible}
                />
            );
        }
    }

    WithWindowVisibility.propTypes = propTypes;
    WithWindowVisibility.defaultProps = defaultProps;
    WithWindowVisibility.displayName = `WithWindowVisibility(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithWindowVisibility {...props} forwardedRef={ref} />
    ));
}

export {
    windowVisibilityPropTypes,
};
