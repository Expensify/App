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

    /** The initial focused index. Should be an integer >= -1 */
    initialFocusedIndex: PropTypes.number,

    /** The number of items in the list that this component is managing focus for. Should be an integer >= 0 */
    listLength: PropTypes.number,

    /** A callback executed when the focused input changes. */
    onFocusedIndexChanged: PropTypes.func,

    /** A callback executed when the enter key is pressed. */
    onEnterKeyPressed: PropTypes.func,

    /** Should the enter key event bubble? */
    shouldEnterKeyEventBubble: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
};

const defaultProps = {
    initialFocusedIndex: 0,
    listLength: 0,
    onFocusedIndexChanged: () => {},
    onEnterKeyPressed: undefined,
    shouldEnterKeyEventBubble: false,
};

class ArrowKeyFocusManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focusedIndex: props.initialFocusedIndex,
        };
        this.setFocusedIndex = this.setFocusedIndex.bind(this);
        this.shouldEnterKeyEventBubble = this.shouldEnterKeyEventBubble.bind(this);
    }

    componentDidMount() {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
        const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;

        if (this.props.onEnterKeyPressed) {
            this.unsubscribeEnterKey = KeyboardShortcut.subscribe(enterConfig.shortcutKey, () => {
                this.props.onEnterKeyPressed(this.state.focusedIndex);
            }, enterConfig.descriptionKey, enterConfig.modifiers, true, this.shouldEnterKeyEventBubble);
        }

        this.unsubscribeArrowUpKey = KeyboardShortcut.subscribe(arrowUpConfig.shortcutKey, () => {
            if (this.props.listLength <= 1) {
                return;
            }

            this.setState(
                (prevState) => {
                    let newFocusedIndex = prevState.focusedIndex - 1;

                    // Wrap around to the bottom of the list
                    if (newFocusedIndex < 0) {
                        newFocusedIndex = this.props.listLength - 1;
                    }

                    return {focusedIndex: newFocusedIndex};
                },
                () => this.props.onFocusedIndexChanged(this.state.focusedIndex),
            );
        }, arrowUpConfig.descriptionKey, arrowUpConfig.modifiers, true);

        this.unsubscribeArrowDownKey = KeyboardShortcut.subscribe(arrowDownConfig.shortcutKey, () => {
            if (this.props.listLength <= 1) {
                return;
            }

            this.setState(
                (prevState) => {
                    let newFocusedIndex = prevState.focusedIndex + 1;

                    // Wrap around to the top of the list
                    if (newFocusedIndex > this.props.listLength - 1) {
                        newFocusedIndex = 0;
                    }

                    return {focusedIndex: newFocusedIndex};
                },
                () => this.props.onFocusedIndexChanged(this.state.focusedIndex),
            );
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

    /**
     * @returns {Number}
     */
    getFocusedIndex() {
        return this.state.focusedIndex;
    }

    /**
     * Imperatively adjust the focused index.
     *
     * @param {Number} index
     */
    setFocusedIndex(index) {
        this.setState({focusedIndex: index});
    }

    /**
     * @returns {Boolean}
     */
    shouldEnterKeyEventBubble() {
        if (_.isFunction(this.props.shouldEnterKeyEventBubble)) {
            const shouldBubble = this.props.shouldEnterKeyEventBubble(this.state.focusedIndex);
            if (!_.isBoolean(shouldBubble)) {
                throw new Error('shouldEnterKeyEventBubble prop did not return a boolean');
            }
            return shouldBubble;
        }

        return this.props.shouldEnterKeyEventBubble;
    }

    render() {
        return _.isFunction(this.props.children)
            ? this.props.children({focusedIndex: this.state.focusedIndex})
            : this.props.children;
    }
}

ArrowKeyFocusManager.propTypes = propTypes;
ArrowKeyFocusManager.defaultProps = defaultProps;

export default ArrowKeyFocusManager;
