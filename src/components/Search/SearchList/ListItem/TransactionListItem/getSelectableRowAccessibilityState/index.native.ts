import type GetSelectableRowAccessibilityState from './types';

/** On native, a row in select mode is read as one element together with its checkbox, so the row carries the selected state. */
const getSelectableRowAccessibilityState: GetSelectableRowAccessibilityState = (canSelectMultiple, isSelected) => (canSelectMultiple ? {selected: isSelected} : undefined);

export default getSelectableRowAccessibilityState;
