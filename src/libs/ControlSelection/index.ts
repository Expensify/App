import ControlSelectionModule from './types';
import CustomRefObject from '../../types/utils/CustomRefObject';

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
function blockElement<T>(ref?: CustomRefObject<T> | null) {
    if (!ref) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    ref.onselectstart = () => false;
}

/**
 * Unblock selection on particular element
 */
function unblockElement<T>(ref?: CustomRefObject<T> | null) {
    if (!ref) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    ref.onselectstart = () => true;
}

const ControlSelection: ControlSelectionModule = {
    block,
    unblock,
    blockElement,
    unblockElement,
};

export default ControlSelection;
