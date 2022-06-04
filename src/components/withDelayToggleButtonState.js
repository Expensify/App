import React, {Component} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const withDelayToggleButtonStatePropTypes = {
    /** A value whether the button state is complete */
    isDelayButtonStateComplete: PropTypes.bool.isRequired,

    /** A function to call to change the complete state */
    toggleDelayButtonState: PropTypes.func.isRequired,
};

export default function (WrappedComponent) {
    class WithDelayToggleButtonState extends Component {
        constructor(props) {
            super(props);

            this.state = {
                isDelayButtonStateComplete: false,
            };
            this.toggleDelayButtonState = this.toggleDelayButtonState.bind(this);
        }

        componentWillUnmount() {
            if (!this.resetButtonStateCompleteTimer) {
                return;
            }

            clearTimeout(this.resetButtonStateCompleteTimer);
        }

        /**
         * @param {Boolean} [resetAfterDelay] Impose delay before toggling state
         */
        toggleDelayButtonState(resetAfterDelay) {
            this.setState({
                isDelayButtonStateComplete: true,
            });

            if (!resetAfterDelay) {
                return;
            }

            this.resetButtonStateCompleteTimer = setTimeout(() => {
                this.setState({
                    isDelayButtonStateComplete: false,
                });
            }, 1800);
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    isDelayButtonStateComplete={this.state.isDelayButtonStateComplete}
                    toggleDelayButtonState={this.toggleDelayButtonState}
                />
            );
        }
    }

    WithDelayToggleButtonState.displayName = `WithDelayToggleButtonState(${getComponentDisplayName(WrappedComponent)})`;
    WithDelayToggleButtonState.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithDelayToggleButtonState.defaultProps = {
        forwardedRef: undefined,
    };

    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithDelayToggleButtonState {...props} forwardedRef={ref} />
    ));
}

export {
    withDelayToggleButtonStatePropTypes,
};
