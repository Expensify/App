import useOnyx from '@hooks/useOnyx';

import {clearCalendarPickerSelectedDateModifier, setCalendarPickerSelectedDateModifier} from '@libs/actions/CalendarPicker';
import type {SearchDateModifier} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useCallback, useEffect, useRef} from 'react';

type UseSearchYearSelectorParams = {
    /** The currently open Search date-filter sub-view (Custom date/range modifier), or null at the top menu. */
    selectedDateModifier: SearchDateModifier | null;

    /** Restores a sub-view when the popover remounts after the year selector unmounted it. */
    onRestoreDateModifier: (dateModifier: SearchDateModifier) => void;
};

type UseSearchYearSelectorResult = {
    /** Drops the persisted sub-view breadcrumb (call when leaving the sub-view by a route OTHER than the year picker). */
    clearBreadcrumb: () => void;
};

/**
 * The Search-filter layer of the year-selector coordination (see useYearSelector, the calendar-side core). Opening
 * the year picker blurs the Search screen and unmounts the date-filter popover, which would reset the open sub-view
 * (Custom date/range) back to the top menu on return. This hook persists the sub-view as a breadcrumb in Onyx and
 * restores it on remount — but only when a search year write-back is actually pending — so the calendar reopens
 * with the picked year applied instead of dead-ending on the top menu.
 */
function useSearchYearSelector({selectedDateModifier, onRestoreDateModifier}: UseSearchYearSelectorParams): UseSearchYearSelectorResult {
    const [storedDateModifier] = useOnyx(ONYXKEYS.CALENDAR_PICKER_SELECTED_DATE_MODIFIER);
    const [storedYearSelection] = useOnyx(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR);
    const hasRestoredDateModifierRef = useRef(false);

    // Persist the open sub-view so it can be recovered after the year picker unmounts this popover.
    useEffect(() => {
        if (!selectedDateModifier) {
            return;
        }
        setCalendarPickerSelectedDateModifier(selectedDateModifier);
    }, [selectedDateModifier]);

    // On remount, restore the sub-view — but only while a search year write-back is pending (the user picked a year
    // and is returning), so we don't reopen a stale sub-view on an unrelated mount.
    useEffect(() => {
        if (hasRestoredDateModifierRef.current || selectedDateModifier || !storedDateModifier || !storedYearSelection?.contextID.startsWith('search')) {
            return;
        }
        const dateModifierToRestore = Object.values(CONST.SEARCH.DATE_MODIFIERS).find((modifier) => modifier === storedDateModifier);
        if (!dateModifierToRestore) {
            return;
        }
        hasRestoredDateModifierRef.current = true;
        requestAnimationFrame(() => onRestoreDateModifier(dateModifierToRestore));
    }, [storedDateModifier, storedYearSelection, selectedDateModifier, onRestoreDateModifier]);

    const clearBreadcrumb = useCallback(() => clearCalendarPickerSelectedDateModifier(), []);

    return {clearBreadcrumb};
}

export default useSearchYearSelector;
