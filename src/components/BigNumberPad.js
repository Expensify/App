import React from 'react';
import {
    Text, TouchableOpacity, View,
} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    // Callback to inform parent modal with key pressed
    numberPressed: PropTypes.func.isRequired,
};

const padNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '<'],
];

const BigNumberPad = ({numberPressed}) => (
    <View style={[styles.flexColumn, styles.w100]}>
        {_.map(padNumbers, (row, rowIndex) => (
            <View key={`NumberPadRow-${rowIndex}`} style={[styles.flexRow, styles.mt3]}>
                {_.map(row, (column, columnIndex) => {
                    // Adding margin between buttons except first column to
                    // avoid unccessary space before the first column.
                    const marginLeft = columnIndex > 0 ? styles.ml3 : {};
                    return (
                        <TouchableOpacity
                            key={column}
                            style={[styles.flex1, styles.button, marginLeft]}
                            onPress={() => numberPressed(column)}
                        >
                            <Text style={[styles.buttonText]}>
                                {column}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        ))}
    </View>
);

BigNumberPad.propTypes = propTypes;
BigNumberPad.displayName = 'BigNumberPad';

export default BigNumberPad;
