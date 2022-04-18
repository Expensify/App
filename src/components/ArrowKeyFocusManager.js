import _ from 'underscore';
import {Component} from 'react';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import KeyboardShortcut from '../libs/KeyboardShortcut';

const propTypes = {
    /** Children to render. */
    children: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
    ]).isRequired,

    /** The current focused index. */
    focusedIndex: PropTypes.number.isRequired,

    /** The maximum index – provided so that the focus can be sent back to the beginning of the list when the end is reached. */
    maxIndex: PropTypes.number.isRequired,

    /** A callback executed when the focused input changes. */
    onFocusedIndexChanged: PropTypes.func,

    /** A callback executed when the enter key is pressed. */
    onEnterKeyPressed: PropTypes.func,

    /** Should the enter key event bubble? */
    shouldEnterKeyEventBubble: PropTypes.func,
};

const defaultProps = {
    onFocusedIndexChanged: () => {},
    onEnterKeyPressed: undefined,
    shouldEnterKeyEventBubble: () => false,
};

class ArrowKeyFocusManager extends Component {
    componentDidMount() {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
        const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;

        if (this.props.onEnterKeyPressed) {
            this.unsubscribeEnterKey = KeyboardShortcut.subscribe(
                enterConfig.shortcutKey,
                () => this.props.onEnterKeyPressed(this.props.focusedIndex),
                enterConfig.descriptionKey,
                enterConfig.modifiers,
                true,
                () => {
                    const shouldBubble = this.props.shouldEnterKeyEventBubble(this.props.focusedIndex);
                    if (!_.isBoolean(shouldBubble)) {
                        throw new Error('shouldEnterKeyEventBubble prop did not return a boolean');
                    }
                    return shouldBubble;
                },
            );
        }

        this.unsubscribeArrowUpKey = KeyboardShortcut.subscribe(arrowUpConfig.shortcutKey, () => {
            if (this.props.maxIndex <= 1) {
                return;
            }

            let newFocusedIndex = this.props.focusedIndex - 1;

            // Wrap around to the bottom of the list
            if (newFocusedIndex < 0) {
                newFocusedIndex = this.props.maxIndex;
            }

            this.props.onFocusedIndexChanged(newFocusedIndex);
        }, arrowUpConfig.descriptionKey, arrowUpConfig.modifiers, true);

        this.unsubscribeArrowDownKey = KeyboardShortcut.subscribe(arrowDownConfig.shortcutKey, () => {
            if (this.props.maxIndex <= 1) {
                return;
            }

            let newFocusedIndex = this.props.focusedIndex + 1;

            // Wrap around to the top of the list
            if (newFocusedIndex > this.props.maxIndex) {
                newFocusedIndex = 0;
            }

            this.props.onFocusedIndexChanged(newFocusedIndex)
        }, arrowDownConfig.descriptionKey, arrowDownConfig.modifiers, true);
    }

    componentWillUnmount() {
        if (this.unsubscribeEnterKey) {
            this.unsubscribeEnterKey();
        }

        if (this.unsubscribeArrowUpKey) {
            this.unsubscribeArrowUpKey();
        }

        if (this.unsubscribeArrowDownKey) {
            this.unsubscribeArrowDownKey();
        }
    }

    render() {
        return _.isFunction(this.props.children)
            ? this.props.children()
            : this.props.children;
    }
}

ArrowKeyFocusManager.propTypes = propTypes;
ArrowKeyFocusManager.defaultProps = defaultProps;

export default ArrowKeyFocusManager;
