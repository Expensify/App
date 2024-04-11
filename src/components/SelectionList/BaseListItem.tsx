import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useHover from '@hooks/useHover';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {BaseListItemProps, ListItem} from './types';

function BaseListItem<TItem extends ListItem>({
    item,
    pressableStyle,
    wrapperStyle,
    containerStyle,
    isDisabled = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    canSelectMultiple = false,
    onSelectRow,
    onDismissError = () => {},
    rightHandSideComponent,
    keyForList,
    errors,
    pendingAction,
    FooterComponent,
    children,
}: BaseListItemProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
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

    return (
        <OfflineWithFeedback
            onClose={() => onDismissError(item)}
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={styles.ph5}
            contentContainerStyle={containerStyle}
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
                    {typeof children === 'function' ? children(hovered) : children}

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
                    {!item.isSelected && !!item.brickRoadIndicator && (
                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <Icon
                                src={Expensicons.DotIndicator}
                                fill={item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger}
                            />
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
