import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import {getThemedStyles} from '../styles/styles';

const ThemeContext = createContext(null);

const withThemePropTypes = {
    themed: PropTypes.func.isRequired,
};

const themeProviderPropTypes = {
    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredTheme: PropTypes.bool,

    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

const themeProviderDefaultProps = {
    preferredTheme: false,
};

class ThemeContextProvider extends React.Component {
    render() {
        return (
            <ThemeContext.Provider value={getThemedStyles(this.props.preferredTheme)}>
                {this.props.children}
            </ThemeContext.Provider>
        );
    }
}

ThemeContextProvider.propTypes = themeProviderPropTypes;
ThemeContextProvider.defaultProps = themeProviderDefaultProps;

const Provider = withOnyx({
    preferredTheme: {
        key: ONYXKEYS.NVP_PREFERRED_THEME,
    },
})(ThemeContextProvider);

Provider.displayName = 'withOnyx(ThemeContextProvider)';

export default function withTheme(WrappedComponent) {
    const WithTheme = forwardRef((props, ref) => (
        <ThemeContext.Consumer>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            {themeUtils => <WrappedComponent {...themeUtils} {...props} ref={ref} />}
        </ThemeContext.Consumer>
    ));

    WithTheme.displayName = `withTheme(${getComponentDisplayName(WrappedComponent)})`;

    return WithTheme;
}

export {
    withThemePropTypes,
    Provider as ThemeProvider,
};
