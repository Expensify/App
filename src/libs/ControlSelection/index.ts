import type {ControlSelectionModule, SelectionElement} from './types';

/**
 * Block selection on the whole app
 *
 */
function block() {
    document.body.classList.add('disable-select');
}

/**
 * Unblock selection on the whole app
 *
 */
function unblock() {
    document.body.classList.remove('disable-select');
}

/**
 * Block selection on particular element
 */
function blockElement<T>(element?: SelectionElement<T> | null) {
    if (!element) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    element.onselectstart = () => false;
}

/**
 * Unblock selection on particular element
 */
function unblockElement<T>(element?: SelectionElement<T> | null) {
    if (!element) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    element.onselectstart = () => true;
}

const ControlSelection: ControlSelectionModule = {
    block,
    unblock,
    blockElement,
    unblockElement,
};

export default ControlSelection;
