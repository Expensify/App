import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ExpensifyText from './ExpensifyText';
import styles from '../styles/styles';

const propTypes = {
    /** An array of strings to display as an unordered list */
    items: PropTypes.arrayOf(PropTypes.string),
};
const defaultProps = {
    items: [],
};

const UnorderedList = props => (
    <>
        {_.map(props.items, itemText => (
            <View
                key={itemText}
                style={[styles.flexRow, styles.alignItemsStart, styles.ml2]}
            >
                <ExpensifyText style={[styles.mr2]}>{'\u2022'}</ExpensifyText>
                <ExpensifyText>{itemText}</ExpensifyText>
            </View>
        ))}
    </>
);

UnorderedList.displayName = 'UnorderedList';
UnorderedList.propTypes = propTypes;
UnorderedList.defaultProps = defaultProps;

export default UnorderedList;
