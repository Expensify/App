import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import {getBrowser, isMobile} from '@libs/Browser';

import CONST from '@src/CONST';

import getAccessibilityLabel from './getAccessibilityLabel';
import {getItemRole} from './getItemRole';
import {getSelectableState} from './getSelectableState';

type AccessibilityProps = Pick<PressableWithFeedbackProps, 'accessible' | 'role' | 'tabIndex' | 'accessibilityLabel'>;

type CalculatedAccessibilityProps = Pick<PressableWithFeedbackProps, 'role' | 'tabIndex' | 'accessibilityState'> & {
    accessibleAndAccessibilityLabel: Pick<PressableWithFeedbackProps, 'accessible' | 'accessibilityLabel'>;
    ariaCurrent: boolean | undefined;
};

/** Computes the pressable's role, tab index, accessibility state/label and aria-current for a list item row. */
function getListItemAccessibilityProps({
    role,
    tabIndex,
    accessible,
    accessibilityLabel,
    item,
    isFocused,
    canSelectMultiple,
    shouldUseOptionRole,
    isSelected,
}: AccessibilityProps & {
    item: ListItem;
    isFocused?: boolean;
    canSelectMultiple?: boolean;
    shouldUseOptionRole?: boolean;
    isSelected?: boolean;
}) {
    // For single-select lists, use role="option" with aria-selected so screen readers announce "selected"/"not selected".
    // For multi-select (checkbox/radio), keep existing role and state. Navigational lists (shouldUseOptionRole === false)
    // opt out so the row keeps its button role instead of becoming an option with no listbox container.
    const isSelectableOption = shouldUseOptionRole !== false && !canSelectMultiple && role !== CONST.ROLE.CHECKBOX && role !== CONST.ROLE.RADIO;
    const effectiveRole = getItemRole(role, isSelectableOption);

    const isCheckableRole = effectiveRole === CONST.ROLE.CHECKBOX || effectiveRole === CONST.ROLE.RADIO;
    const accessibilityState = isCheckableRole ? {checked: !!isSelected, selected: !!isFocused} : getSelectableState(!!isSelected);
    const ariaCurrent = !isCheckableRole && isSelected && getBrowser() === CONST.BROWSER.CHROME && !isMobile() ? true : undefined;

    if (accessible === false) {
        return {
            role: CONST.ROLE.PRESENTATION,
            tabIndex: -1,
            accessibilityState,
            accessibleAndAccessibilityLabel: {accessible: false},
            ariaCurrent,
        } satisfies CalculatedAccessibilityProps;
    }

    return {
        role: effectiveRole,
        tabIndex,
        accessibilityState,
        accessibleAndAccessibilityLabel: {accessible: undefined, accessibilityLabel: accessibilityLabel ?? getAccessibilityLabel(item)},
        ariaCurrent,
    } satisfies CalculatedAccessibilityProps;
}

export default getListItemAccessibilityProps;
