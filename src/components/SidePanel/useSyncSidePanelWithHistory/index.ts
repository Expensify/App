import {useNavigationState} from '@react-navigation/native';
import {useEffect} from 'react';
import useAddHistoryEntry from '@hooks/useAddHistoryEntry';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanel from '@hooks/useSidePanel';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';

export default function useSyncSidePanelWithHistory() {
    const {closeSidePanel, openSidePanel, shouldHideSidePanel} = useSidePanel();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const lastHistoryEntry = useNavigationState((state) => state?.history?.at(-1));
    const previousLastHistoryEntry = usePrevious(lastHistoryEntry);
    const [addSidePanelHistoryEntry] = useAddHistoryEntry(CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL);

    useEffect(() => {
        // If the window width has been expanded and the modal is displayed, remove its history entry.
        // The side panel is only synced with the history when it's displayed as RHP.
        if (!shouldHideSidePanel && isExtraLargeScreenWidth) {
            // navigationRef.dispatch({
            //     type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY,
            //     payload: {isVisible: false},
            // });
            addSidePanelHistoryEntry(false);
            return;
        }

        // When shouldHideSidePanel changes, synchronize the side panel with the browser history.
        // navigationRef.dispatch({
        //     type: CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY,
        //     payload: {isVisible: !shouldHideSidePanel},
        // });

        addSidePanelHistoryEntry(!shouldHideSidePanel);

        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
