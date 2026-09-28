import UserAvatar from '@components/Avatar/UserAvatar';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLetterAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import variables from '@src/styles/variables';

import React from 'react';
import {View} from 'react-native';

type ListFieldRow = {
    id: string;

    /** Names the row, and the avatar and the remove confirmation are built from it */
    title: string;

    description?: string;
};

type ListFieldProps = {
    rows: ListFieldRow[];

    /** Title of the add row, such as "Add owner" */
    addTitle: string;

    /** Hint shown under the add row */
    addDescription?: string;

    /** Hides the add row once the list is full */
    canAddMore?: boolean;

    errorText?: string;

    onAdd: () => void;

    onEdit: (id: string) => void;

    /** Called once the user has confirmed the removal */
    onRemove: (id: string) => void;
};

/** A list of named items on a page, each with an avatar, an Edit button and a confirmed remove, followed by an add row */
function ListField({rows, addTitle, addDescription, canAddMore = true, errorText = '', onAdd, onEdit, onRemove}: ListFieldProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {showConfirmModal} = useConfirmModal();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Close']);

    const confirmRemoval = (row: ListFieldRow) => {
        showConfirmModal({
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            title: translate('dynamicForm.removeItemTitle', {name: row.title}),
            prompt: translate('dynamicForm.removeItemPrompt', {name: row.title}),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            onRemove(row.id);
        });
    };

    return (
        <>
            {rows.map((row) => {
                const [firstName = '', ...otherNames] = row.title.trim().split(/\s+/);
                const colorSeed = [...row.title].reduce((sum, character) => sum + character.charCodeAt(0), 0);
                const letterAvatarURL = getLetterAvatarURL(colorSeed, firstName, otherNames.at(-1) ?? '', '');
                return (
                    <MenuItem.Root key={row.id}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <UserAvatar
                                    source={letterAvatarURL || undefined}
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
                                        accessibilityLabel={`${translate('common.edit')} ${row.title}`}
                                        onPress={() => onEdit(row.id)}
                                    >
                                        <Button.Text>{translate('common.edit')}</Button.Text>
                                    </Button>
                                    <PressableWithFeedback
                                        sentryLabel="ListField-RemoveItem"
                                        accessibilityLabel={`${translate('common.remove')} ${row.title}`}
                                        accessibilityRole={CONST.ROLE.BUTTON}
                                        onPress={() => confirmRemoval(row)}
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
                );
            })}
            {canAddMore && (
                <MenuItem
                    icon={icons.Plus}
                    title={addTitle}
                    description={addDescription}
                    onPress={onAdd}
                />
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
export type {ListFieldProps, ListFieldRow};
