import type {RefObject} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import Button from '@components/Button';
import ButtonComposed from '@components/ButtonComposed';
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
import mergeRefs from '@libs/mergeRefs';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {ButtonWithDropdownMenuProps} from './types';

const defaultAnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    // we assume that popover menu opens below the button, anchor is at TOP
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function ButtonWithDropdownMenu<IValueType>({ref, ...props}: ButtonWithDropdownMenuProps<IValueType>) {
    const {
        success = true,
        isSplitButton = true,
        isLoading = false,
        isDisabled = false,
        pressOnEnter = false,
        shouldAlwaysShowDropdownMenu = false,
        menuHeaderText = '',
        customText,
        style,
        disabledStyle,
        buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
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
        shouldShowSelectedItemCheck = false,
        testID,
        secondLineText = '',
        icon,
        shouldPopoverUseScrollView = false,
        containerStyles,
        shouldUseModalPaddingStyle = true,
        shouldUseShortForm = false,
        shouldUseOptionIcon = false,
        shouldStayNormalOnDisable = false,
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
    const innerStyleDropButton = StyleUtils.getDropDownButtonHeight(buttonSize);
    const isButtonSizeLarge = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE;
    const isButtonSizeSmall = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL;
    const isButtonSizeExtraSmall = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL;
    const nullCheckRef = (refParam: RefObject<View | null>) => refParam ?? null;
    const shouldShowButtonRightIcon = !!options.at(0)?.shouldShowButtonRightIcon;

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
    const splitButtonWrapperStyle = isSplitButton ? [styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter] : {};
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

    const iconLeft = hasError ? (
        <ButtonComposed.IconLeft
            src={icons.DotIndicator}
            fill={theme.danger}
            hoverFill={theme.danger}
        />
    ) : (
        !!icon && <ButtonComposed.IconLeft src={icon} />
    );
    const firstOptionIcon = options.at(0)?.icon;

    return (
        <View style={wrapperStyle}>
            {shouldAlwaysShowDropdownMenu || options.length > 1 ? (
                <View style={[splitButtonWrapperStyle, style]}>
                    <ButtonComposed
                        variant={success ? 'success' : undefined}
                        pressOnEnter={pressOnEnter}
                        ref={dropdownButtonRef}
                        onPress={handlePress}
                        accessibilityState={!isSplitButton ? {expanded: isMenuVisible} : undefined}
                        isDisabled={isDisabled || areAllOptionsDisabled}
                        shouldStayNormalOnDisable={shouldStayNormalOnDisable}
                        isLoading={isLoading}
                        shouldRemoveBorderRadius="right"
                        style={isSplitButton ? [styles.flex1, styles.pr0] : {}}
                        size={buttonSize}
                        innerStyles={[innerStyleDropButton, !isSplitButton && styles.dropDownButtonCartIconView, isTextTooLong && shouldUseShortForm && {...styles.pl2, ...styles.pr1}]}
                        enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                        testID={testID}
                        sentryLabel={sentryLabel}
                    >
                        {iconLeft}
                        {secondLineText ? (
                            <View style={[styles.alignItemsCenter, styles.flexColumn, styles.flexShrink1, styles.mw100]}>
                                <ButtonComposed.Text style={[isTextTooLong && shouldUseShortForm ? {...styles.textExtraSmall, ...styles.textBold} : {}, styles.noPaddingBottom]}>
                                    {customText ?? selectedItem?.text ?? ''}
                                </ButtonComposed.Text>
                                <Text
                                    style={[styles.pointerEventsNone, styles.fontWeightNormal, styles.textDoubleDecker, styles.textExtraSmallSupporting, styles.textWhite, styles.textBold]}
                                    numberOfLines={1}
                                >
                                    {secondLineText}
                                </Text>
                            </View>
                        ) : (
                            <ButtonComposed.Text style={isTextTooLong && shouldUseShortForm ? {...styles.textExtraSmall, ...styles.textBold} : {}}>
                                {customText ?? selectedItem?.text ?? ''}
                            </ButtonComposed.Text>
                        )}
                        {!isSplitButton && !isLoading && options?.length > 0 && (
                            <ButtonComposed.IconRight
                                src={icons.DownArrow}
                                style={isMenuVisible ? styles.flipUpsideDown : undefined}
                                fill={hasError ? theme.buttonIcon : undefined}
                                hoverFill={hasError ? theme.buttonIcon : undefined}
                            />
                        )}
                    </ButtonComposed>

                    {isSplitButton && (
                        <Button
                            ref={dropdownAnchor}
                            success={success}
                            isDisabled={isDisabled}
                            accessibilityState={{expanded: isMenuVisible}}
                            shouldStayNormalOnDisable={shouldStayNormalOnDisable}
                            style={[styles.pl0]}
                            onPress={() => setIsMenuVisible(!isMenuVisible)}
                            shouldRemoveLeftBorderRadius
                            extraSmall={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL}
                            large={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                            medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                            small={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                            innerStyles={[styles.dropDownButtonCartIconContainerPadding, innerStyleDropButton, isButtonSizeSmall && styles.dropDownButtonCartIcon]}
                            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                            sentryLabel={sentryLabel}
                        >
                            <View style={[styles.dropDownButtonCartIconView, innerStyleDropButton]}>
                                <View style={[success ? styles.buttonSuccessDivider : styles.buttonDivider]} />
                                <View
                                    style={[
                                        isButtonSizeLarge && styles.dropDownLargeButtonArrowContain,
                                        isButtonSizeSmall && shouldUseShortForm ? styles.dropDownSmallButtonArrowContain : styles.dropDownMediumButtonArrowContain,
                                        isButtonSizeExtraSmall && styles.dropDownSmallButtonArrowContain,
                                    ]}
                                >
                                    <Icon
                                        medium={isButtonSizeLarge}
                                        small={!isButtonSizeLarge && !shouldUseShortForm}
                                        inline={shouldUseShortForm}
                                        width={shouldUseShortForm ? variables.iconSizeExtraSmall : undefined}
                                        height={shouldUseShortForm ? variables.iconSizeExtraSmall : undefined}
                                        src={icons.DownArrow}
                                        additionalStyles={[...(shouldUseShortForm ? [styles.pRelative, styles.t0] : []), isMenuVisible ? styles.flipUpsideDown : undefined]}
                                        fill={success ? theme.buttonSuccessText : theme.buttonIcon}
                                        testID="dropdown-arrow-icon"
                                    />
                                </View>
                            </View>
                        </Button>
                    )}
                </View>
            ) : (
                <ButtonComposed
                    variant={success ? 'success' : undefined}
                    pressOnEnter={pressOnEnter}
                    ref={buttonRef}
                    onPress={handleSingleOptionPress}
                    isDisabled={isDisabled || !!options.at(0)?.disabled}
                    shouldStayNormalOnDisable={shouldStayNormalOnDisable}
                    isLoading={isLoading}
                    style={[styles.w100, style]}
                    size={buttonSize}
                    innerStyles={[innerStyleDropButton, shouldShowButtonRightIcon && styles.dropDownButtonCartIconView]}
                    disabledStyle={disabledStyle}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    testID={testID}
                    sentryLabel={sentryLabel}
                >
                    {shouldUseOptionIcon && !shouldShowButtonRightIcon
                        ? !!firstOptionIcon && <ButtonComposed.IconLeft src={firstOptionIcon} />
                        : !!icon && <ButtonComposed.IconLeft src={icon} />}
                    {secondLineText ? (
                        <View style={[styles.alignItemsCenter, styles.flexColumn, styles.flexShrink1, styles.mw100]}>
                            <ButtonComposed.Text style={styles.noPaddingBottom}>{selectedItem?.text ?? ''}</ButtonComposed.Text>
                            <Text
                                style={[styles.pointerEventsNone, styles.fontWeightNormal, styles.textDoubleDecker, styles.textExtraSmallSupporting, styles.textWhite, styles.textBold]}
                                numberOfLines={1}
                            >
                                {secondLineText}
                            </Text>
                        </View>
                    ) : (
                        <ButtonComposed.Text style={isTextTooLong && shouldUseShortForm ? {...styles.textExtraSmall, ...styles.textBold} : {}}>
                            {selectedItem?.text ?? ''}
                        </ButtonComposed.Text>
                    )}
                    {shouldShowButtonRightIcon && !!firstOptionIcon && (
                        <ButtonComposed.IconRight
                            src={firstOptionIcon}
                            style={styles.ml2}
                        />
                    )}
                </ButtonComposed>
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
                    shouldShowSelectedItemCheck={shouldShowSelectedItemCheck}
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
                        subMenuItems: item.subMenuItems?.map((subItem) => ({...subItem, shouldCallAfterModalHide: true})),
                    }))}
                />
            )}
        </View>
    );
}

export default ButtonWithDropdownMenu;
