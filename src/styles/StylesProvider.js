/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import {useAnimatedStyle} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import useTheme from './themes/useTheme';
import StylesContext from './StylesContext';
import defaultStyles from './styles';

const propTypes = {
    children: PropTypes.node.isRequired,
};

function StylesProvider(props) {
    const theme = useTheme();

    const appContentStyle = useAnimatedStyle(() => ({
        ...defaultStyles.appContent,
        backgroundColor: theme.appBG.value,
    }));

    const styles = useMemo(
        () => ({
            ...defaultStyles,
            appContent: appContentStyle,
        }),
        [appContentStyle],
    );

    return <StylesContext.Provider value={styles}>{props.children}</StylesContext.Provider>;
}
StylesProvider.propTypes = propTypes;
StylesProvider.displayName = 'StylesProvider';

export default StylesProvider;
