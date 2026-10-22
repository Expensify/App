import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLetterAvatarURLForName} from '@libs/UserAvatarUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import variables from '@src/styles/variables';

import React from 'react';
import {View} from 'react-native';

import UserAvatar from './Avatar/UserAvatar';
import Button from './Button';
import FormHelpMessage from './FormHelpMessage';
import Icon from './Icon';
import MenuItem from './MenuItem';
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
};

/** A list of named items on a page, each with an avatar, an Edit button and a remove button, followed by an add row */
function ListField({rows, addTitle, addDescription, canAddMore = true, errorText = '', onAdd, onEdit, onRemove}: ListFieldProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Close']);

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
                            <UserAvatar
                                source={getLetterAvatarURLForName(row.title)}
                                accountID={CONST.DEFAULT_NUMBER_ID}
                            />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{row.title}</MenuItem.Title>
                            {!!row.description && <MenuItem.Description>{row.description}</MenuItem.Description>}
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                <Button
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    accessibilityLabel={translate('listField.editItem', {name: row.title})}
                                    onPress={() => onEdit(row.id)}
                                >
                                    <Button.Text>{translate('common.edit')}</Button.Text>
                                </Button>
                                <PressableWithFeedback
                                    sentryLabel={CONST.SENTRY_LABEL.LIST_FIELD.REMOVE_BUTTON}
                                    accessibilityLabel={translate('listField.removeItem', {name: row.title})}
                                    role={CONST.ROLE.BUTTON}
                                    style={styles.touchableButtonImage}
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
                <MenuItem.Root onPress={callFunctionIfActionIsAllowed(onAdd, false, session)}>
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
export type {ListFieldRow};
