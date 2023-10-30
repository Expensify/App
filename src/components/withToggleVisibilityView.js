import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import useThemeStyles from '@styles/useThemeStyles';
import refPropTypes from './refPropTypes';

const toggleVisibilityViewPropTypes = {
    /** Whether the content is visible. */
    isVisible: PropTypes.bool,
};

export default function (WrappedComponent) {
    function WithToggleVisibilityView(props) {
        const styles = useThemeStyles();
        return (
            <View style={!props.isVisible && styles.visuallyHidden}>
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={props.forwardedRef}
                    isVisible={props.isVisible}
                />
            </View>
        );
    }

    WithToggleVisibilityView.displayName = `WithToggleVisibilityView(${getComponentDisplayName(WrappedComponent)})`;
    WithToggleVisibilityView.propTypes = {
        forwardedRef: refPropTypes,

        /** Whether the content is visible. */
        isVisible: PropTypes.bool,
    };
    WithToggleVisibilityView.defaultProps = {
        forwardedRef: undefined,
        isVisible: false,
    };

    const WithToggleVisibilityViewWithRef = React.forwardRef((props, ref) => (
        <WithToggleVisibilityView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithToggleVisibilityViewWithRef.displayName = `WithToggleVisibilityViewWithRef`;

    return WithToggleVisibilityViewWithRef;
}

export {toggleVisibilityViewPropTypes};
