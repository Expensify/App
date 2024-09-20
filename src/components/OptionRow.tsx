import lodashIsEqual from 'lodash/isEqual';
import React, {useEffect, useRef, useState} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {InteractionManager, StyleSheet, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import fallbackIcon from '@src/utils/getDefaultIcon';
import Button from './Button';
import DisplayNames from './DisplayNames';
import Hoverable from './Hoverable';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MoneyRequestAmountInput from './MoneyRequestAmountInput';
import MultipleAvatars from './MultipleAvatars';
import OfflineWithFeedback from './OfflineWithFeedback';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import SelectCircle from './SelectCircle';
import SubscriptAvatar from './SubscriptAvatar';
import Text from './Text';

type OptionRowProps = {
    /** Style for hovered state */
    hoverStyle?: StyleProp<ViewStyle>;

    /** Option to allow the user to choose from can be type 'report' or 'user' */
    option: OptionData;

    /** Whether this option is currently in focus so we can modify its style */
    optionIsFocused?: boolean;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (option: OptionData, refElement: View | HTMLDivElement | null) => void | Promise<void>;

    /** Whether we should show the selected state */
    showSelectedState?: boolean;

    /** Whether to show a button pill instead of a tickbox */
    shouldShowSelectedStateAsButton?: boolean;

    /** Text for button pill */
    selectedStateButtonText?: string;

    /** Callback to fire when the multiple selector (tickbox or button) is clicked */
    onSelectedStatePressed?: (option: OptionData) => void;

    /** Whether we highlight selected option */
    highlightSelected?: boolean;

    /** Whether this item is selected */
    isSelected?: boolean;

    /** Display the text of the option in bold font style */
    boldStyle?: boolean;

    /** Whether to show the title tooltip */
    showTitleTooltip?: boolean;

    /** Whether this option should be disabled */
    isDisabled?: boolean;

    /** Whether to show a line separating options in list */
    shouldHaveOptionSeparator?: boolean;

    /** Whether to remove the lateral padding and align the content with the margins */
    shouldDisableRowInnerPadding?: boolean;

    /** Whether to prevent default focusing on select */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Whether to wrap large text up to 2 lines */
    isMultilineSupported?: boolean;

    /** Display name and alternate text style */
    style?: StyleProp<TextStyle>;

    /** Hovered background color */
    backgroundColor?: string;

    /** Key used internally by React */
    keyForList?: string;
};

function OptionRow({
    option,
    onSelectRow,
    style,
    hoverStyle,
    selectedStateButtonText,
    keyForList,
    isDisabled: isOptionDisabled = false,
    isMultilineSupported = false,
    shouldShowSelectedStateAsButton = false,
    highlightSelected = false,
    shouldHaveOptionSeparator = false,
    showTitleTooltip = false,
    optionIsFocused = false,
    boldStyle = false,
    onSelectedStatePressed = () => {},
    backgroundColor,
    isSelected = false,
    showSelectedState = false,
    shouldDisableRowInnerPadding = false,
    shouldPreventDefaultFocusOnSelectRow = false,
}: OptionRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const pressableRef = useRef<View | HTMLDivElement>(null);
    const [isDisabled, setIsDisabled] = useState(isOptionDisabled);

    useEffect(() => {
        setIsDisabled(isOptionDisabled);
    }, [isOptionDisabled]);

    const text = option.text ?? '';
    const fullTitle = isMultilineSupported ? text.trimStart() : text;
    const indentsLength = text.length - fullTitle.length;
    const paddingLeft = Math.floor(indentsLength / CONST.INDENTS.length) * styles.ml3.marginLeft;
    const textStyle = optionIsFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = boldStyle || option.boldStyle ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle: StyleProp<TextStyle> = [
        styles.optionDisplayName,
        textUnreadStyle,
        style,
        styles.pre,
        isDisabled ? styles.optionRowDisabled : {},
        isMultilineSupported ? {paddingLeft} : {},
    ];
    const alternateTextStyle: StyleProp<TextStyle> = [
        textStyle,
        styles.optionAlternateText,
        styles.textLabelSupporting,
        style,
        (option.alternateTextMaxLines ?? 1) === 1 ? styles.pre : styles.preWrap,
    ];
    const contentContainerStyles = [styles.flex1, styles.mr3];
    const sidebarInnerRowStyle = StyleSheet.flatten([styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter]);
    const flattenHoverStyle = StyleSheet.flatten(hoverStyle);
    const hoveredStyle = hoverStyle ? flattenHoverStyle : styles.sidebarLinkHover;
    const hoveredBackgroundColor = hoveredStyle?.backgroundColor ? (hoveredStyle.backgroundColor as string) : backgroundColor;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const shouldUseShortFormInTooltip = (option.participantsList?.length ?? 0) > 1;

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips((option.participantsList ?? (option.accountID ? [option] : [])).slice(0, 10), shouldUseShortFormInTooltip);
    let subscriptColor = theme.appBG;
    if (optionIsFocused) {
        subscriptColor = focusedBackgroundColor;
    }

    return (
        <Hoverable>
            {(hovered) => (
                <OfflineWithFeedback
                    pendingAction={option.pendingAction}
                    errors={option.allReportErrors}
                    shouldShowErrorMessages={false}
                    needsOffscreenAlphaCompositing
                >
                    <PressableWithFeedback
                        id={keyForList}
                        ref={pressableRef}
                        onPress={(e) => {
                            if (!onSelectRow) {
                                return;
                            }

                            setIsDisabled(true);
                            if (e) {
                                e.preventDefault();
                            }
                            let result = onSelectRow(option, pressableRef.current);
                            if (!(result instanceof Promise)) {
                                result = Promise.resolve();
                            }

                            InteractionManager.runAfterInteractions(() => {
                                result?.finally(() => setIsDisabled(isOptionDisabled));
                            });
                        }}
                        disabled={isDisabled}
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                            styles.sidebarLink,
                            !isOptionDisabled && styles.cursorPointer,
                            shouldDisableRowInnerPadding ? null : styles.sidebarLinkInner,
                            optionIsFocused ? styles.sidebarLinkActive : null,
                            shouldHaveOptionSeparator && styles.borderTop,
                            !onSelectRow && !isOptionDisabled ? styles.cursorDefault : null,
                        ]}
                        accessibilityLabel={option.text ?? ''}
                        role={CONST.ROLE.BUTTON}
                        hoverDimmingValue={1}
                        hoverStyle={!optionIsFocused ? hoverStyle ?? styles.sidebarLinkHover : undefined}
                        needsOffscreenAlphaCompositing={(option.icons?.length ?? 0) >= 2}
                        onMouseDown={shouldPreventDefaultFocusOnSelectRow ? (event) => event.preventDefault() : undefined}
                        tabIndex={option.tabIndex ?? 0}
                    >
                        <View style={sidebarInnerRowStyle}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {!!option.icons?.length &&
                                    (option.shouldShowSubscript ? (
                                        <SubscriptAvatar
                                            mainAvatar={option.icons.at(0) ?? fallbackIcon}
                                            secondaryAvatar={option.icons.at(1)}
                                            backgroundColor={hovered && !optionIsFocused ? hoveredBackgroundColor : subscriptColor}
                                            size={CONST.AVATAR_SIZE.DEFAULT}
                                        />
                                    ) : (
                                        <MultipleAvatars
                                            icons={option.icons}
                                            size={CONST.AVATAR_SIZE.DEFAULT}
                                            secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(hovered && !optionIsFocused ? hoveredBackgroundColor : subscriptColor)]}
                                            shouldShowTooltip={showTitleTooltip && OptionsListUtils.shouldOptionShowTooltip(option)}
                                        />
                                    ))}
                                <View style={contentContainerStyles}>
                                    <DisplayNames
                                        accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')}
                                        fullTitle={fullTitle}
                                        displayNamesWithTooltips={displayNamesWithTooltips}
                                        tooltipEnabled={showTitleTooltip}
                                        numberOfLines={isMultilineSupported ? 2 : 1}
                                        textStyles={displayNameStyle}
                                        shouldUseFullTitle={
                                            !!option.isChatRoom ||
                                            !!option.isPolicyExpenseChat ||
                                            !!option.isMoneyRequestReport ||
                                            !!option.isThread ||
                                            !!option.isTaskReport ||
                                            !!option.isSelfDM
                                        }
                                    />
                                    {option.alternateText ? (
                                        <Text
                                            style={alternateTextStyle}
                                            numberOfLines={option.alternateTextMaxLines ?? 1}
                                        >
                                            {option.alternateText}
                                        </Text>
                                    ) : null}
                                </View>
                                {option.descriptiveText ? (
                                    <View style={[styles.flexWrap, styles.pl2]}>
                                        <Text style={[styles.textLabel]}>{option.descriptiveText}</Text>
                                    </View>
                                ) : null}
                                {option.shouldShowAmountInput && option.amountInputProps ? (
                                    <MoneyRequestAmountInput
                                        amount={option.amountInputProps.amount}
                                        currency={option.amountInputProps.currency}
                                        prefixCharacter={option.amountInputProps.prefixCharacter}
                                        disableKeyboard={false}
                                        isCurrencyPressable={false}
                                        hideFocusedState={false}
                                        hideCurrencySymbol
                                        formatAmountOnBlur
                                        prefixContainerStyle={[styles.pv0]}
                                        containerStyle={[styles.textInputContainer]}
                                        inputStyle={[
                                            styles.optionRowAmountInput,
                                            StyleUtils.getPaddingLeft(StyleUtils.getCharacterPadding(option.amountInputProps.prefixCharacter ?? '') + styles.pl1.paddingLeft) as TextStyle,
                                            option.amountInputProps.inputStyle,
                                        ]}
                                        onAmountChange={option.amountInputProps.onAmountChange}
                                        maxLength={option.amountInputProps.maxLength}
                                    />
                                ) : null}
                                {!isSelected && option.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={theme.danger}
                                        />
                                    </View>
                                )}
                                {!isSelected && option.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={theme.iconSuccessFill}
                                        />
                                    </View>
                                )}
                                {showSelectedState &&
                                    (shouldShowSelectedStateAsButton && !isSelected ? (
                                        <Button
                                            style={[styles.pl2]}
                                            text={selectedStateButtonText ?? translate('common.select')}
                                            onPress={() => onSelectedStatePressed(option)}
                                            small
                                            shouldUseDefaultHover={false}
                                        />
                                    ) : (
                                        <PressableWithFeedback
                                            onPress={() => onSelectedStatePressed(option)}
                                            disabled={isDisabled}
                                            role={CONST.ROLE.BUTTON}
                                            accessibilityLabel={CONST.ROLE.BUTTON}
                                            style={[styles.ml2, styles.optionSelectCircle]}
                                        >
                                            <SelectCircle
                                                isChecked={isSelected}
                                                selectCircleStyles={styles.ml0}
                                            />
                                        </PressableWithFeedback>
                                    ))}
                                {isSelected && highlightSelected && (
                                    <View style={styles.defaultCheckmarkWrapper}>
                                        <Icon
                                            src={Expensicons.Checkmark}
                                            fill={theme.iconSuccessFill}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        {!!option.customIcon && (
                            <View
                                style={[styles.flexRow, styles.alignItemsCenter]}
                                accessible={false}
                            >
                                <View>
                                    <Icon
                                        src={option.customIcon.src}
                                        fill={option.customIcon.color}
                                    />
                                </View>
                            </View>
                        )}
                    </PressableWithFeedback>
                </OfflineWithFeedback>
            )}
        </Hoverable>
    );
}

