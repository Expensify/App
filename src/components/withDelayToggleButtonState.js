import React, {Component} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const withDelayToggleButtonStatePropTypes = {
    /** A value whether the button state is complete */
    isButtonStateComplete: PropTypes.bool.isRequired,

    /** A function to call to change the complete state */
    toggleButtonStateComplete: PropTypes.func.isRequired,
};

export default function (WrappedComponent) {
    class WithDelayToggleButtonState extends Component {
        constructor(props) {
            super(props);

            this.state = {
                isButtonStateComplete: false,
            };
            this.toggleButtonStateComplete = this.toggleButtonStateComplete.bind(this);
        }

        componentWillUnmount() {
            if (!this.resetButtonStateCompleteTimer) {
                return;
            }

            clearTimeout(this.resetButtonStateCompleteTimer);
        }

        /**
         * @param {Boolean} [resetAfterDelay=true] Impose delay before toggling state
         */
        toggleButtonStateComplete(resetAfterDelay = true) {
            this.setState({
                isButtonStateComplete: true,
            });

            if (resetAfterDelay) {
                this.resetButtonStateCompleteTimer = setTimeout(() => {
                    this.setState({
                        isButtonStateComplete: false,
                    });
                }, 1800);
            }
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    isButtonStateComplete={this.state.isButtonStateComplete}
                    toggleButtonStateComplete={this.toggleButtonStateComplete}
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
