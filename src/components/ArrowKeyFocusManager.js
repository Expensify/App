import {useEffect, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import KeyboardShortcut from '../libs/KeyboardShortcut';

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
};

const defaultProps = {
    disabledIndexes: [],
    shouldExcludeTextAreaNodes: true,
};

function ArrowKeyFocusManager(props) {
    const onArrowUpKeyRef = useRef();
    const onArrowDownKeyRef = useRef();
    const mounted = useRef(false);
    const prevMaxIndex = useRef();

    useEffect(() => {
        onArrowUpKeyRef.current = () => {
            if (props.maxIndex < 0) {
                return;
            }

            const currentFocusedIndex = props.focusedIndex > 0 ? props.focusedIndex - 1 : props.maxIndex;
            let newFocusedIndex = currentFocusedIndex;

            while (props.disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex > 0 ? newFocusedIndex - 1 : props.maxIndex;
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return; // no-op
                }
            }
            props.onFocusedIndexChanged(newFocusedIndex);
        };

        onArrowDownKeyRef.current = () => {
            if (props.maxIndex < 0) {
                return;
            }

            const currentFocusedIndex = props.focusedIndex < props.maxIndex ? props.focusedIndex + 1 : 0;
            let newFocusedIndex = currentFocusedIndex;

            while (props.disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex < props.maxIndex ? newFocusedIndex + 1 : 0;
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return; // no-op
                }
            }
            props.onFocusedIndexChanged(newFocusedIndex);
        };
    });

    const onArrowUpKey = useCallback(() => onArrowUpKeyRef.current(), []);
    const onArrowDownKey = useCallback(() => onArrowDownKeyRef.current(), []);

    useEffect(() => {
        const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
        const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;

        const unsubscribeArrowUpKey = KeyboardShortcut.subscribe(arrowUpConfig.shortcutKey, onArrowUpKey, arrowUpConfig.descriptionKey, arrowUpConfig.modifiers, true, false, 0, true, [
            props.shouldExcludeTextAreaNodes && 'TEXTAREA',
        ]);

        const unsubscribeArrowDownKey = KeyboardShortcut.subscribe(
            arrowDownConfig.shortcutKey,
            onArrowDownKey,
            arrowDownConfig.descriptionKey,
            arrowDownConfig.modifiers,
            true,
            false,
            0,
            true,
            [props.shouldExcludeTextAreaNodes && 'TEXTAREA'],
        );

        return function cleanup() {
            unsubscribeArrowUpKey();
            unsubscribeArrowDownKey();
        };
    }, [onArrowDownKey, onArrowUpKey, props.shouldExcludeTextAreaNodes]);

    useEffect(() => {
        if (mounted.current) {
            if (prevMaxIndex.current === props.maxIndex) {
                return;
            }

            if (props.focusedIndex > props.maxIndex) {
                onArrowDownKey();
            }
        } else {
            mounted.current = true;
        }
        prevMaxIndex.current = props.maxIndex;
    });

    return props.children;
}

ArrowKeyFocusManager.propTypes = propTypes;
ArrowKeyFocusManager.defaultProps = defaultProps;

export default ArrowKeyFocusManager;
