const PASSWORD_AUTOCOMPLETE_TYPE = 'password';
const NEW_PASSWORD_AUTOCOMPLETE_TYPE = 'password-new';
const ACCESSIBILITY_ROLE_FORM = 'none';

/**
 * Gets the x,y position of the passed in component for the purpose of anchoring another component to it.
 *
 * @param anchorComponent
 * @return {Promise<unknown>}
 */
function calculateAnchorPosition(anchorComponent) {
    return new Promise((resolve) => {
        if (!anchorComponent) {
            return resolve({horizontal: 0, vertical: 0});
        }
        anchorComponent.measureInWindow((x, y, width) => resolve({horizontal: x + width, vertical: y}));
    });
}

export {PASSWORD_AUTOCOMPLETE_TYPE, ACCESSIBILITY_ROLE_FORM, NEW_PASSWORD_AUTOCOMPLETE_TYPE, calculateAnchorPosition};
