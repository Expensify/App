import type {AccessibilityState} from 'react-native';

type GetSelectableRowAccessibilityState = (canSelectMultiple: boolean | undefined, isSelected: boolean) => AccessibilityState | undefined;

export default GetSelectableRowAccessibilityState;
