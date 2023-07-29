import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const withDelayToggleButtonStatePropTypes = {
    /** A value whether the button state is complete */
    isDelayButtonStateComplete: PropTypes.bool.isRequired,

    /** A function to call to change the complete state */
    toggleDelayButtonState: PropTypes.func.isRequired,
};

export default function (WrappedComponent) {
    function WithDelayToggleButtonState({forwardedRef, ...props}){
        const [isDelayButtonStateComplete, setIsDelayButtonStateComplete] = useState(false);
        const resetButtonStateCompleteTimer = useRef(null);

        // eslint-disable-next-line arrow-body-style
        useEffect(() => {
            return () => {
                if (!resetButtonStateCompleteTimer.current) {
                    return;
                }
                clearTimeout(resetButtonStateCompleteTimer.current)
            };
        }, []);

        const toggleDelayButtonState = () => {
            setIsDelayButtonStateComplete(true);
            resetButtonStateCompleteTimer.current = setTimeout(() => {
                setIsDelayButtonStateComplete(false);
            }, 1800);
        };

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                forwardedRef={forwardedRef}
                isDelayButtonStateComplete={isDelayButtonStateComplete}
                toggleDelayButtonState={toggleDelayButtonState}
            />
        );
    }

    WithDelayToggleButtonState.displayName = `WithDelayToggleButtonState(${getComponentDisplayName(WrappedComponent)})`;
    WithDelayToggleButtonState.propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
    };
    WithDelayToggleButtonState.defaultProps = {
        forwardedRef: undefined,
    };

    return React.forwardRef((props, ref) => (
        <WithDelayToggleButtonState
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}

export {withDelayToggleButtonStatePropTypes};
