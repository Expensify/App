import React, {PureComponent} from 'react';
import {
    Text, TouchableOpacity, View,
} from 'react-native';
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

class BigNumberPad extends PureComponent {
    /**
     * Creates set of buttons for given row
     *
     * @param {number} row
     * @returns {View}
     */
    createNumberPadRow(row) {
        const self = this;
        const numberPadRow = padNumbers[row].map((column, index) => self.createNumberPadButton(row, index));
        return (
            <View key={row} style={[styles.flexRow, styles.mt3]}>
                {numberPadRow}
            </View>
        );
    }

    /**
     * Creates a button for given row and column
     *
     * @param {number} row
     * @param {number} column
     * @returns {View}
     */
    createNumberPadButton(row, column) {
        // Adding margin between buttons except first column to
        // avoid unccessary space before the first column.
        const marginLeft = column > 0 ? styles.ml3 : {};
        return (
            <TouchableOpacity
                key={padNumbers[row][column]}
                style={[styles.flex1, styles.button, marginLeft]}
                onPress={() => this.props.numberPressed(padNumbers[row][column])}
            >
                <Text style={[styles.buttonText]}>
                    {padNumbers[row][column]}
                </Text>
            </TouchableOpacity>
        );
    }

    render() {
        const self = this;
        const numberPad = padNumbers.map((row, index) => self.createNumberPadRow(index));
        return (
            <View style={[styles.flexColumn, styles.w100]}>
                {numberPad}
            </View>
        );
    }
}

BigNumberPad.propTypes = propTypes;
BigNumberPad.displayName = 'BigNumberPad';

export default BigNumberPad;
