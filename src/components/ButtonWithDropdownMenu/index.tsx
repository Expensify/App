import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import Text from '@components/Text';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import genericMemo from '@libs/genericMemo';
import mergeRefs from '@libs/mergeRefs';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

import type {RefObject} from 'react';
import type {GestureResponderEvent, StyleProp, TextStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';

import type {ButtonWithDropdownMenuProps} from './types';

const defaultAnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    // we assume that popover menu opens below the button, anchor is at TOP
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type DoubleLineButtonTextProps = {
    primaryText: string;
    primaryTextStyle?: StyleProp<TextStyle>;
    secondLineText: string;
};

// Must be rendered inside `<Button>` so `Button.Text` still receives its context.
function DoubleLineButtonText({primaryText, primaryTextStyle, secondLineText}: DoubleLineButtonTextProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.alignItemsCenter, styles.flexColumn, styles.flexShrink1, styles.mw100]}>
            <Button.Text style={primaryTextStyle}>{primaryText}</Button.Text>
            <Text
                style={[styles.pointerEventsNone, styles.fontWeightNormal, styles.textDoubleDecker, styles.textExtraSmallSupporting, styles.textWhite, styles.textBold, styles.ph1]}
                numberOfLines={1}
            >
                {secondLineText}
            </Text>
        </View>
    );
}

