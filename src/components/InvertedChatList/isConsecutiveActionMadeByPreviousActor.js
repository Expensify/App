/**
 * Returns true when the report action immediately before the
 * specified index is a comment made by the same actor who who
 * is leaving a comment in the action at the specified index.
 * Also checks to ensure that the comment is not too old to
 * be considered part of the same comment
 *
 * @param {Object} params
 * @param {Array} params.actions - list of actions
 * @param {Number} params.index - index of the comment item in state to check
 * @param {Boolean} params.reversed - are the actions reversed?
 *
 * @return {Boolean}
 */
export default ({actions, index, reversed = false}) => {
    const reportActions = reversed
        ? actions.slice().reverse()
        : actions;

    const previousAction = reversed
        ? reportActions[index + 1]
        : reportActions[index - 1];

    const currentAction = reportActions[index];

    // It's OK for there to be no previous action, and in that case, false will be returned
    // so that the comment isn't grouped
    if (!currentAction || !previousAction) {
        return false;
    }

    // Comments are only grouped if they happen within 5 minutes of each other
    if (currentAction.action.timestamp - previousAction.action.timestamp > 300) {
        return false;
    }

    return currentAction.action.actorEmail === previousAction.action.actorEmail;
}
