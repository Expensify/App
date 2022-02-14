import _ from 'underscore';
import {Component} from 'react';
import PropTypes from 'prop-types';
import * as PropTypeUtils from '../libs/PropTypeUtils';
import CONST from '../CONST';
import KeyboardShortcut from '../libs/KeyboardShortcut';

const propTypes = {
    children: PropTypes.node.isRequired,
    initialFocusedIndex: PropTypeUtils.wholeNumberPropType,
    listLength: PropTypeUtils.wholeNumberPropType,
    onFocusedIndexChanged: PropTypes.func,
    onEnterKeyPressed: PropTypes.func,
};

const defaultProps = {
    initialFocusedIndex: 0,
    listLength: 0,
    onFocusedIndexChanged: () => {},
    onEnterKeyPressed: () => {},
};

class ArrowKeyFocusManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focusedIndex: props.initialFocusedIndex,
        };
    }

    componentDidMount() {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
        const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;

        this.unsubscribeEnterKey = KeyboardShortcut.subscribe(enterConfig.shortcutKey, () => {
            this.props.onEnterKeyPressed(this.state.focusedIndex);
        }, enterConfig.descriptionKey, enterConfig.modifiers, true);

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

    render() {
        return _.isFunction(this.props.children)
            ? this.props.children({focusedIndex: this.state.focusedIndex})
            : this.props.children;
    }
}

ArrowKeyFocusManager.propTypes = propTypes;
ArrowKeyFocusManager.defaultProps = defaultProps;

export default ArrowKeyFocusManager;
