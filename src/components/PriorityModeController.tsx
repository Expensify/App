import {useEffect, useMemo, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import {setFocusModeNotification} from '@libs/actions/PriorityMode';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {isReportParticipant, isValidReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import Log from '@libs/Log';
import navigationRef from "@libs/Navigation/navigationRef";
import { useNavigation } from "@react-navigation/native";

export default function PriorityModeController() {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID, canBeMissing: true});
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    const [isInFocusMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {selector: (priorityMode) => priorityMode === CONST.PRIORITY_MODE.GSD, canBeMissing: true});
    const [hasTriedFocusMode] = useOnyx(ONYXKEYS.NVP_TRY_FOCUS_MODE, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const currentRouteName = useCurrentRouteName();

    const validReportCount = useMemo(() => {
        let count = 0;
        Object.values(allReports ?? {}).forEach((report) => {
            if (!isValidReport(report) || !isReportParticipant(accountID ?? CONST.DEFAULT_NUMBER_ID, report)) {
                return;
            }

            count++;
        });
        return count;
    }, [accountID, allReports]);

    // We set this when we have finally auto-switched the user of #focus mode to prevent duplication.
    const hasSwitched = useRef(false);

    // Listen for state changes and trigger the #focus mode when appropriate
    useEffect(() => {
        if (hasSwitched.current || !accountID || isLoadingReportData === true || isInFocusMode === true || hasTriedFocusMode === true) {
            return;
        }

        if (validReportCount < CONST.REPORT.MAX_COUNT_BEFORE_FOCUS_UPDATE) {
            Log.info('[PriorityModeController] Not switching user to focus mode as they do not have enough reports', false, {validReportCount});
            return;
        }

        // We wait for the user to navigate back to the homescreen before triggering this switch 
        const isNarrowLayout = getIsNarrowLayout();
        if ((isNarrowLayout && currentRouteName !== SCREENS.HOME) || (!isNarrowLayout && currentRouteName !== SCREENS.REPORT)) {
            Log.info("[PriorityModeController] Not switching user to focus mode as they aren't on the homescreen", false, {validReportCount, currentRouteName});
            return;
        }

        Log.info('[PriorityModeController] Switching user to focus mode', false, {validReportCount, hasTriedFocusMode, isInFocusMode, currentRouteName});
        setFocusModeNotification(true);
        hasSwitched.current = true;
    }, [accountID, currentRouteName, hasTriedFocusMode, isInFocusMode, isLoadingReportData, validReportCount]);

    return null;
}

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
