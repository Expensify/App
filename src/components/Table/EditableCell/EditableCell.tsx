import React from 'react';
import type {ReactNode, RefObject} from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useThemeStyles from '@hooks/useThemeStyles';

type EditableCellProps = {
    /** Content to display when not editing */
    children: ReactNode;

    /** Content to display when editing (inline replacement like TextInput). If omitted while isEditing, children are shown with an active border (popover mode). */
    editContent?: ReactNode;

    /** Popover or modal rendered as a sibling to the cell (e.g. date picker, category picker). Rendered for all edit-capable branches. */
    popoverContent?: ReactNode;

    /** Whether the cell is currently in editing mode */
    isEditing: boolean;

    /** Whether editing is allowed */
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
 *   1. canEdit=false              → renders children as-is
 *   2. isEditing + editContent    → replaces children with editContent (inline edit)
 *   3. isEditing + no editContent → shows children with active border (popover edit)
 *   4. default                    → PressableWithFeedback (hover border, click triggers edit)
 */
function EditableCell({children, editContent, popoverContent, isEditing, canEdit = true, onStartEditing, anchorRef}: EditableCellProps) {
    const styles = useThemeStyles();

    if (!canEdit) {
        return children;
    }

    // Inline edit mode: replace display content with the edit input
    if (isEditing && editContent) {
        return <View style={[styles.flex1]}>{editContent}</View>;
    }

    // Popover edit mode: keep showing display content with active border
    if (isEditing) {
        return (
            <>
                <View
                    ref={anchorRef}
                    style={[styles.flex1, styles.border, styles.borderColorFocus]}
                >
                    {children}
                </View>
                {popoverContent}
            </>
        );
    }

    return (
        <>
            <PressableWithFeedback
                accessibilityRole="button"
                accessibilityLabel="Edit cell"
                onPress={onStartEditing}
                style={[styles.flex1]}
                hoverStyle={[styles.border]}
            >
                {children}
            </PressableWithFeedback>
            {popoverContent}
        </>
    );
}

EditableCell.displayName = 'EditableCell';

export default EditableCell;
