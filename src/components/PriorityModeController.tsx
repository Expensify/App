import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import {updateChatPriorityMode} from '@libs/actions/User';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import FocusModeNotification from './FocusModeNotification';

const isInFocusModeSelector = (priorityMode: OnyxEntry<ValueOf<typeof CONST.PRIORITY_MODE>>) => priorityMode === CONST.PRIORITY_MODE.GSD;

/**
 * Thin wrapper that reads the sidebar context and passes only the LHN report
 * count to the memoized inner component. The sidebar context value changes
 * frequently (new object reference on every provider re-render), so isolating
 * the context read here prevents the heavier inner component from re-rendering
 * unless the count actually changes.
 */
export default function PriorityModeController() {
    const {orderedReportIDs} = useSidebarOrderedReportsState();
    return <PriorityModeControllerInner lhnReportCount={orderedReportIDs.length} />;
}

/**
 * This component is used to automatically switch a user into #focus mode when they exceed a certain number of reports.
 * We do this primarily for performance reasons. Similar to the "Welcome action" we must wait for a number of things to
 * happen when the user signs in or refreshes the page:
 *
 *  - NVP that tracks whether they have already been switched over. We only do this once.
 *  - Priority mode NVP (that dictates the ordering/filtering logic of the LHN)
 *  - Reports to load (in ReconnectApp or OpenApp). As we check the count of the reports to determine whether the
 *    user is eligible to be automatically switched.
 *
 */
const PriorityModeControllerInner = React.memo(function PriorityModeControllerInner({lhnReportCount}: {lhnReportCount: number}) {
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [isInFocusMode, isInFocusModeMetadata] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {selector: isInFocusModeSelector});
    const [hasTriedFocusMode, hasTriedFocusModeMetadata] = useOnyx(ONYXKEYS.NVP_TRY_FOCUS_MODE);
    const currentRouteName = useCurrentRouteName();
    const [shouldShowModal, setShouldShowModal] = useState(false);
    const closeModal = useCallback(() => setShouldShowModal(false), []);

    // We set this when we have finally auto-switched the user of #focus mode to prevent duplication.
    const hasSwitched = useRef(false);

    // Listen for state changes and trigger the #focus mode when appropriate
    useEffect(() => {
        // Wait for Onyx state to fully load
        if (
            isLoadingReportData !== false ||
            isLoadingOnyxValue(isInFocusModeMetadata, hasTriedFocusModeMetadata) ||
            typeof isInFocusMode !== 'boolean' ||
            typeof hasTriedFocusMode !== 'boolean'
        ) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (hasSwitched.current || isInFocusMode || hasTriedFocusMode) {
            return;
        }

        if (lhnReportCount < CONST.REPORT.MAX_COUNT_BEFORE_FOCUS_UPDATE) {
            Log.info('[PriorityModeController] Not switching user to focus mode as they do not have enough reports', false, {lhnReportCount});
            return;
        }

        // We wait for the user to navigate back to the home screen before triggering this switch
        const isNarrowLayout = getIsNarrowLayout();
        if ((isNarrowLayout && currentRouteName !== SCREENS.INBOX) || (!isNarrowLayout && currentRouteName !== SCREENS.REPORT)) {
            Log.info("[PriorityModeController] Not switching user to focus mode as they aren't on the home screen", false, {lhnReportCount, currentRouteName});
            return;
        }

        Log.info('[PriorityModeController] Switching user to focus mode', false, {lhnReportCount, hasTriedFocusMode, isInFocusMode, currentRouteName});
        updateChatPriorityMode(CONST.PRIORITY_MODE.GSD, true);
        requestAnimationFrame(() => {
            setShouldShowModal(true);
        });
        hasSwitched.current = true;
    }, [currentRouteName, hasTriedFocusMode, hasTriedFocusModeMetadata, isInFocusMode, isInFocusModeMetadata, isLoadingReportData, lhnReportCount]);

    useEffect(() => {
        if (!shouldShowModal) {
            return;
        }
        const isNavigatingToPriorityModePage = currentRouteName === SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE;

        // Hide focus modal when settings button is pressed from the prompt.
        if (isNavigatingToPriorityModePage) {
            setShouldShowModal(false);
        }
    }, [currentRouteName, shouldShowModal]);

    return shouldShowModal ? <FocusModeNotification onClose={closeModal} /> : null;
});

/**
 * A funky but reliable way to subscribe to screen changes.
 */
function useCurrentRouteName() {
    const navigation = useNavigation();
    const [currentRouteName, setCurrentRouteName] = useState<string | undefined>('');

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            setCurrentRouteName(navigationRef.getCurrentRoute()?.name);
        });
        return () => unsubscribe();
    }, [navigation]);

    return currentRouteName;
}
