import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const toggleVisibilityViewPropTypes = {
    /** Whether the content is visible. */
    isVisible: PropTypes.bool,
};

export default function (WrappedComponent) {
    const WithToggleVisibilityView = (props) => (
        <View style={!props.isVisible && styles.visuallyHidden}>
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                isVisible={props.isVisible}
            />
        </View>
    );

    WithToggleVisibilityView.displayName = `WithToggleVisibilityView(${getComponentDisplayName(WrappedComponent)})`;
    WithToggleVisibilityView.propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),

        /** Whether the content is visible. */
        isVisible: PropTypes.bool,
    };
    WithToggleVisibilityView.defaultProps = {
        forwardedRef: undefined,
        isVisible: false,
    };
    return React.forwardRef((props, ref) => (
        <WithToggleVisibilityView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}

export {toggleVisibilityViewPropTypes};
