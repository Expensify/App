/*
 * The FocusTrap is only used on web and desktop
 */
import FocusTrap from 'focus-trap-react';
import {PropTypes} from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

const propTypes = {
    /** Children to wrap with FocusTrap */
    children: PropTypes.node.isRequired,

    /**
     *  Whether to enable the FocusTrap.
     *  If the FocusTrap is disabled, we just pass the children through.
     */
    isEnabled: PropTypes.bool,

    /**
     *  Whether to disable auto focus
     *  It is used when the component inside the FocusTrap have their own auto focus logic
     */
    shouldEnableAutoFocus: PropTypes.bool,

    /** Whether the FocusTrap is active (listening for events) */
    isActive: PropTypes.bool,
};

const defaultProps = {
    isEnabled: true,
    shouldEnableAutoFocus: false,
    isActive: false,
};

function FocusTrapView({isEnabled = true, isActive = true, shouldEnableAutoFocus, ...props}) {
    /**
     * Focus trap always needs a focusable element.
     * In case that we don't have any focusable elements in the modal,
     * the FocusTrap will use fallback View element using this ref.
     */
    const ref = useRef(null);

    /**
     * We have to set the 'tabindex' attribute to 0 to make the View focusable.
     * Currently, it is not possible to set this through props.
     * After the upgrade of 'react-native-web' to version 0.19 we can use 'tabIndex={0}' prop instead.
     */
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        ref.current.setAttribute('tabindex', '0');
    }, []);

    return isEnabled ? (
        <FocusTrap
            active={isActive}
            focusTrapOptions={{
                initialFocus: () => shouldEnableAutoFocus && ref.current,
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
    ) : (
        props.children
    );
}

FocusTrapView.displayName = 'FocusTrapView';
FocusTrapView.propTypes = propTypes;
FocusTrapView.defaultProps = defaultProps;

export default FocusTrapView;
