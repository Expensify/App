/**
 * Returns the display name of a component
 *
 * @param {object} component
 * @returns {string}
 */
export default function getComponentDisplayName(component) {
    return component.displayName || component.name || 'Component';
}
