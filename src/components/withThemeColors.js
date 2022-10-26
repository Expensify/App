import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import * as Localize from '../libs/Localize';
import DateUtils from '../libs/DateUtils';
import * as LocalePhoneNumber from '../libs/LocalePhoneNumber';
import * as NumberFormatUtils from '../libs/NumberFormatUtils';
import * as LocaleDigitUtils from '../libs/LocaleDigitUtils';
import CONST from '../CONST';

const ThemeContext = createContext(null);

const withThemePropTypes = {
    /** Returns on-theme styles */
    themed: PropTypes.func.isRequired,
};

const themeProviderProps = {
    /** The user's preferred theme e.g. 'dark' */
    preferredLocale: PropTypes.string,

    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

const themeProviderDefaultProps = {
    preferredLocale: 'light',
};

class themeContextProvider extends React.Component {
    getContextValue() {
        return {
            themed: this.themed.bind(this),
            preferredTheme: this.props.preferredTheme,
        };
    }

    /**
     * @param {Array|Object} unthemedStyles
     * @param {Object} [variables]
     * @returns {String}
     */
    themed(unthemedStyles) {
        return Theme.generateStyles(this.props.preferredTheme, unthemedStyles);
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
            {themeUtils => <WrappedComponent {...themeUtils} {...props} ref={ref} />}
        </ThemeContext.Consumer>
    ));

    WithTheme.displayName = `withTheme(${getComponentDisplayName(WrappedComponent)})`;

    return WithTheme;
}

export {
    withThemePropTypes,
    Provider as ThemeContextProvider,
};
