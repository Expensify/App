import type CONST from '@src/CONST';

type OverlayTriggerPopupRole = typeof CONST.ROLE.DIALOG | typeof CONST.ROLE.MENU | 'listbox' | 'tree' | 'grid';

type UseOverlayTriggerInput = {
    isOpen: boolean;
    triggerID: string;
    contentID: string;
    popupRole: OverlayTriggerPopupRole;
};

type UseOverlayTriggerResult = {
    triggerProps: {
        nativeID: string;
        accessibilityState: {expanded: boolean};
        accessibilityHasPopup: OverlayTriggerPopupRole;
        accessibilityControls: string;
    };
};

function useOverlayTrigger({isOpen, triggerID, contentID, popupRole}: UseOverlayTriggerInput): UseOverlayTriggerResult {
    return {
        triggerProps: {
            nativeID: triggerID,
            accessibilityState: {expanded: isOpen},
            accessibilityHasPopup: popupRole,
            accessibilityControls: contentID,
        },
    };
}

export default useOverlayTrigger;
export type {OverlayTriggerPopupRole, UseOverlayTriggerInput, UseOverlayTriggerResult};
