import React, {forwardRef} from 'react';
import TextInputWithFocusStyles from './TextInputWithFocusStyles';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

const propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyPress: PropTypes.func,
    onEnterPress: PropTypes.func,
    onBackspacePress: PropTypes.func,
    onArrowDownPress: PropTypes.func,
    onArrowUpPress: PropTypes.func,
    onEscapePress: PropTypes.func,
};

const defaultProps = {
    value: '',
    onChange: () => {},
    onFocus: () => {},
    onKeyPress: () => {},
    onEnterPress: () => {},
    onBackspacePress: () => {},
    onArrowDownPress: () => {},
    onArrowUpPress: () => {},
    onEscapePress: () => {},
};

class ChatSearchInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    /**
     * Delegate key presses to specific callbacks
     *
     * @param {SyntheticEvent} e
     */
    handleKeyPress(e) {
        switch (e.nativeEvent.key) {
            case 'Enter':
                this.props.onEnterPress();
                e.preventDefault();
                break;

            case 'Backspace':
                this.props.onBackspacePress();
                break;

            case 'ArrowDown':
                this.props.onArrowDownPress();
                e.preventDefault();
                break;

            case 'ArrowUp':
                this.props.onArrowUpPress();
                e.preventDefault();
                break;

            case 'Tab':
            case 'Escape':
                this.props.onEscapePress();
                break;

            default:
                this.props.onFocus(e);
        }
    }

    render() {
        return (
            <TextInputWithFocusStyles
                styleFocusIn={[styles.textInputReversedFocus]}
                ref={this.props.innerRef}
                style={[styles.textInput, styles.flex1]}
                value={this.props.value}
                onChangeText={this.props.onChange}
                onFocus={this.props.onFocus}
                onKeyPress={this.handleKeyPress}
                placeholder={this.props.placeholder}
                placeholderTextColor={themeColors.textSupporting}
            />
        );
    }
}

ChatSearchInput.propTypes = propTypes;
ChatSearchInput.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    <ChatSearchInput {...props} innerRef={ref} />
));
