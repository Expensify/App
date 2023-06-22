import React, {useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Button from './Button';
import ControlSelection from '../libs/ControlSelection';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Callback to inform parent modal with key pressed */
    numberPressed: PropTypes.func.isRequired,

    /** Callback to inform parent modal whether user is long pressing the "<" (backspace) button */
    longPressHandlerStateChanged: PropTypes.func,

    /** Used to locate this view from native classes. */
    nativeID: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    longPressHandlerStateChanged: () => {},
    nativeID: 'numPadView',
};

const padNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '<'],
];

function BigNumberPad(props) {
    const [timer, setTimer] = useState(null);

    /**
     * Handle long press key on number pad.
     * Only handles the '<' key and starts the continuous input timer.
     *
     * @param {String} key
     */
    const handleLongPress = (key) => {
        if (key !== '<') {
            return;
        }

        props.longPressHandlerStateChanged(true);

        const newTimer = setInterval(() => {
            props.numberPressed(key);
        }, 100);
        setTimer(newTimer);
    };

    return (
        <View
            style={[styles.flexColumn, styles.w100]}
            nativeID={props.nativeID}
        >
            {_.map(padNumbers, (row, rowIndex) => (
                <View
                    key={`NumberPadRow-${rowIndex}`}
                    style={[styles.flexRow, styles.mt3]}
                >
                    {_.map(row, (column, columnIndex) => {
                        // Adding margin between buttons except first column to
                        // avoid unccessary space before the first column.
                        const marginLeft = columnIndex > 0 ? styles.ml3 : {};
                        return (
                            <Button
                                key={column}
                                shouldEnableHapticFeedback
                                style={[styles.flex1, marginLeft]}
                                text={column === '<' ? column : props.toLocaleDigit(column)}
                                onLongPress={() => handleLongPress(column)}
                                onPress={() => props.numberPressed(column)}
                                onPressIn={ControlSelection.block}
                                onPressOut={() => {
                                    clearInterval(timer);
                                    ControlSelection.unblock();
                                    props.longPressHandlerStateChanged(false);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                            />
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

BigNumberPad.propTypes = propTypes;
BigNumberPad.defaultProps = defaultProps;
BigNumberPad.displayName = 'BigNumberPad';

export default withLocalize(BigNumberPad);
