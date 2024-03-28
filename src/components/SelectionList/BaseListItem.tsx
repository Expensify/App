import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SelectCircle from '@components/SelectCircle';
import useHover from '@hooks/useHover';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {BaseListItemProps, ListItem} from './types';

function BaseListItem<TItem extends ListItem>({
    item,
    pressableStyle,
    wrapperStyle,
    containerStyle,
    selectMultipleStyle,
    isDisabled = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    canSelectMultiple = false,
    onSelectRow,
    onCheckboxPress,
    onDismissError = () => {},
    rightHandSideComponent,
    checkmarkPosition = CONST.DIRECTION.LEFT,
    keyForList,
    errors,
    pendingAction,
    FooterComponent,
    children,
}: BaseListItemProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {hovered, bind} = useHover();

    const rightHandSideComponentRender = () => {
        if (canSelectMultiple || !rightHandSideComponent) {
            return null;
        }

        if (typeof rightHandSideComponent === 'function') {
            return rightHandSideComponent(item);
        }

        return rightHandSideComponent;
    };

    const handleCheckboxPress = () => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    };

    return (
        <OfflineWithFeedback
            onClose={() => onDismissError(item)}
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={styles.ph5}
            style={containerStyle}
        >
            <PressableWithFeedback
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...bind}
                onPress={() => onSelectRow(item)}
                disabled={isDisabled}
                accessibilityLabel={item.text ?? ''}
                role={CONST.ROLE.BUTTON}
                hoverDimmingValue={1}
                hoverStyle={!item.isDisabled && !item.isSelected && styles.hoveredComponentBG}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                onMouseDown={shouldPreventDefaultFocusOnSelectRow ? (e) => e.preventDefault() : undefined}
                nativeID={keyForList ?? ''}
                style={pressableStyle}
            >
                <View style={wrapperStyle}>
                    {canSelectMultiple && checkmarkPosition === CONST.DIRECTION.LEFT && (
                        <PressableWithFeedback
                            accessibilityLabel={item.text ?? ''}
                            role={CONST.ROLE.BUTTON}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            disabled={isDisabled || item.isDisabledCheckbox}
                            onPress={handleCheckboxPress}
                            style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, styles.mr3]}
                        >
                            <View style={selectMultipleStyle}>
                                {item.isSelected && (
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={theme.textLight}
                                        height={14}
                                        width={14}
                                    />
                                )}
                            </View>
                        </PressableWithFeedback>
                    )}

                    {typeof children === 'function' ? children(hovered) : children}

                    {canSelectMultiple && checkmarkPosition === CONST.DIRECTION.RIGHT && (
                        <PressableWithFeedback
                            onPress={handleCheckboxPress}
                            disabled={isDisabled}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={item.text ?? ''}
                            style={[styles.ml2, styles.optionSelectCircle]}
                        >
                            <SelectCircle
                                isChecked={item.isSelected ?? false}
                                selectCircleStyles={styles.ml0}
                            />
                        </PressableWithFeedback>
                    )}

                    {!canSelectMultiple && item.isSelected && !rightHandSideComponent && (
                        <View
                            style={[styles.flexRow, styles.alignItemsCenter, styles.ml3]}
                            accessible={false}
                        >
                            <View>
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={theme.success}
                                />
                            </View>
                        </View>
                    )}
                    {rightHandSideComponentRender()}
                </View>
                {FooterComponent}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

BaseListItem.displayName = 'BaseListItem';

export default BaseListItem;
