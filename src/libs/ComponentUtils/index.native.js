const PASSWORD_AUTOCOMPLETE_TYPE = 'password';
const ACCESSIBILITY_ROLE_FORM = 'none';

/**
 * Skip adding browser only attributes to underlying Nodes which will result in an runtime error.
 */
function setBrowserAttributes() {}

export {
    PASSWORD_AUTOCOMPLETE_TYPE,
    ACCESSIBILITY_ROLE_FORM,
    setBrowserAttributes,
};
