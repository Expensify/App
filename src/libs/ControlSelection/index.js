import _ from 'underscore';

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
 * @param {Element} ref
 */
function blockElement(ref) {
    if (_.isNull(ref)) { return; }

    // eslint-disable-next-line no-param-reassign
    ref.onselectstart = () => false;
}

/**
 * Unblock selection on particular element
 * @param {Element} ref
 */
function unblockElement(ref) {
    if (_.isNull(ref)) { return; }

    // eslint-disable-next-line no-param-reassign
    ref.onselectstart = () => true;
}

export default {
    block,
    unblock,
    blockElement,
    unblockElement,
};
