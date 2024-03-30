import {Component} from 'react';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';
import {arrowKeyFocusManagerDefaultProps, arrowKeyFocusManagerPropTypes} from './propTypes';

class BaseArrowKeyFocusManager extends Component {
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
        if (this.props.maxIndex < 0 || !this.props.isFocused) {
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
        if (this.props.maxIndex < 0 || !this.props.isFocused) {
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

BaseArrowKeyFocusManager.propTypes = arrowKeyFocusManagerPropTypes;
BaseArrowKeyFocusManager.defaultProps = arrowKeyFocusManagerDefaultProps;

export default BaseArrowKeyFocusManager;
