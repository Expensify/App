/**
 * A collection of HTML click actions that can be triggered from rendered <clickable> tags.
 *
 * Each key represents the id attribute of a <clickable> tag in the rendered HTML.
 * When the user clicks that tag, the corresponding function is executed.
 */

type ClickableAction = () => void | Promise<void>;

const HTMLClickableActions = new Map<string, ClickableAction>();

/** Register an HTML clickable action. Returns a cleanup function that removes it. */
function setHTMLClickableAction(id: string, action: ClickableAction) {
    if (!id) {
        return () => {};
    }
    HTMLClickableActions.set(id, action);
    return () => removeHTMLClickableAction(id);
}

/** Remove previously registered action from HTMLClickableActions. */
function removeHTMLClickableAction(id: string) {
    if (!id) {
        return;
    }
    HTMLClickableActions.delete(id);
}

/** Get a registered action by id. */
function getHTMLClickableAction(id: string): ClickableAction | undefined {
    if (!id) {
        return undefined;
    }
    return HTMLClickableActions.get(id);
}

export {setHTMLClickableAction, removeHTMLClickableAction, getHTMLClickableAction};

export type {ClickableAction};
