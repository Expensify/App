import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import CONST from '../CONST';
import TextInput from './TextInput';

const propTypes = {
    /** Name attribute for the input */
    name: PropTypes.string,

    /** Input value */
    value: PropTypes.string,

    /** Should the input auto focus? */
    autoFocus: PropTypes.bool,

    /** Whether we should wait before focusing the TextInput, useful when using transitions  */
    shouldDelayFocus: PropTypes.bool,

    /** A ref to forward the current input */
    forwardedRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
    ]),

    /** Function to call when the input is changed  */
    onChange: PropTypes.func,

    /** Function to call when the input is submitted or fully complete */
    onSubmit: PropTypes.func,
};

const defaultProps = {
    value: undefined,
    name: '',
    autoFocus: true,
    forwardedRef: undefined,
    shouldDelayFocus: false,
    onChange: () => {},
    onSubmit: () => {},
};

class MagicCodeInput extends React.PureComponent {
    constructor(props) {
        super(props);

        this.inputRefs = {};
        this.state = {
            focusedIndex: 0,
            numbers: props.value ? this._decomposeString(props.value) : []
        };
    }

    componentDidMount() {
        if (!this.props.autoFocus) {
            return;
        }

        let focusElIndex = _.findIndex(this.state.numbers, e => e === undefined);
        focusElIndex = focusElIndex === -1 ? 0 : focusElIndex;

        if (this.props.shouldDelayFocus) {
            this.focusTimeout = setTimeout(() => this.updateFocus(focusElIndex), CONST.ANIMATED_TRANSITION);
            return;
        }
        this.updateFocus(focusElIndex);
    }

    _decomposeString(value) {
        return value.trim().split('');
    }

    _composeToString(value) {
        return _.filter(value, v => v !== undefined).join('');
    }

    /**
     * Focuses on the input at the given index and updates the
     * forwarded reference.
     * 
     * @param {number} index The index of the input to focus on. 
     * @returns {void}
     */
    updateFocus(index) {
        if (index >= Object.keys(this.inputRefs).length) {
            return;
        }
        if (!this.inputRefs[index]) {
            return;
        }

        this.inputRefs[index].focus();

        // Update the ref with the currently focused input
        if (!this.props.forwardedRef) {
            return;
        }
        this.props.forwardedRef(this.inputRefs[index]);
    }

    /**
     * Updates the input value on the given index.
     * 
     * @param {string} value The value written in the input. 
     * @param {*} index The index of the input changed.
     * @param {*} callback Function to be executed after the state changes.
     */
    updateValue(value, index, callback) {
        this.setState(prevState => {
            const numbers = [...prevState.numbers];
            numbers[index] = value;
            return { ...prevState, numbers, focusedIndex: index };
        }, callback);
    }

    /**
     * Updates the value of the input and focus on the next one,
     * taking into consideration if the value added is bigger
     * than one character (quick typing or pasting content).
     * 
     * @param {string} value The value written in the input
     * @param {number} index The index of the input changed
     * @returns {void} 
     */
    onChange(value, index) {
        if (_.isUndefined(value) || _.isEmpty(value)) {
            return;
        }

        // If there's a bigger value written, for example by pasting the input,
        // it spreads the string content through all the inputs and focus on the last
        // input with a value or the next empty input, if it exists
        if (value.length > 1) {
            const numbersArr = this._decomposeString(value);
            this.setState(prevState => {
                const numbers = [...prevState.numbers.slice(0, index), ...numbersArr.slice(0, CONST.MAGIC_CODE_NUMBERS - index)];
                return { numbers };
            }, () => {
                this.updateFocus(Math.min(index + numbersArr.length, Object.keys(this.inputRefs).length - 1));
                this.props.onChange(this._composeToString(this.state.numbers));
            });
            
        } else {
            this.updateValue(value, index, () => {
                this.updateFocus(index + 1);
                this.props.onChange(this._composeToString(this.state.numbers));
            });
        }
    }

    /**
     * Handles logic related to certain key presses (Backspace, Enter,
     * ArrowLeft, ArrowRight) that cause value and focus change.
     * 
     * @param {*} event The event passed by the key press
     * @param {*} index The index of the input where the event occurred
     */
    onKeyPress({nativeEvent: {key: keyValue}}, index) {
        // Deletes the existing number on the focused input,
        // if there is no number, it will delete the previous input
        if (keyValue === 'Backspace') {
            if (!_.isUndefined(this.state.numbers[index])) {
                this.updateValue(undefined, index);
            } else {
                this.updateValue(undefined, index - 1, () => this.updateFocus(this.state.focusedIndex));
            }
        } else if (keyValue === 'Enter') {
            this.props.onSubmit(this.state.numbers.join(''));
        } else if (keyValue === 'ArrowLeft') {
            this.setState(prevState => ({ ...prevState, focusedIndex: index - 1}), () => this.updateFocus(this.state.focusedIndex));
        } else if (keyValue === 'ArrowRight') {
            this.setState(prevState => ({ ...prevState, focusedIndex: index + 1}), () => this.updateFocus(this.state.focusedIndex));
        }
    }

    render() {
        return (
            <View style={[styles.flexRow, styles.p0, styles.justifyContentBetween]}>
                {_.map(Array.from(Array(CONST.MAGIC_CODE_NUMBERS).keys()), i => (
                    <TextInput
                        key={i}
                        autoGrow
                        inputMode="numeric"
                        ref={(ref) => { this.inputRefs[i] = ref; }}
                        name={this.props.name}

                        // Only allows one character to be entered on the last input
                        // so that there's no flickering when more than one number
                        // is added
                        maxLength={i === CONST.MAGIC_CODE_NUMBERS - 1 ? 1 : 1}
                        blurOnSubmit={false}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        value={this.state.numbers[i] === undefined ? '' : this.state.numbers[i].toString()}
                        inputStyle={[styles.iouAmountTextInput, styles.p1, styles.textAlignCenter, styles.w15]}
                        onFocus={() => this.updateFocus(i)}
                        onChangeText={value => this.onChange(value, i)}
                        onKeyPress={ev => this.onKeyPress(ev, i)}
                    />
                ))}
            </View>
        )
    }
}

MagicCodeInput.propTypes = propTypes;
MagicCodeInput.defaultProps = defaultProps;
MagicCodeInput.displayName = 'MagicCodeInput';

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <MagicCodeInput {...props} forwardedRef={ref} />
));
