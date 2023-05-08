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

    /** Array of disabled indexes. */
    disabledIndexes: PropTypes.arrayOf(PropTypes.number),

    /** The current focused index. */
    focusedIndex: PropTypes.number.isRequired,

    /** The maximum index – provided so that the focus can be sent back to the beginning of the list when the end is reached. */
    maxIndex: PropTypes.number.isRequired,

    /** A callback executed when the focused input changes. */
    onFocusedIndexChanged: PropTypes.func.isRequired,

    /** If this value is true, then we exclude TextArea Node. */
    shouldExcludeTextAreaNodes: PropTypes.bool,
};

const defaultProps = {
    disabledIndexes: [],
    shouldExcludeTextAreaNodes: true,
};

class ArrowKeyFocusManager extends Component {
    componentDidMount() {
        const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
        const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;

        this.unsubscribeArrowUpKey = KeyboardShortcut.subscribe(arrowUpConfig.shortcutKey, () => {
            if (this.props.maxIndex < 0) {
                return;
            }

            const currentFocusedIndex = this.props.focusedIndex > 0 ? this.props.focusedIndex - 1 : this.props.maxIndex;
            let newFocusedIndex = currentFocusedIndex;

            while (this.props.disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex > 0 ? newFocusedIndex - 1 : this.props.maxIndex;
                if (newFocusedIndex === currentFocusedIndex) { // all indexes are disabled
                    return; // no-op
                }
            }

            this.props.onFocusedIndexChanged(newFocusedIndex);
        }, arrowUpConfig.descriptionKey, arrowUpConfig.modifiers, true, false, 0, true, [this.props.shouldExcludeTextAreaNodes && 'TEXTAREA']);

        this.unsubscribeArrowDownKey = KeyboardShortcut.subscribe(arrowDownConfig.shortcutKey, () => {
            if (this.props.maxIndex < 0) {
                return;
            }

            const currentFocusedIndex = this.props.focusedIndex < this.props.maxIndex ? this.props.focusedIndex + 1 : 0;
            let newFocusedIndex = currentFocusedIndex;

            while (this.props.disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex < this.props.maxIndex ? newFocusedIndex + 1 : 0;
                if (newFocusedIndex === currentFocusedIndex) { // all indexes are disabled
                    return; // no-op
                }
            }

            this.props.onFocusedIndexChanged(newFocusedIndex);
        }, arrowDownConfig.descriptionKey, arrowDownConfig.modifiers, true, false, 0, true, [this.props.shouldExcludeTextAreaNodes && 'TEXTAREA']);
    }

    componentWillUnmount() {
        if (this.unsubscribeArrowUpKey) {
            this.unsubscribeArrowUpKey();
        }

        if (this.unsubscribeArrowDownKey) {
            this.unsubscribeArrowDownKey();
        }
    }

    render() {
        return this.props.children;
    }
}

ArrowKeyFocusManager.propTypes = propTypes;
ArrowKeyFocusManager.defaultProps = defaultProps;

export default ArrowKeyFocusManager;
