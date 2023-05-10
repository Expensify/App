import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const SafeArea = props => (
    <SafeAreaView style={[styles.iPhoneXSafeArea]} edges={['left', 'right']}>
        {props.children}
    </SafeAreaView>
);

SafeArea.propTypes = {
    /** App content */
    children: PropTypes.node.isRequired,
};
SafeArea.displayName = 'SafeArea';

export default SafeArea;
