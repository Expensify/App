import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import {getLetterAvatarURLForName} from '@libs/UserAvatarUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import variables from '@src/styles/variables';

import type {ComponentRef, Ref} from 'react';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useImperativeHandle, useRef} from 'react';
import {View} from 'react-native';

import UserAvatar from './Avatar/UserAvatar';
import Button from './Button';
import FormHelpMessage from './FormHelpMessage';
import Icon from './Icon';
import MenuItem from './MenuItem';
import {MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT, useMenuItemAccessibilityAnnouncement} from './MenuItem/MenuItemAccessibilityContext';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type ListFieldRow = {
    /** ID of the entry the row shows */
    id: string;

    /** Names the row and its buttons for screen readers, and the letter avatar is built from it */
    title: string;

    /** Second line of the row */
    description?: string;
};

type ListFieldProps = {
    /** Entries, one row each */
    rows: ListFieldRow[];

    /** Title of the add row, such as "Add owner" */
    addTitle: string;

    /** Hint shown under the add row */
    addDescription?: string;

    /** Hides the add row once the list is full */
    canAddMore?: boolean;

    /** Validation error shown under the list */
    errorText?: string;

    /** Called when the user taps the add row */
    onAdd: () => void;

    /** Called when the user taps Edit on a row */
    onEdit: (id: string) => void;

    /** Called when the user taps a row's remove button, so the caller can confirm before removing */
    onRemove: (id: string) => void;

    /** Moves focus within the list, for a caller whose action removed the focused button */
    ref?: Ref<ListFieldHandle>;
};

type ListFieldHandle = {
    /** Focuses the first row's Edit button, or the add row when the list is empty */
    focus: () => void;

    /** Focuses the Edit button of the entry's row */
    focusRow: (id: string) => void;

    /** Focuses the add row, or the last row's Edit button once the list is full and the add row is hidden */
    focusAddRow: () => void;
};

// The 44x44 minimum touch target from contributingGuides/ACCESSIBILITY.md
const MINIMUM_TOUCH_TARGET_SIZE = 44;
const EDIT_BUTTON_VERTICAL_SLOP = Math.max(MINIMUM_TOUCH_TARGET_SIZE - variables.componentSizeSmall, 0) / 2;

// Only taller, since the Edit and remove buttons sit too close together to widen without overlapping
const EDIT_BUTTON_HIT_SLOP = {top: EDIT_BUTTON_VERTICAL_SLOP, bottom: EDIT_BUTTON_VERTICAL_SLOP};

// 44px layout boxes, since native ignores the part of a hitSlop that reaches past the parent
const EDIT_BUTTON_WRAPPER_STYLE = {minHeight: MINIMUM_TOUCH_TARGET_SIZE};
const REMOVE_BUTTON_SIZE_STYLE = {width: MINIMUM_TOUCH_TARGET_SIZE, height: MINIMUM_TOUCH_TARGET_SIZE};

/** Reads the list's error with the add row's name, since the error under the list is announced only when it appears */
function AddRowErrorAnnouncement({errorText}: {errorText: string}) {
    useMenuItemAccessibilityAnnouncement(MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.ERROR, errorText || undefined);

    return null;
}

/** A list of named items on a page, each with an avatar, an Edit button and a remove button, followed by an add row */
function ListField({rows, addTitle, addDescription, canAddMore = true, errorText = '', onAdd, onEdit, onRemove, ref}: ListFieldProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Close']);
    const editButtonRefs = useRef(new Map<string, ComponentRef<typeof View>>());
    const addRowRef = useRef<ComponentRef<typeof View>>(null);

    const focusRow = (id: string | undefined) => Accessibility.moveAccessibilityFocus(id ? editButtonRefs.current.get(id) : undefined);

    useImperativeHandle(ref, () => ({
        focus: () => (rows.length > 0 ? focusRow(rows.at(0)?.id) : Accessibility.moveAccessibilityFocus(addRowRef.current)),
        focusRow,
        focusAddRow: () => (addRowRef.current ? Accessibility.moveAccessibilityFocus(addRowRef.current) : focusRow(rows.at(-1)?.id)),
    }));

    return (
        <>
            {rows.map((row) => (
                // The row itself does nothing, so it stays out of the accessibility tree and screen readers can reach its buttons
                <MenuItem.Root
                    key={row.id}
                    shouldBeAccessible={false}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            {/* The avatar repeats the row's name as initials, so screen readers skip it */}
                            <View
                                aria-hidden
                                accessibilityElementsHidden
                                importantForAccessibility="no-hide-descendants"
                            >
                                <UserAvatar
                                    source={getLetterAvatarURLForName(row.title)}
                                    accountID={CONST.DEFAULT_NUMBER_ID}
                                />
                            </View>
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{row.title}</MenuItem.Title>
                            {!!row.description && <MenuItem.Description>{row.description}</MenuItem.Description>}
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                <Button
                                    style={[EDIT_BUTTON_WRAPPER_STYLE, styles.justifyContentCenter]}
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    accessibilityLabel={translate('listField.editItem', {name: row.title})}
                                    hitSlop={EDIT_BUTTON_HIT_SLOP}
                                    ref={(element) => {
                                        if (!element) {
                                            return;
                                        }
                                        editButtonRefs.current.set(row.id, element);
                                        return () => {
                                            editButtonRefs.current.delete(row.id);
                                        };
                                    }}
                                    onPress={() => onEdit(row.id)}
                                >
                                    <Button.Text>{translate('common.edit')}</Button.Text>
                                </Button>
                                <PressableWithFeedback
                                    sentryLabel={CONST.SENTRY_LABEL.LIST_FIELD.REMOVE_BUTTON}
                                    accessibilityLabel={translate('listField.removeItem', {name: row.title})}
                                    role={CONST.ROLE.BUTTON}
                                    style={[styles.touchableButtonImage, REMOVE_BUTTON_SIZE_STYLE]}
                                    onPress={() => onRemove(row.id)}
                                >
                                    <Icon
                                        src={icons.Close}
                                        fill={theme.icon}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
                                    />
                                </PressableWithFeedback>
                            </View>
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            ))}
            {canAddMore && (
                <MenuItem.Root
                    ref={addRowRef}
                    onPress={callFunctionIfActionIsAllowed(onAdd, false, session)}
                >
                    <AddRowErrorAnnouncement errorText={errorText} />
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <MenuItem.Icon src={icons.Plus} />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{addTitle}</MenuItem.Title>
                            {!!addDescription && <MenuItem.Description>{addDescription}</MenuItem.Description>}
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            )}
            {!!errorText && (
                <View style={styles.ph5}>
                    <FormHelpMessage message={errorText} />
                </View>
            )}
        </>
    );
}

export default ListField;
export type {ListFieldHandle, ListFieldRow};
