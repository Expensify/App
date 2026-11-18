/**
 * There is no `document` on native, and the cancel-confirmation modal there doesn't close on an Escape `keyup`,
 * so there is nothing to suppress.
 */
function suppressNextEscapeKeyup() {}

export default suppressNextEscapeKeyup;
