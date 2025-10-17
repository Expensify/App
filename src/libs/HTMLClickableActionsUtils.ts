/**
 * A collection of HTML click actions that can be triggered from rendered <clickable> tags.
 *
 * Each key represents the id attribute of a <clickable> tag in the rendered HTML.
 * When the user click that tag, the corresponding function is executed.
 */

const HTMLClickableActions: Record<string, () => void | Promise<void>> = {};

export default HTMLClickableActions;
