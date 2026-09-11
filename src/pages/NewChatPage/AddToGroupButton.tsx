import Button from '@components/ButtonComposed';
import {useListItemContext} from '@components/SelectionList/ListItemContext';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {OptionWithKey} from '@libs/OptionsListUtils/types';

import CONST from '@src/CONST';

import React from 'react';

type AddToGroupButtonProps = {
    /** The row this button belongs to */
    item: OptionWithKey;

    /** Adds the row's user to the group draft */
    onPress: (item: OptionWithKey) => void;
};

/**
 * The "Add to group" action rendered at the end of an eligible NewChatPage row.
 * Takes the row's focus state from ListItemContext so the button picks up the hovered
 * appearance while its row is the list's focused one.
 */
function AddToGroupButton({item, onPress}: AddToGroupButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isFocused} = useListItemContext();

    return (
        <Button
            onPress={() => onPress(item)}
            style={styles.pl2}
            accessibilityLabel={item.text ? translate('newChatPage.addUserToGroup', item.text) : ''}
            innerStyles={isFocused ? styles.buttonDefaultHovered : {}}
            size={CONST.BUTTON_SIZE.SMALL}
        >
            <Button.Text>{translate('newChatPage.addToGroup')}</Button.Text>
        </Button>
    );
}

export default AddToGroupButton;
