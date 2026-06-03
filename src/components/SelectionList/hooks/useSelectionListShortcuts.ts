import type {ConfirmButtonOptions, InteractiveElementRoles, ListItem} from '@components/SelectionList/types';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';

type UseSelectionListShortcutsParams<TItem extends ListItem> = {
    /** Activates the focused row (Enter, and Ctrl+Enter when there is no confirm handler) */
    selectFocusedItem: () => void;

    /** Returns the currently focused option, if any (passed to the confirm handler) */
    getFocusedOption: () => TItem | undefined;

    /** Confirm-button options; when onConfirm is provided it handles Ctrl+Enter */
    confirmButtonOptions: ConfirmButtonOptions<TItem> | undefined;

    /** Whether the list's screen is focused */
    isActive: boolean;

    /** The currently focused index */
    focusedIndex: number;

    /** Whether keyboard shortcuts are disabled for this list */
    disableKeyboardShortcuts: boolean;

    /** Whether the Enter shortcut should stop propagation */
    shouldStopPropagation: boolean | undefined;

    /** Whether the shortcut should bubble when there is no actionable focused option */
    shouldBubble: boolean;
};

/**
 * Registers the Enter / Ctrl+Enter shortcuts for a SelectionList and disables Enter while an
 * interactive element (button/checkbox/switch) is focused. Shared by BaseSelectionList and
 * BaseSelectionListWithSections.
 */
function useSelectionListShortcuts<TItem extends ListItem>({
    selectFocusedItem,
    getFocusedOption,
    confirmButtonOptions,
    isActive,
    focusedIndex,
    disableKeyboardShortcuts,
    shouldStopPropagation,
    shouldBubble,
}: UseSelectionListShortcutsParams<TItem>) {
    const activeElementRole = useActiveElementRole();

    // Disable `Enter` shortcut if the active element is a button, checkbox, or switch
    const disableEnterShortcut = activeElementRole && [CONST.ROLE.BUTTON, CONST.ROLE.CHECKBOX, CONST.ROLE.SWITCH].includes(activeElementRole as InteractiveElementRoles);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedItem, {
        captureOnInputs: true,
        shouldBubble,
        shouldStopPropagation,
        isActive: !disableKeyboardShortcuts && isActive && focusedIndex >= 0 && !disableEnterShortcut,
    });

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER,
        (e) => {
            if (confirmButtonOptions?.onConfirm) {
                confirmButtonOptions.onConfirm(e, getFocusedOption());
                return;
            }
            selectFocusedItem();
        },
        {
            captureOnInputs: true,
            shouldBubble,
            isActive: !disableKeyboardShortcuts && isActive && !confirmButtonOptions?.isDisabled,
        },
    );
}

export default useSelectionListShortcuts;
