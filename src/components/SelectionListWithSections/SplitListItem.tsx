import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToBackendAmount, convertToDisplayStringWithoutCurrency, convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import {getCommaSeparatedTagNameWithSanitizedColons} from '@libs/PolicyUtils';
import sizing from '@styles/utils/sizing';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, SplitListItemProps, SplitListItemType} from './types';

function SplitListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    onFocus,
    index,
    onInputFocus,
    onInputBlur,
}: SplitListItemProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['Folder', 'Tag'] as const);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();

    const splitItem = item as unknown as SplitListItemType;
    const shouldSkipHandleAmountChange = useRef(false);

    const formattedOriginalAmount = convertToDisplayStringWithoutCurrency(splitItem.originalAmount, splitItem.currency);

    const [isNegativeAmount, setIsNegativeAmount] = useState(splitItem.amount < 0);

    const onSplitExpenseAmountChange = useCallback(
        (amount: string) => {
            // Negative is flipped, amount change will be handled by handleToogleNegative
            if (shouldSkipHandleAmountChange.current) {
                shouldSkipHandleAmountChange.current = false;
                return;
            }
            const realAmount = isNegativeAmount ? -1 * Number(amount) : Number(amount);
            splitItem.onSplitExpenseAmountChange(splitItem.transactionID, realAmount);
        },
        [splitItem.onSplitExpenseAmountChange, isNegativeAmount, splitItem.amount],
    );

    const inputRef = useRef<BaseTextInputRef | null>(null);

    // Animated highlight style for selected item
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: splitItem.isSelected ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: splitItem.isSelected ? theme.activeComponentBG : theme.highlightBG,
        skipInitialFade: true,
        itemEnterDelay: 0,
    });

    const isBottomVisible = !!splitItem.category || !!splitItem.tags?.at(0);

    const contentWidth = (formattedOriginalAmount.length + 1) * CONST.CHARACTER_WIDTH;
    const focusHandler = useCallback(() => {
        if (!onInputFocus) {
            return;
        }

        if (!index && index !== 0) {
            return;
        }
        onInputFocus(index);
    }, [onInputFocus, index]);

    useEffect(() => {
        setIsNegativeAmount(splitItem.amount < 0);
    }, [splitItem.amount]);

    // Auto-focus input when item is selected and screen transition ends
    useLayoutEffect(() => {
        if (!splitItem.isSelected || !splitItem.isEditable || !didScreenTransitionEnd || !inputRef.current) {
            return;
        }

        inputRef.current.focus();
    }, [splitItem.isSelected, splitItem.isEditable, didScreenTransitionEnd]);

    const inputCallbackRef = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
    };

    const canUseTouchScreen = useMemo(() => canUseTouchScreenUtil(), [canUseTouchScreenUtil]);
    const displayedAmount = useMemo(() => Math.abs(splitItem.amount), [splitItem.amount]);

    const handleToogleNegative = useCallback(() => {
        const isCurrentlyNegative = !isNegativeAmount;
        const currentAbsAmount = Math.abs(convertToFrontendAmountAsInteger(splitItem.amount, splitItem.currency));
        if (currentAbsAmount === 0) {
            setIsNegativeAmount(isCurrentlyNegative);
            return;
        }

        const realAmount = isCurrentlyNegative ? -1 * currentAbsAmount : currentAbsAmount;
        shouldSkipHandleAmountChange.current = true;
        splitItem.onSplitExpenseAmountChange(splitItem.transactionID, realAmount);
    }, [splitItem.amount, isNegativeAmount, splitItem.transactionID]);

    const handleClearNegative = useCallback(() => {
        if (canUseTouchScreen) {
            return;
        }

        setIsNegativeAmount(false);
    }, [canUseTouchScreen, splitItem.amount]);

    return (
        <BaseListItem
            item={item}
            isFocused={isFocused}
            pressableWrapperStyle={[styles.mh4, styles.mv1, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.br3, animatedHighlightStyle]}
            hoverStyle={[styles.br2, {borderColor: theme.hoverComponentBG}]}
            pressableStyle={[styles.br2, styles.bgTransparent]}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={onSelectRow}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            shouldUseDefaultRightHandSideCheckmark={false}
            shouldHighlightSelectedItem={false}
            keyForList={item.keyForList}
            onFocus={onFocus}
            pendingAction={item.pendingAction}
        >
            <View style={[styles.flexRow, styles.containerWithSpaceBetween, styles.p3]}>
                <View style={[styles.flex1]}>
                    <View style={[styles.containerWithSpaceBetween, !isBottomVisible && styles.justifyContentCenter]}>
                        <View style={[styles.minHeight5, styles.justifyContentCenter]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                            >
                                {splitItem.headerText}
                            </Text>
                        </View>
                        <View style={[styles.minHeight5, styles.justifyContentCenter, styles.gap2]}>
                            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                                <Text
                                    fontSize={variables.fontSizeNormal}
                                    style={[styles.flexShrink1]}
                                    numberOfLines={1}
                                >
                                    {splitItem.merchant}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {isBottomVisible && (
                        <View style={[styles.splitItemBottomContent]}>
                            {!!splitItem.category && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.pr1, styles.flexShrink1, !!splitItem.tags?.at(0) && styles.mw50]}>
                                    <Icon
                                        src={icons.Folder}
                                        height={variables.iconSizeExtraSmall}
                                        width={variables.iconSizeExtraSmall}
                                        fill={theme.icon}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                                    >
                                        {getDecodedCategoryName(splitItem.category)}
                                    </Text>
                                </View>
                            )}
                            {!!splitItem.tags?.at(0) && (
                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.pl1, !!splitItem.category && styles.mw50]}>
                                    <Icon
                                        src={icons.Tag}
                                        height={variables.iconSizeExtraSmall}
                                        width={variables.iconSizeExtraSmall}
                                        fill={theme.icon}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                                    >
                                        {getCommaSeparatedTagNameWithSanitizedColons(splitItem.tags?.at(0) ?? '')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
                <View style={[styles.flexRow]}>
                    <View style={[styles.justifyContentCenter]}>
                        <MoneyRequestAmountInput
                            ref={inputCallbackRef}
                            disabled={!splitItem.isEditable}
                            autoGrow={false}
                            amount={displayedAmount}
                            currency={splitItem.currency}
                            prefixCharacter={splitItem.currencySymbol}
                            disableKeyboard={false}
                            isCurrencyPressable={false}
                            hideFocusedState={false}
                            hideCurrencySymbol
                            submitBehavior="blurAndSubmit"
                            formatAmountOnBlur
                            onAmountChange={onSplitExpenseAmountChange}
                            prefixContainerStyle={[styles.pv0, styles.h100]}
                            prefixStyle={[styles.lineHeightUndefined]}
                            inputStyle={[styles.optionRowAmountInput, styles.lineHeightUndefined]}
                            containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]}
                            touchableInputWrapperStyle={[styles.ml3]}
                            maxLength={formattedOriginalAmount.length + 1}
                            contentWidth={contentWidth}
                            shouldApplyPaddingToContainer
                            shouldUseDefaultLineHeightForPrefix={false}
                            shouldWrapInputInContainer={false}
                            onFocus={focusHandler}
                            onBlur={onInputBlur}
                            toggleNegative={handleToogleNegative}
                            clearNegative={handleClearNegative}
                            isNegative={isNegativeAmount}
                            allowFlippingAmount
                            symbolTextStyle={[styles.flexRow]}
                            isSplitItemInput
                        />
                    </View>
                    <View style={[styles.popoverMenuIcon]}>
                        {!splitItem.isEditable ? null : (
                            <View style={styles.pointerEventsAuto}>
                                <Icon
                                    src={Expensicons.ArrowRight}
                                    fill={theme.icon}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </BaseListItem>
    );
}

SplitListItem.displayName = 'SplitListItem';

export default SplitListItem;
