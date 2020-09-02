/**
 * Returns the display name of a component
 * @param {React.Component} component
 * @returns {string}
 */
export default function (component) {
    return (
        component.displayName
        || component.name
        || (typeof component === 'string' && component.length > 0
            ? component
            : 'Unknown')
    );
}
