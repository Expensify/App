import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import styles from '../styles/styles';

const propTypes = {
    /** Any children to display */
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const NestedScrollView = props => (
    <ScrollView
        horizontal
        contentContainerStyle={[styles.flex1, styles.h100, styles.w100]}
        scrollEnabled={false}
    >
        <View style={[styles.w100]}>
            {props.children}
        </View>
    </ScrollView>
);

NestedScrollView.propTypes = propTypes;
NestedScrollView.defaultProps = defaultProps;
NestedScrollView.displayName = 'NestedScrollView';
export default NestedScrollView;
