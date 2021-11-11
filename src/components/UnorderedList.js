import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
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
                <Text style={[styles.mr2]}>{'\u2022'}</Text>
                <Text>{itemText}</Text>
            </View>
        ))}
    </>
);

UnorderedList.displayName = 'UnorderedList';
UnorderedList.propTypes = propTypes;
UnorderedList.defaultProps = defaultProps;

export default UnorderedList;
