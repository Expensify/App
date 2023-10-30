import PropTypes from 'prop-types';
import {Component} from 'react';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';

const propTypes = {
    /** Children to render. */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

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

    /** If this value is true, then the arrow down callback would be triggered when the max index is exceeded */
    shouldResetIndexOnEndReached: PropTypes.bool,
};

const defaultProps = {
    disabledIndexes: [],
    shouldExcludeTextAreaNodes: true,
    shouldResetIndexOnEndReached: true,
};

class ArrowKeyFocusManager extends Component {
    componentDidMount() {
        const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
        const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;

        this.onArrowUpKey = this.onArrowUpKey.bind(this);
        this.onArrowDownKey = this.onArrowDownKey.bind(this);

        this.unsubscribeArrowUpKey = KeyboardShortcut.subscribe(arrowUpConfig.shortcutKey, this.onArrowUpKey, arrowUpConfig.descriptionKey, arrowUpConfig.modifiers, true, false, 0, true, [
            this.props.shouldExcludeTextAreaNodes && 'TEXTAREA',
        ]);

        this.unsubscribeArrowDownKey = KeyboardShortcut.subscribe(
            arrowDownConfig.shortcutKey,
            this.onArrowDownKey,
            arrowDownConfig.descriptionKey,
            arrowDownConfig.modifiers,
            true,
            false,
            0,
            true,
            [this.props.shouldExcludeTextAreaNodes && 'TEXTAREA'],
        );
    }

    componentDidUpdate(prevProps) {
        if (prevProps.maxIndex === this.props.maxIndex) {
            return;
        }
        if (this.props.focusedIndex > this.props.maxIndex && this.props.shouldResetIndexOnEndReached) {
            this.onArrowDownKey();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribeArrowUpKey) {
            this.unsubscribeArrowUpKey();
        }

        if (this.unsubscribeArrowDownKey) {
            this.unsubscribeArrowDownKey();
        }
    }

    onArrowUpKey() {
        if (this.props.maxIndex < 0) {
            return;
        }

        const currentFocusedIndex = this.props.focusedIndex > 0 ? this.props.focusedIndex - 1 : this.props.maxIndex;
        let newFocusedIndex = currentFocusedIndex;

        while (this.props.disabledIndexes.includes(newFocusedIndex)) {
            newFocusedIndex = newFocusedIndex > 0 ? newFocusedIndex - 1 : this.props.maxIndex;
            if (newFocusedIndex === currentFocusedIndex) {
                // all indexes are disabled
                return; // no-op
            }
        }

        this.props.onFocusedIndexChanged(newFocusedIndex);
    }

    onArrowDownKey() {
        if (this.props.maxIndex < 0) {
            return;
        }

        const currentFocusedIndex = this.props.focusedIndex < this.props.maxIndex ? this.props.focusedIndex + 1 : 0;
        let newFocusedIndex = currentFocusedIndex;

        while (this.props.disabledIndexes.includes(newFocusedIndex)) {
            newFocusedIndex = newFocusedIndex < this.props.maxIndex ? newFocusedIndex + 1 : 0;
            if (newFocusedIndex === currentFocusedIndex) {
                // all indexes are disabled
                return; // no-op
            }
        }

        this.props.onFocusedIndexChanged(newFocusedIndex);
    }

    render() {
        return this.props.children;
    }
}

ArrowKeyFocusManager.propTypes = propTypes;
ArrowKeyFocusManager.defaultProps = defaultProps;

export default ArrowKeyFocusManager;
