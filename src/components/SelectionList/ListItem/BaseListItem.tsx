import React, {useRef} from 'react';
import {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import Icon from '@components/Icon';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import {useMouseContext} from '@hooks/useMouseContext';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {BaseListItemProps, ListItem} from './types';

function BaseListItem<TItem extends ListItem>({
    item,
    pressableStyle,
    wrapperStyle,
    pressableWrapperStyle,
    containerStyle,
    isDisabled = false,
    shouldPreventEnterKeySubmit = false,
    canSelectMultiple = false,
    onSelectRow,
    onDismissError = () => {},
    rightHandSideComponent,
    keyForList,
    errors,
    pendingAction,
    FooterComponent,
    children,
    isFocused,
    shouldSyncFocus = true,
    shouldDisplayRBR = true,
    shouldShowBlueBorderOnFocus = false,
    onFocus = () => {},
    hoverStyle,
    onLongPressRow,
    testID,
    shouldUseDefaultRightHandSideCheckmark = true,
    shouldHighlightSelectedItem = true,
    shouldDisableHoverStyle,
    shouldStopMouseLeavePropagation = true,
    shouldShowRightCaret = false,
    accessibilityRole = getButtonRole(true),
}: BaseListItemProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {hovered, bind} = useHover();
    const {isMouseDownOnInput, setMouseUp} = useMouseContext();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const pressableRef = useRef<View>(null);

    // Sync focus on an item
    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);
    const handleMouseLeave = (e: React.MouseEvent<Element, MouseEvent>) => {
        bind.onMouseLeave();
        if (shouldStopMouseLeavePropagation) {
            e.stopPropagation();
        }
        setMouseUp();
    };

    const rightHandSideComponentRender = () => {
        if (canSelectMultiple || !rightHandSideComponent) {
            return null;
        }

        if (typeof rightHandSideComponent === 'function') {
            return rightHandSideComponent(item, isFocused);
        }

        return rightHandSideComponent;
    };

    const shouldShowCheckmark = !canSelectMultiple && !!item.isSelected && !rightHandSideComponent && shouldUseDefaultRightHandSideCheckmark;

    const shouldShowRBRIndicator = (!item.isSelected || !!item.canShowSeveralIndicators) && !!item.brickRoadIndicator && shouldDisplayRBR;

    const shouldShowHiddenCheckmark = shouldShowRBRIndicator && !shouldShowCheckmark;

    const accessibilityState =
        accessibilityRole === CONST.ROLE.CHECKBOX || accessibilityRole === CONST.ROLE.RADIO ? {checked: !!item.isSelected, selected: !!isFocused} : {selected: !!isFocused};

    return (
        <OfflineWithFeedback
            onClose={() => onDismissError(item)}
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={styles.ph5}
            contentContainerStyle={containerStyle}
        >
            <PressableWithFeedback
                sentryLabel={CONST.SENTRY_LABEL.SELECTION_LIST.BASE_LIST_ITEM}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...bind}
                ref={pressableRef}
                onLongPress={() => {
                    onLongPressRow?.(item);
                }}
                onPress={(e) => {
                    if (isMouseDownOnInput) {
                        e?.stopPropagation(); // Preventing the click action
                        return;
                    }
                    if (shouldPreventEnterKeySubmit && e && 'key' in e && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
                        return;
                    }
                    onSelectRow(item);
                }}
                disabled={isDisabled && !item.isSelected}
                interactive={item.isInteractive}
                accessibilityLabel={item.accessibilityLabel ?? [item.text, item.text !== item.alternateText ? item.alternateText : undefined].filter(Boolean).join(', ')}
                role={accessibilityRole}
                accessibilityState={accessibilityState}
                isNested
                hoverDimmingValue={1}
                pressDimmingValue={item.isInteractive === false ? 1 : variables.pressDimValue}
                hoverStyle={!shouldDisableHoverStyle ? [!item.isDisabled && item.isInteractive !== false && styles.hoveredComponentBG, hoverStyle] : undefined}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: shouldShowBlueBorderOnFocus}}
                onMouseDown={(e) => {
                    if ((e?.target as HTMLElement)?.tagName === CONST.ELEMENT_NAME.INPUT) {
                        return;
                    }
                    e.preventDefault();
                }}
                id={keyForList ?? ''}
                style={[
                    pressableStyle,
                    isFocused &&
                        shouldHighlightSelectedItem &&
                        StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                onFocus={onFocus}
                onMouseLeave={handleMouseLeave}
                tabIndex={item.tabIndex}
                wrapperStyle={pressableWrapperStyle}
                testID={testID}
            >
                <View
                    testID={`${CONST.BASE_LIST_ITEM_TEST_ID}${item.keyForList}`}
                    accessibilityState={{selected: !!isFocused}}
                    style={[
                        wrapperStyle,
                        isFocused &&
                            shouldHighlightSelectedItem &&
                            StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                    ]}
                >
                    {typeof children === 'function' ? children(hovered) : children}

                    {shouldShowRBRIndicator && (
                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml3]}>
                            <Icon
                                testID={CONST.DOT_INDICATOR_TEST_ID}
                                src={Expensicons.DotIndicator}
                                fill={item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger}
                            />
                        </View>
                    )}

                    {(shouldShowCheckmark || shouldShowHiddenCheckmark) && (
                        <View
                            style={[styles.flexRow, styles.alignItemsCenter, styles.ml3, shouldShowHiddenCheckmark ? styles.opacity0 : undefined]}
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
                    {shouldShowRightCaret && (
                        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.ml2]}>
                            <Icon
                                src={icons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                                isButtonIcon
                                medium
                            />
                        </View>
                    )}
                </View>
                {FooterComponent}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default BaseListItem;
