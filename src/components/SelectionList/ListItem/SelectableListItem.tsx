import React from 'react';
import ListCheckbox from '@components/SelectionList/components/ListCheckbox';
import ListRadioButton from '@components/SelectionList/components/ListRadioButton';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, SelectableListItemProps} from './types';

/**
 * Extends BaseListItem with a selection button (checkbox for multi-select, radio for single-select).
 * This is the layer used by all SelectionList items that show a visual selection indicator.
 * Items that never need a selection button (e.g. search result rows) use BaseListItem directly.
 */
function SelectableListItem<TItem extends ListItem>({
    canSelectMultiple = false,
    selectionButtonPosition = CONST.SELECTION_BUTTON_POSITION.RIGHT,
    item,
    onSelectionButtonPress,
    onSelectRow,
    isDisabled = false,
    children,
    rightHandSideComponent,
    isFocused,
    ...baseProps
}: SelectableListItemProps<TItem>) {
    const styles = useThemeStyles();
    const ButtonComponent = canSelectMultiple ? ListCheckbox : ListRadioButton;

    return (
        <BaseListItem
            // eslint-disable-next-line react/jsx-props-no-spreading -- props are forwarded from SelectableListItem to BaseListItem as a pass-through layer
            {...baseProps}
            item={item}
            isFocused={isFocused}
            isDisabled={isDisabled}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            rightHandSideComponent={
                selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.RIGHT ? (
                    <>
                        <ButtonComponent
                            item={item}
                            onSelectRow={onSelectionButtonPress ?? onSelectRow}
                            disabled={!!isDisabled || !!item.isDisabledCheckbox}
                            style={styles.ml3}
                        />
                        {typeof rightHandSideComponent === 'function' ? rightHandSideComponent(item, isFocused) : rightHandSideComponent}
                    </>
                ) : (
                    rightHandSideComponent
                )
            }
        >
            {selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.LEFT
                ? (hovered: boolean) => (
                      <>
                          <ButtonComponent
                              item={item}
                              onSelectRow={onSelectionButtonPress ?? onSelectRow}
                              disabled={!!isDisabled || item.isDisabledCheckbox}
                              style={styles.mr3}
                          />
                          {typeof children === 'function' ? children(hovered) : children}
                      </>
                  )
                : children}
        </BaseListItem>
    );
}

export default SelectableListItem;
