import React, {useEffect} from 'react';
import type {ReactNode, RefObject} from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useEditingCellContext} from './EditingCellContext';

type EditableCellProps = {
    /** Content to display when not editing */
    children: ReactNode;

    /** Content to display when editing (inline replacement like TextInput). If omitted while isEditing, children are shown with an active border (popover mode). */
    editContent?: ReactNode;

    /** Popover or modal rendered as a sibling to the cell (e.g. date picker, category picker). Rendered for all edit-capable branches. */
    popoverContent?: ReactNode;

    /** Whether the cell is currently in editing mode */
    isEditing: boolean;

    /**
     * Whether editing is currently permitted.
     * Only meaningful when the layout supports editing. When false the styled container is still rendered (maintaining layout
     * consistency) but the pressable is disabled and editing cannot be triggered.
     */
    canEdit?: boolean;

    /** Callback when edit mode should be activated */
    onStartEditing: () => void;

    /** Ref attached to the cell wrapper — used as popover anchor for date/category pickers */
    anchorRef?: RefObject<View | null>;
};

/**
 * A stateless wrapper that handles hover highlight + click-to-edit for table cells.
 * Does not manage editing state — the consumer controls that via hooks.
 *
 * Modes:
 *   1. isEditable=false           → renders children as-is (narrow/mobile layout — no container needed)
 *   2. isEditing + editContent    → replaces children with editContent (inline edit)
 *   3. isEditing + no editContent → shows children with active border (popover edit)
 *   4. canEdit=false              → styled container View, no pressable (transient: loading / no permission)
 *   5. default                    → PressableWithFeedback (hover border, click triggers edit)
 */
function EditableCell({children, editContent, popoverContent, isEditing, canEdit, onStartEditing, anchorRef}: EditableCellProps) {
    const styles = useThemeStyles();
    const {setEditingCellCount} = useEditingCellContext();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const isEditable = isLargeScreenWidth;

    useEffect(() => {
        if (!isEditable || !isEditing) {
            return;
        }
        setEditingCellCount((count) => count + 1);
        return () => setEditingCellCount((count) => count - 1);
    }, [isEditing, isEditable, setEditingCellCount]);

    // Architectural exclusion (e.g. narrow layout) — no container, no padding.
    if (!isEditable) {
        return children;
    }

    // Inline edit mode: replace display content with the edit input
    if (isEditing && editContent) {
        return <View style={[styles.editableCell, styles.editableCellFocus]}>{editContent}</View>;
    }

    // Popover edit mode: keep showing display content with active border
    if (isEditing) {
        return (
            <>
                <View
                    ref={anchorRef}
                    style={[styles.editableCell, styles.editableCellFocus]}
                >
                    {children}
                </View>
                {popoverContent}
            </>
        );
    }

    // Transient non-editable state (loading, permissions pending): render the container for layout
    // consistency but skip the pressable so the user cannot trigger edit mode.
    if (!canEdit) {
        return (
            <>
                <View style={[styles.editableCell]}>{children}</View>
                {popoverContent}
            </>
        );
    }

    return (
        <>
            <PressableWithFeedback
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel="Edit cell"
                sentryLabel={CONST.SENTRY_LABEL.TABLE.EDITABLE_CELL}
                onPress={onStartEditing}
                style={styles.editableCell}
                wrapperStyle={styles.w100}
                focusStyle={styles.editableCellFocus}
                hoverStyle={styles.editableCellHover}
            >
                {children}
            </PressableWithFeedback>
            {popoverContent}
        </>
    );
}

EditableCell.displayName = 'EditableCell';

export default EditableCell;