OptionRow.displayName = 'OptionRow';

export default React.memo(
    OptionRow,
    (prevProps, nextProps) =>
        prevProps.isDisabled === nextProps.isDisabled &&
        prevProps.isMultilineSupported === nextProps.isMultilineSupported &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.shouldHaveOptionSeparator === nextProps.shouldHaveOptionSeparator &&
        prevProps.selectedStateButtonText === nextProps.selectedStateButtonText &&
        prevProps.showSelectedState === nextProps.showSelectedState &&
        prevProps.highlightSelected === nextProps.highlightSelected &&
        prevProps.showTitleTooltip === nextProps.showTitleTooltip &&
        lodashIsEqual(prevProps.option.icons, nextProps.option.icons) &&
        prevProps.optionIsFocused === nextProps.optionIsFocused &&
        prevProps.option.text === nextProps.option.text &&
        prevProps.option.alternateText === nextProps.option.alternateText &&
        prevProps.option.descriptiveText === nextProps.option.descriptiveText &&
        prevProps.option.brickRoadIndicator === nextProps.option.brickRoadIndicator &&
        prevProps.option.shouldShowSubscript === nextProps.option.shouldShowSubscript &&
        prevProps.option.ownerAccountID === nextProps.option.ownerAccountID &&
        prevProps.option.subtitle === nextProps.option.subtitle &&
        prevProps.option.pendingAction === nextProps.option.pendingAction &&
        prevProps.option.customIcon === nextProps.option.customIcon &&
        prevProps.option.tabIndex === nextProps.option.tabIndex &&
        lodashIsEqual(prevProps.option.amountInputProps, nextProps.option.amountInputProps),
);

export type {OptionRowProps};
