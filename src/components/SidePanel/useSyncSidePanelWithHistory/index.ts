import {useNavigationState} from '@react-navigation/native';
import {useEffect} from 'react';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';

function toggleSidePanelWithHistory(isVisible: boolean) {
    Navigation.isNavigationReady().then(() => {
        navigationRef.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY,
            payload: {isVisible},
        });
    });
}

export default function useSyncSidePanelWithHistory() {
    const {shouldHideSidePanel} = useSidePanelState();
    const {closeSidePanel, openSidePanel} = useSidePanelActions();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const lastHistoryEntry = useNavigationState((state) => state?.history?.at(-1));
    const previousLastHistoryEntry = usePrevious(lastHistoryEntry);

    useEffect(() => {
        // If the window width has been expanded and the modal is displayed, remove its history entry.
        // The side panel is only synced with the history when it's displayed as RHP.
        if (!shouldHideSidePanel && isExtraLargeScreenWidth) {
            toggleSidePanelWithHistory(false);
            return;
        }

        // When shouldHideSidePanel changes, synchronize the side panel with the browser history.
        toggleSidePanelWithHistory(!shouldHideSidePanel);
    }, [shouldHideSidePanel, isExtraLargeScreenWidth]);

    useEffect(() => {
        // The side panel is synced with the browser history only when displayed in RHP.
        if (isExtraLargeScreenWidth) {
            return;
        }

        const hasHistoryChanged = previousLastHistoryEntry !== lastHistoryEntry;

        // If nothing has changed in the browser history, do nothing.
        if (!hasHistoryChanged) {
            return;
        }

        const hasSidePanelBeenClosed = previousLastHistoryEntry === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL;

        // If the side panel history entry is not the last one and the modal is displayed, close it.
        if (hasSidePanelBeenClosed && !shouldHideSidePanel) {
            closeSidePanel();
            return;
        }

        const hasSidePanelBeenOpened = lastHistoryEntry === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL;

        // If the side panel history entry is the last one and the modal is not displayed, open it.
        if (hasSidePanelBeenOpened && shouldHideSidePanel) {
            openSidePanel();
        }
    }, [closeSidePanel, lastHistoryEntry, previousLastHistoryEntry, openSidePanel, shouldHideSidePanel, isExtraLargeScreenWidth]);
}
