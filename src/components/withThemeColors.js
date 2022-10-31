import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import * as Theme from '../libs/Theme';

const ThemeContext = createContext(null);

const withThemePropTypes = {
    themed: PropTypes.func.isRequired,
}

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
    getContextValue () {
        return {
            themed: this.themed.bind(this),
        }
    }

    themed(unthemedStyles) {
        return Theme.themed(unthemedStyles, this.props.preferredTheme);
    }

    render() {
        return (
            <ThemeContext.Provider value={this.getContextValue()}>
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
            {themeUtils => <WrappedComponent {...themeUtils} {...props} ref={ref}/>}
        </ThemeContext.Consumer>
    ));

    WithTheme.displayName = `withTheme(${getComponentDisplayName(WrappedComponent)})`;

    return WithTheme;
}

export {
    withThemePropTypes,
    Provider as ThemeProvider,
};
