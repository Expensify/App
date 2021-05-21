import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Button from './Button';

const propTypes = {
    /** Callback to inform parent modal with key pressed */
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
                        <Button
                            key={column}
                            style={[styles.flex1, marginLeft]}
                            text={column}
                            onPress={() => numberPressed(column)}
                        />
                    );
                })}
            </View>
        ))}
    </View>
);

BigNumberPad.propTypes = propTypes;
BigNumberPad.displayName = 'BigNumberPad';

export default BigNumberPad;
