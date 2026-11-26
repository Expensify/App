import type {AccessibilityState} from 'react-native';

/** On native, a row in select mode is read as one element together with its checkbox, so the row carries the selected state. */
function getSelectableRowAccessibilityState(canSelectMultiple: boolean | undefined, isSelected: boolean): AccessibilityState | undefined {
    return canSelectMultiple ? {selected: isSelected} : undefined;
}

export default getSelectableRowAccessibilityState;
