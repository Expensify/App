import PropTypes from 'prop-types';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import useThemeStyles from '@styles/useThemeStyles';

function SafeArea(props) {
    const styles = useThemeStyles();
    return (
        <SafeAreaView
            style={[styles.iPhoneXSafeArea]}
            edges={['left', 'right']}
        >
            {props.children}
        </SafeAreaView>
    );
}

SafeArea.propTypes = {
    /** App content */
    children: PropTypes.node.isRequired,
};
SafeArea.displayName = 'SafeArea';

export default SafeArea;
