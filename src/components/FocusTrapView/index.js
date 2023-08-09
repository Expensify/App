/*
 * The FocusTrap is only used on web and desktop
 */
import React, {useRef} from 'react';
import FocusTrap from 'focus-trap-react';
import {View} from 'react-native';
import { PropTypes } from 'prop-types';

const propTypes = {
    /** Whether or not to disable the FocusTrap */
    enabled: PropTypes.bool,
};

const defaultProps = {
    enabled: true,
};

function FocusTrapView({enabled, ...props}) {
    const ref = useRef(null);

    return (
        <FocusTrap
            active={enabled}
            focusTrapOptions={{
                initialFocus: false,
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
