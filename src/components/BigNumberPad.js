import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import ExpensifyButton from './ExpensifyButton';
import ControlSelection from '../libs/ControlSelection';

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

class BigNumberPad extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timer: null,
        };
    }

    /**
     * Handle long press key on number pad.
     * Only handles the '<' key and starts the continuous input timer.
     *
     * @param {String} key
     */
    handleLongPress(key) {
        // Only handles deleting.
        if (key !== '<') {
            return;
        }
        const timer = setInterval(() => {
            this.props.numberPressed(key);
        }, 100);
        this.setState({timer});
    }

    render() {
        return (
            <View style={[styles.flexColumn, styles.w100]}>
                {_.map(padNumbers, (row, rowIndex) => (
                    <View key={`NumberPadRow-${rowIndex}`} style={[styles.flexRow, styles.mt3]}>
                        {_.map(row, (column, columnIndex) => {
                            // Adding margin between buttons except first column to
                            // avoid unccessary space before the first column.
                            const marginLeft = columnIndex > 0 ? styles.ml3 : {};
                            return (
                                <ExpensifyButton
                                    key={column}
                                    style={[styles.flex1, marginLeft]}
                                    text={column}
                                    onLongPress={() => this.handleLongPress(column)}
                                    onPress={() => this.props.numberPressed(column)}
                                    onPressIn={ControlSelection.block}
                                    onPressOut={() => {
                                        clearInterval(this.state.timer);
                                        ControlSelection.unblock();
                                    }}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    }
}


BigNumberPad.propTypes = propTypes;

export default BigNumberPad;
