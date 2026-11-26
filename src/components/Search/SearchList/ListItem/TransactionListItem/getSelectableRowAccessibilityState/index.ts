import type GetSelectableRowAccessibilityState from './types';

/** On web the checkbox is its own element with its checked state, and ARIA does not allow aria-selected on a button row. */
const getSelectableRowAccessibilityState: GetSelectableRowAccessibilityState = () => undefined;

export default getSelectableRowAccessibilityState;
