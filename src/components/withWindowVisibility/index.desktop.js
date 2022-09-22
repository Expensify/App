import React, {Component} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import Visibility from '../../libs/Visibility';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';

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

            this.windowFocusListener = null;
            this.windowBlurListener = null;

            this.state = {
                isVisible: Visibility.isVisible(),
            };
        }

        componentDidMount() {
            this.windowFocusListener = window.electron.on(ELECTRON_EVENTS.FOCUS, () => {
                this.setState({isVisible: Visibility.isVisible()});
            });
            this.windowBlurListener = window.electron.on(ELECTRON_EVENTS.BLUR, () => {
                this.setState({isVisible: Visibility.isVisible()});
            });
        }

        componentWillUnmount() {
            if (this.windowFocusListener) {
                this.windowFocusListener.remove();
            }

            if (this.windowBlurListener) {
                this.windowBlurListener.remove();
            }
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
