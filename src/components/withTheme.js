import React from 'react';
import PropTypes from 'prop-types';
import useTheme from '../styles/themes/useTheme';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import refPropTypes from './refPropTypes';

const withThemePropTypes = {
    theme: PropTypes.object.isRequired,
};

export default function withTheme(WrappedComponent) {
    function WithTheme(props) {
        const theme = useTheme();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                theme={theme}
            />
        );
    }

    WithTheme.displayName = `withTheme(${getComponentDisplayName(WrappedComponent)})`;
    WithTheme.propTypes = {
        forwardedRef: refPropTypes,
    };
    WithTheme.defaultProps = {
        forwardedRef: () => {},
    };
    return React.forwardRef((props, ref) => (
        <WithTheme
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}

export {withThemePropTypes};
