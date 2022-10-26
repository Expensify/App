import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import * as Theme from '../libs/Theme';
import CONST from '../CONST';

export default function withTheme(WrappedComponent) {
    const WithTheme = (props) => {
        const themed = (unthemedStyles) => {
            return Theme.themed(unthemedStyles);
        }
        return (
            <WrappedComponent
            // eslint-disable-next-line
            {...props}
            ref={props.forwardedRef}
            themed={themed}
            />
        );
    };

    WithTheme.displayName = `withTheme(${getComponentDisplayName(WrappedComponent)})`;
    WithTheme.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithTheme.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithTheme {...props} forwardedRef={ref} />
    ));
}

const withThemePropTypes = {
    /** Returns on-theme styles */
    themed: PropTypes.func.isRequired,
};

export {
    withThemePropTypes,
};
