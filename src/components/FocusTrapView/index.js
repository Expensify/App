/*
 * The FocusTrap is only used on web and desktop
 */
import React, {useRef} from 'react';
import FocusTrap from 'focus-trap-react';
import {View} from 'react-native';
import {PropTypes} from 'prop-types';

const propTypes = {
    /** Whether to enable the FocusTrap */
    enabled: PropTypes.bool,
};

const defaultProps = {
    enabled: true,
};

function FocusTrapView({enabled, ...props}) {
    /**
     * Focus trap always needs a focusable element.
     * In case that we don't have any focusable elements in the modal,
     * the FocusTrap will use fallback View element using this ref.
     */
    const ref = useRef(null);

    return (
        <FocusTrap
            active={enabled}
            focusTrapOptions={{
                // initialFocus: false,
                fallbackFocus: () => ref.current,
                clickOutsideDeactivates: true,
            }}
        >
            <View
                ref={ref}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </FocusTrap>
    );
}

FocusTrapView.displayName = 'FocusTrapView';
FocusTrapView.propTypes = propTypes;
FocusTrapView.defaultProps = defaultProps;

export default FocusTrapView;
