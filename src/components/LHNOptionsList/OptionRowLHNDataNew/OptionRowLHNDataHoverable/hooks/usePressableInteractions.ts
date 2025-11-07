import type {RefObject} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import DomUtils from '@libs/DomUtils';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';

type UsePressableInteractionsParams = {
    reportID?: string;
    optionItem?: OptionData;
    popoverAnchor?: RefObject<View | null>;
    onContextMenuVisibilityChange?: (isVisible: boolean) => void;
    shouldUseNarrowLayout?: boolean;
    isScreenFocused?: boolean;
};

function usePressableInteractions({
    reportID,
    optionItem,
    popoverAnchor,
    onContextMenuVisibilityChange,
    shouldUseNarrowLayout = false,
    isScreenFocused = false,
}: UsePressableInteractionsParams = {}) {
    const onMouseDown = (event: React.MouseEvent<Element, MouseEvent>) => {
        // Allow composer blur on right click
        if (!event) {
            return;
        }
        // Prevent composer blur on left click
        event.preventDefault();
    };

    const onSecondaryInteraction = (event: GestureResponderEvent | MouseEvent) => {
        if (!event) {
            return;
        }
        if (!optionItem || !reportID) {
            return;
        }

        if (!isScreenFocused && shouldUseNarrowLayout) {
            return;
        }

        onContextMenuVisibilityChange?.(true);
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT,
            event,
            selection: '',
            contextMenuAnchor: popoverAnchor?.current,
            report: {
                reportID,
                originalReportID: reportID,
                isPinnedChat: optionItem.isPinned,
                isUnreadChat: !!optionItem.isUnread,
            },
            reportAction: {
                reportActionID: '-1',
            },
            callbacks: {
                onHide: () => onContextMenuVisibilityChange?.(false),
            },
            withoutOverlay: false,
        });

        // Ensure that we blur the composer when opening context menu, so that only one component is focused at a time
        if (DomUtils.getActiveElement()) {
            (DomUtils.getActiveElement() as HTMLElement | null)?.blur();
        }
    };

    return {
        onMouseDown,
        onSecondaryInteraction,
    };
}

export default usePressableInteractions;
