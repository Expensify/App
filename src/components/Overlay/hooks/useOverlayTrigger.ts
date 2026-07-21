import CONST from '@src/CONST';

type OverlayTriggerPopupRole = typeof CONST.ROLE.DIALOG | typeof CONST.ROLE.MENU | typeof CONST.ROLE.LISTBOX | typeof CONST.ROLE.GRID;
type ScreenReaderSafeHasPopup = typeof CONST.ROLE.MENU | typeof CONST.ROLE.LISTBOX;

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
        accessibilityHasPopup?: ScreenReaderSafeHasPopup;
        accessibilityControls: string;
    };
};

function useOverlayTrigger({isOpen, triggerID, contentID, popupRole}: UseOverlayTriggerInput): UseOverlayTriggerResult {
    const accessibilityHasPopup = popupRole === CONST.ROLE.MENU || popupRole === CONST.ROLE.LISTBOX ? popupRole : undefined;
    return {
        triggerProps: {
            nativeID: triggerID,
            accessibilityState: {expanded: isOpen},
            accessibilityHasPopup,
            accessibilityControls: contentID,
        },
    };
}

export default useOverlayTrigger;
export type {OverlayTriggerPopupRole, UseOverlayTriggerInput, UseOverlayTriggerResult};
