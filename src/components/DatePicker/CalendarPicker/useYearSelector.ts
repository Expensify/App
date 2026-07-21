import useIsYearSelectorOpen from '@components/DatePicker/useIsYearSelectorOpen';
import OverlayHiddenContext from '@components/Modal/ReanimatedModal/OverlayHiddenContext';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {clearCalendarPickerSelectedYear} from '@libs/actions/CalendarPicker';
import {closeTop} from '@libs/actions/Modal';
import getPlatform from '@libs/getPlatform';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useCallback, useContext, useEffect} from 'react';

type UseYearSelectorParams = {
    /** Stable id used to route a year selected on the year-selector screen back to this CalendarPicker instance. */
    pickerContextID: string;

    /** Whether the host popover/modal should be dismissed (via `Modal.closeTop`) before navigating to the year selector. */
    shouldCloseModalOnYearPickerOpen: boolean;

    /** Called with the year written back from the year-selector screen for this instance's contextID. */
    onYearSelected: (year: number) => void;
};

type UseYearSelectorResult = {
    /** Opens the year-selector screen for this CalendarPicker instance (coordinating the host modal along the way). */
    openYearPicker: (currentYear: number, minYear: number, maxYear: number) => void;

    /**
     * True when this CalendarPicker must hide ITSELF while the year selector is open — i.e. wide-screen web with no
     * ReanimatedModal ancestor to hide (e.g. a picker hosted on a navigation card). When there is a modal ancestor,
     * the modal is asked to hide instead and this stays false.
     */
    shouldSelfHideForYearSelector: boolean;
};

/**
 * Owns everything a CalendarPicker needs to drive the dynamic year-selector screen, keeping that side-effecting
 * logic out of the calendar rendering itself:
 * - subscribes to the year written back from the year-selector screen (matched by `contextID`) and reports it,
 * - coordinates the host popover/modal when opening the selector (dismiss it, or ask a kept-mounted modal to hide),
 * - computes whether the calendar must hide itself when there is no modal ancestor to hide.
 *
 * The wide-screen web coordination exists because the year selector is a @react-navigation route (a z-index-9996
 * RNW modal would paint over it and swallow its clicks). See OverlayHiddenContext.
 */
function useYearSelector({pickerContextID, shouldCloseModalOnYearPickerOpen, onYearSelected}: UseYearSelectorParams): UseYearSelectorResult {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [selectedYearResult] = useOnyx(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR);

    const isYearSelectorOpen = useIsYearSelectorOpen();
    const isDesktopWeb = getPlatform() === CONST.PLATFORM.WEB && !isSmallScreenWidth;
    const shouldHideForYearSelector = isDesktopWeb && isYearSelectorOpen;
    const setModalOverlayHidden = useContext(OverlayHiddenContext);
    // No modal ancestor to hide (e.g. the picker is on a navigation card like ScheduleCall): hide the calendar itself.
    const shouldSelfHideForYearSelector = shouldHideForYearSelector && !setModalOverlayHidden;

    // On wide-screen web the host popover stays mounted while the @react-navigation year-selector RHP is open (so
    // this picker's context is preserved), but its modal — a z-index-9996 portal — would paint over the RHP and
    // swallow its clicks. This picker is what knows the selector opened, so it asks the hosting ReanimatedModal to
    // hide in place via context (and restores it when the selector closes). Narrow/native dismiss the host instead.
    useEffect(() => {
        if (!setModalOverlayHidden) {
            return;
        }
        setModalOverlayHidden(shouldHideForYearSelector);
        return () => setModalOverlayHidden(false);
    }, [shouldHideForYearSelector, setModalOverlayHidden]);

    // When the year-selector screen writes back a selection for this instance, report it and clear the transient
    // result so it isn't re-applied.
    useEffect(() => {
        if (!selectedYearResult || selectedYearResult.contextID !== pickerContextID) {
            return;
        }
        const {year} = selectedYearResult;
        clearCalendarPickerSelectedYear();
        onYearSelected(year);
    }, [selectedYearResult, pickerContextID, onYearSelected]);

    const openYearPicker = useCallback(
        (currentYear: number, minYear: number, maxYear: number) => {
            // Dismiss the popover/modal hosting this CalendarPicker (if any) so the year selector isn't rendered behind it.
            if (shouldCloseModalOnYearPickerOpen) {
                closeTop();
            } else if (isDesktopWeb) {
                // Kept-mounted host: hide the hosting modal before the navigation commits so the year-selector RHP
                // never renders under a still-visible popover frame for a frame. The effect above keeps the hidden
                // state in sync afterwards (and restores it when the selector closes).
                setModalOverlayHidden?.(true);
            }
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.YEAR_SELECTOR.getRoute({contextID: pickerContextID, currentYear, minYear, maxYear})));
        },
        [shouldCloseModalOnYearPickerOpen, isDesktopWeb, setModalOverlayHidden, pickerContextID],
    );

    return {openYearPicker, shouldSelfHideForYearSelector};
}

export default useYearSelector;
export type {UseYearSelectorParams, UseYearSelectorResult};