function ButtonWithDropdownMenu<IValueType>({ref, ...props}: ButtonWithDropdownMenuProps<IValueType>) {
    const {
        variant,
        isSplitButton = true,
        isLoading = false,
        isDisabled = false,
        pressOnEnter = false,
        shouldAlwaysShowDropdownMenu = false,
        menuHeaderText = '',
        customText,
        style,
        buttonStyle,
        disabledStyle,
        size = CONST.BUTTON_SIZE.MEDIUM,
        anchorAlignment = defaultAnchorAlignment,
        buttonRef,
        onPress,
        options,
        onOptionSelected,
        onSubItemSelected,
        onOptionsMenuShow,
        onOptionsMenuHide,
        enterKeyEventListenerPriority = 0,
        wrapperStyle,
        useKeyboardShortcuts = false,
        defaultSelectedIndex = 0,
        shouldShowRadioButton = false,
        testID,
        secondLineText = '',
        icon,
        shouldPopoverUseScrollView = false,
        containerStyles,
        shouldUseModalPaddingStyle = true,
        shouldUseShortForm = false,
        shouldUseOptionIcon = false,
        stayNormalOnDisable = false,
        brickRoadIndicator,
        sentryLabel,
    } = props;

    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'DotIndicator']);
    const hasError = brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selectedItemIndex, setSelectedItemIndex] = useState(defaultSelectedIndex);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    // In tests, skip the popover anchor position calculation. The default values are needed for popover menu to be rendered in tests.
    const defaultPopoverAnchorPosition = process.env.NODE_ENV === 'test' ? {horizontal: 100, vertical: 100} : null;
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(defaultPopoverAnchorPosition);
    const dropdownAnchor = useRef<View | null>(null);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct popover styles
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const dropdownButtonRef = isSplitButton ? buttonRef : mergeRefs(buttonRef, dropdownAnchor);
    const selectedItem = options.at(selectedItemIndex) ?? options.at(0);
    const areAllOptionsDisabled = options.every((option) => option.disabled);
    const innerStyleDropButton = StyleUtils.getDropDownButtonHeight(size);
    const isButtonSizeLarge = size === CONST.BUTTON_SIZE.LARGE;
    const isButtonSizeSmall = size === CONST.BUTTON_SIZE.SMALL;
    // Large → MEDIUM, otherwise SMALL — except in short form (and not large), where the icon dimensions come from the explicit width/height (extra-small), so leave size unset.
    let dropdownArrowIconSize: ValueOf<typeof CONST.ICON_SIZE> | undefined;
    if (isButtonSizeLarge) {
        dropdownArrowIconSize = CONST.ICON_SIZE.MEDIUM;
    } else if (!shouldUseShortForm) {
        dropdownArrowIconSize = CONST.ICON_SIZE.SMALL;
    }
    const nullCheckRef = (refParam: RefObject<View | null>) => refParam ?? null;
    const shouldShowButtonRightIcon = !!options.at(0)?.shouldShowButtonRightIcon;
    const splitButtonIcon = hasError ? icons.DotIndicator : icon;
    const singleOptionButtonIcon = shouldUseOptionIcon && !shouldShowButtonRightIcon ? options.at(0)?.icon : icon;
    const rightOptionIcon = options.at(0)?.icon;

    useEffect(() => {
        setSelectedItemIndex(defaultSelectedIndex);
    }, [defaultSelectedIndex]);

    const {paddingBottom} = useSafeAreaPaddings(true);

    const {calculatePopoverPosition} = usePopoverPosition();

    useEffect(() => {
        if (!dropdownAnchor.current || !isMenuVisible) {
            return;
        }

        calculatePopoverPosition(dropdownAnchor, anchorAlignment).then(setPopoverAnchorPosition);
    }, [isMenuVisible, calculatePopoverPosition, anchorAlignment]);

    const handleSingleOptionPress = useCallback(
        (event: GestureResponderEvent | KeyboardEvent | undefined) => {
            const option = options.at(0);
            if (!option) {
                return;
            }

            if (option.onSelected) {
                option.onSelected();
            } else {
                onOptionSelected?.(option);
                onPress(event, option.value);
            }

            onSubItemSelected?.(option, 0, event);
        },
        [options, onPress, onOptionSelected, onSubItemSelected],
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER,
        (e) => {
            if (shouldAlwaysShowDropdownMenu || options.length) {
                if (!isSplitButton) {
                    setIsMenuVisible(!isMenuVisible);
                    return;
                }
                if (selectedItem?.value) {
                    onPress(e, selectedItem.value);
                }
            } else {
                handleSingleOptionPress(e);
            }
        },
        {
            captureOnInputs: true,
            shouldBubble: false,
            isActive: useKeyboardShortcuts,
        },
    );
    const splitButtonWrapperStyle = isSplitButton ? [styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter] : undefined;
    let dropdownButtonStyle;
    if (isSplitButton) {
        dropdownButtonStyle = [splitButtonWrapperStyle, style];
    } else if (style) {
        dropdownButtonStyle = [styles.w100, style];
    }
    const defaultStyle = style ? styles.w100 : undefined;
    const nonSplitButtonStyle = buttonStyle ? [styles.w100, buttonStyle] : defaultStyle;
    const isTextTooLong = customText && customText?.length > 6;

    const handlePress = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            if (!isSplitButton) {
                setIsMenuVisible(!isMenuVisible);
            } else if (selectedItem?.value) {
                onPress(event, selectedItem.value);
            }
        },
        [isMenuVisible, isSplitButton, onPress, selectedItem?.value],
    );

    useImperativeHandle(ref, () => ({
        setIsMenuVisible,
    }));

    return (
        <View style={wrapperStyle}>
            {shouldAlwaysShowDropdownMenu || options.length > 1 ? (
                <View style={dropdownButtonStyle}>
                    <Button
                        variant={variant}
                        ref={dropdownButtonRef}
                        onPress={handlePress}
                        accessibilityState={!isSplitButton ? {expanded: isMenuVisible} : undefined}
                        isDisabled={isDisabled || areAllOptionsDisabled}
                        stayNormalOnDisable={stayNormalOnDisable}
                        isLoading={isLoading}
                        removeBorderRadius={CONST.BUTTON_REMOVE_BORDER_RADIUS.RIGHT}
                        style={isSplitButton ? [styles.pr0, styles.flexGrow1, styles.flexShrink1] : nonSplitButtonStyle}
                        size={size}
                        innerStyles={[innerStyleDropButton, !isSplitButton && styles.dropDownButtonCartIconView, isTextTooLong && shouldUseShortForm && {...styles.pl2, ...styles.pr1}]}
                        testID={testID}
                        sentryLabel={sentryLabel}
                    >
                        {pressOnEnter && <Button.KeyboardShortcut enterKeyEventListenerPriority={enterKeyEventListenerPriority} />}
                        {!!splitButtonIcon && (
                            <Button.Icon
                                src={splitButtonIcon}
                                fill={hasError ? theme.danger : undefined}
                                hoverFill={hasError ? theme.danger : undefined}
                            />
                        )}
                        {secondLineText ? (
                            <DoubleLineButtonText
                                primaryText={customText ?? selectedItem?.text ?? ''}
                                primaryTextStyle={[
                                    isTextTooLong && shouldUseShortForm ? {...styles.textExtraSmall, ...styles.textBold} : {},
                                    !!splitButtonIcon && styles.textAlignLeft,
                                    styles.noPaddingBottom,
                                ]}
                                secondLineText={secondLineText}
                            />
                        ) : (
                            <Button.Text style={[isTextTooLong && shouldUseShortForm ? {...styles.textExtraSmall, ...styles.textBold} : {}]}>
                                {customText ?? selectedItem?.text ?? ''}
                            </Button.Text>
                        )}
                        {!isSplitButton && !isLoading && options?.length > 0 && (
                            <Button.Icon
                                src={icons.DownArrow}
                                style={isMenuVisible ? styles.flipUpsideDown : undefined}
                                fill={hasError ? theme.buttonIcon : undefined}
                                hoverFill={hasError ? theme.buttonIcon : undefined}
                            />
                        )}
                    </Button>

                    {isSplitButton && (
                        <Button
                            ref={dropdownAnchor}
                            variant={variant}
                            isDisabled={isDisabled}
                            accessibilityState={{expanded: isMenuVisible}}
                            stayNormalOnDisable={stayNormalOnDisable}
                            style={[styles.pl0]}
                            onPress={() => setIsMenuVisible(!isMenuVisible)}
                            removeBorderRadius={CONST.BUTTON_REMOVE_BORDER_RADIUS.LEFT}
                            size={size}
                            innerStyles={[styles.dropDownButtonCartIconContainerPadding, innerStyleDropButton, isButtonSizeSmall && styles.dropDownButtonCartIcon]}
                            sentryLabel={sentryLabel}
                        >
                            <View style={[styles.dropDownButtonCartIconView, innerStyleDropButton]}>
                                <View style={[variant === CONST.BUTTON_VARIANT.SUCCESS ? styles.buttonSuccessDivider : styles.buttonDivider]} />
                                <View
                                    style={[
                                        isButtonSizeLarge && styles.dropDownLargeButtonArrowContain,
                                        isButtonSizeSmall && shouldUseShortForm ? styles.dropDownSmallButtonArrowContain : styles.dropDownMediumButtonArrowContain,
                                    ]}
                                >
                                    <Icon
                                        size={dropdownArrowIconSize}
                                        inline={shouldUseShortForm}
                                        width={shouldUseShortForm ? variables.iconSizeExtraSmall : undefined}
                                        height={shouldUseShortForm ? variables.iconSizeExtraSmall : undefined}
                                        src={icons.DownArrow}
                                        additionalStyles={[...(shouldUseShortForm ? [styles.pRelative, styles.t0] : []), isMenuVisible ? styles.flipUpsideDown : undefined]}
                                        fill={variant === CONST.BUTTON_VARIANT.SUCCESS ? theme.buttonSuccessText : theme.buttonIcon}
                                        testID="dropdown-arrow-icon"
                                    />
                                </View>
                            </View>
                        </Button>
                    )}
                </View>
            ) : (
                <Button
                    variant={variant}
                    ref={buttonRef}
                    isDisabled={isDisabled || !!options.at(0)?.disabled}
                    stayNormalOnDisable={stayNormalOnDisable}
                    style={[styles.w100, style]}
                    disabledStyle={disabledStyle}
                    isLoading={isLoading}
                    onPress={handleSingleOptionPress}
                    size={size}
                    innerStyles={[innerStyleDropButton, shouldShowButtonRightIcon && styles.dropDownButtonCartIconView]}
                    testID={testID}
                    sentryLabel={sentryLabel}
                >
                    {pressOnEnter && <Button.KeyboardShortcut enterKeyEventListenerPriority={enterKeyEventListenerPriority} />}
                    {!!singleOptionButtonIcon && <Button.Icon src={singleOptionButtonIcon} />}
                    {secondLineText ? (
                        <DoubleLineButtonText
                            primaryText={selectedItem?.text ?? ''}
                            primaryTextStyle={[!!singleOptionButtonIcon && styles.textAlignLeft, styles.noPaddingBottom]}
                            secondLineText={secondLineText}
                        />
                    ) : (
                        <Button.Text>{selectedItem?.text ?? ''}</Button.Text>
                    )}
                    {shouldShowButtonRightIcon && !!rightOptionIcon && (
                        <Button.Icon
                            src={rightOptionIcon}
                            style={styles.ml2}
                        />
                    )}
                </Button>
            )}
            {(shouldAlwaysShowDropdownMenu || options.length > 1) && !!popoverAnchorPosition && (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    onClose={() => {
                        setIsMenuVisible(false);
                        onOptionsMenuHide?.();
                    }}
                    onModalShow={onOptionsMenuShow}
                    onItemSelected={(selectedSubitem, index, event) => {
                        onSubItemSelected?.(selectedSubitem, index, event);
                        if (selectedSubitem.shouldCloseModalOnSelect !== false) {
                            setIsMenuVisible(false);
                        }
                    }}
                    anchorPosition={popoverAnchorPosition}
                    shouldShowRadioButton={shouldShowRadioButton}
                    anchorRef={nullCheckRef(dropdownAnchor)}
                    scrollContainerStyle={!shouldUseModalPaddingStyle && isSmallScreenWidth && {...styles.pt4, paddingBottom}}
                    anchorAlignment={anchorAlignment}
                    shouldUseModalPaddingStyle={shouldUseModalPaddingStyle}
                    headerText={menuHeaderText}
                    shouldUseScrollView={shouldPopoverUseScrollView}
                    containerStyles={containerStyles}
                    menuItems={options.map((item, index) => ({
                        ...item,
                        onSelected: item.onSelected
                            ? () => {
                                  item.onSelected?.();
                                  if (item.shouldUpdateSelectedIndex) {
                                      setSelectedItemIndex(index);
                                  }
                              }
                            : () => {
                                  onOptionSelected?.(item);
                                  if (item.shouldUpdateSelectedIndex === false) {
                                      return;
                                  }

                                  setSelectedItemIndex(index);
                              },
                        shouldCallAfterModalHide: true,
                        subMenuItems: item.subMenuItems?.map((subItem) => ({
                            ...subItem,
                            shouldCallAfterModalHide: true,
                        })),
                    }))}
                />
            )}
        </View>
    );
}

// OXC's React Compiler bails on this file (refs accessed during render), so it is not memoized on
// web. Memoize it explicitly (genericMemo preserves the generic call signature).
export default genericMemo(ButtonWithDropdownMenu);
