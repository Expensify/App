import type {AccessibilityState} from 'react-native';

/** On web the checkbox is its own element with its checked state, and ARIA does not allow aria-selected on a button row. */
function getSelectableRowAccessibilityState(_canSelectMultiple: boolean | undefined, _isSelected: boolean): AccessibilityState | undefined {
    return undefined;
}

export default getSelectableRowAccessibilityState;
