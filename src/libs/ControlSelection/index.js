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

export default {
    block,
    unblock,
};
