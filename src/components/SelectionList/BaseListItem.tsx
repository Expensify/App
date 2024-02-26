import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {BaseListItemProps, ListItem} from './types';

function BaseListItem<TItem extends ListItem>({
    item,
    pressableStyle,
    wrapperStyle,
    selectMultipleStyle,
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
    const StyleUtils = useStyleUtils();

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
        >
            <PressableWithFeedback
                onPress={() => onSelectRow(item)}
                disabled={isDisabled}
                accessibilityLabel={item.text}
                role={CONST.ROLE.BUTTON}
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                onMouseDown={shouldPreventDefaultFocusOnSelectRow ? (e) => e.preventDefault() : undefined}
                nativeID={keyForList}
                style={pressableStyle}
            >
                {({hovered}) => (
                    <>
                        <View style={wrapperStyle}>
                            {canSelectMultiple && (
                                <View
                                    role={CONST.ROLE.BUTTON}
                                    style={StyleUtils.getCheckboxPressableStyle()}
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
                                </View>
                            )}

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
                            {rightHandSideComponentRender()}
                        </View>
                        {FooterComponent}
                    </>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

BaseListItem.displayName = 'BaseListItem';

export default BaseListItem;
