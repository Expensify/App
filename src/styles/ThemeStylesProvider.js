/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import useTheme from './themes/useTheme';
import StylesContext from './ThemeStylesContext';
import defaultStyles from './styles';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

function ThemeStylesProvider(props) {
    const theme = useTheme();

    const appContentStyle = useMemo(
        () => ({
            ...defaultStyles.appContent,
            backgroundColor: theme.appBG,
        }),
        [theme.appBG],
    );

    const styles = useMemo(
        () => ({
            ...defaultStyles,
            appContent: appContentStyle,
        }),
        [appContentStyle],
    );

    return <StylesContext.Provider value={styles}>{props.children}</StylesContext.Provider>;
}
ThemeStylesProvider.propTypes = propTypes;
ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
