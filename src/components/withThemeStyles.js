import React from 'react';
import PropTypes from 'prop-types';
import useThemeStyles from '../styles/useThemeStyles';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import refPropTypes from './refPropTypes';

const withThemeStylesPropTypes = {
    themeStyles: PropTypes.object.isRequired,
};

export default function withThemeStyles(WrappedComponent) {
    function WithThemeStyles(props) {
        const themeStyles = useThemeStyles();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                themeStyles={themeStyles}
            />
        );
    }

    WithThemeStyles.displayName = `withThemeStyles(${getComponentDisplayName(WrappedComponent)})`;
    WithThemeStyles.propTypes = {
        forwardedRef: refPropTypes,
    };
    WithThemeStyles.defaultProps = {
        forwardedRef: () => {},
    };

    const WithThemeStylesWithRef = React.forwardRef((props, ref) => (
        <WithThemeStyles
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithThemeStylesWithRef.displayName = `WithThemeStylesWithRef`;

    return WithThemeStylesWithRef;
}

export {withThemeStylesPropTypes};
