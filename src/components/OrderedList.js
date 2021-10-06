import React from 'react';
import _ from 'underscore';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.string),
};
const defaultProps = {
    items: [],
};

const OrderedList = ({items}) => (
    <>
        {_.map(items, itemText => (
            <View
                key={_.uniqueId(itemText)}
                style={[styles.flexRow, styles.alignItemsStart, styles.ml2]}
            >
                <Text style={[styles.mr2]}>{'\u2022'}</Text>
                <Text>{itemText}</Text>
            </View>
        ))}
    </>
);

OrderedList.displayName = 'OrderedList';
OrderedList.propTypes = propTypes;
OrderedList.defaultProps = defaultProps;

export default OrderedList;
