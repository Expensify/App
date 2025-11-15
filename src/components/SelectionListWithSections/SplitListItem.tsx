import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import PercentageForm from '@components/PercentageForm';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import {getCommaSeparatedTagNameWithSanitizedColons} from '@libs/PolicyUtils';
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
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {Folder, Tag, ArrowRight} = useMemoizedLazyExpensifyIcons(['Folder', 'Tag', 'ArrowRight'] as const);

    const splitItem = item as unknown as SplitListItemType;

    const formattedOriginalAmount = convertToDisplayStringWithoutCurrency(splitItem.originalAmount, splitItem.currency);

    const onSplitExpenseAmountChange = useCallback(
        (amount: string) => {
            splitItem.onSplitExpenseAmountChange(splitItem.transactionID, Number(amount));
        },
        [splitItem],
    );

    const onSplitExpensePercentageChange = useCallback(
        (value: string) => {
            const percentageNumber = Number(value || 0);
            splitItem.onSplitExpensePercentageChange?.(splitItem.transactionID, Number.isNaN(percentageNumber) ? 0 : percentageNumber);
        },
        [splitItem],
    );

    const isBottomVisible = !!splitItem.category || !!splitItem.tags?.at(0);

    const [prefixCharacterMargin, setPrefixCharacterMargin] = useState<number>(CONST.CHARACTER_WIDTH);
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

    const SplitAmountComponent = useMemo(() => {
        if (splitItem.isEditable) {
            return (
                <MoneyRequestAmountInput
                    autoGrow={false}
                    amount={splitItem.amount}
                    currency={splitItem.currency}
                    prefixCharacter={splitItem.currencySymbol}
                    disableKeyboard={false}
                    isCurrencyPressable={false}
                    hideFocusedState={false}
                    hideCurrencySymbol
                    submitBehavior="blurAndSubmit"
                    formatAmountOnBlur
                    onAmountChange={onSplitExpenseAmountChange}
                    prefixContainerStyle={[styles.pl1, styles.pv0, styles.h100]}
                    prefixStyle={styles.lineHeightUndefined}
                    inputStyle={styles.optionRowAmountInputContainer}
                    containerStyle={[StyleUtils.splitAmountInputStyles(styles, isSmallScreenWidth), styles.textInputContainer]}
                    touchableInputWrapperStyle={[styles.ml3]}
                    maxLength={formattedOriginalAmount.length + 1}
                    shouldApplyPaddingToContainer
                    shouldUseDefaultLineHeightForPrefix={false}
                    shouldWrapInputInContainer={false}
                    onFocus={focusHandler}
                    onBlur={onInputBlur}
                />
            );
        }
        return (
            <View style={styles.cannotBeEditedSplitInputContainer}>
                <Text
                    style={[styles.optionRowAmountInput, styles.pAbsolute]}
                    onLayout={(event) => {
                        if (event.nativeEvent.layout.width === 0 && event.nativeEvent.layout.height === 0) {
                            return;
                        }
                        setPrefixCharacterMargin(event?.nativeEvent?.layout.width);
                    }}
                >
                    {splitItem.currencySymbol}
                </Text>
                <Text
                    style={[styles.getSplitListItemAmountStyle(prefixCharacterMargin, contentWidth), styles.textAlignLeft]}
                    numberOfLines={1}
                >
                    {convertToDisplayStringWithoutCurrency(splitItem.amount, splitItem.currency)}
                </Text>
            </View>
        );
    }, [
        StyleUtils,
        isSmallScreenWidth,
        styles,
        contentWidth,
        prefixCharacterMargin,
        splitItem.isEditable,
        splitItem.amount,
        splitItem.currency,
        splitItem.currencySymbol,
        formattedOriginalAmount.length,
        onSplitExpenseAmountChange,
        focusHandler,
        onInputBlur,
    ]);

    const SplitPercentageComponent = useMemo(() => {
        if (splitItem.isEditable) {
            return (
                <PercentageForm
                    onInputChange={onSplitExpensePercentageChange}
                    value={String(splitItem.percentage ?? 0)}
                    textInputContainerStyles={StyleUtils.splitPercentageInputStyles(styles)}
                    containerStyles={styles.optionRowPercentInputContainer}
                    inputStyle={[styles.optionRowPercentInput, styles.mrHalf, styles.lineHeightUndefined]}
                    onFocus={focusHandler}
                    onBlur={onInputBlur}
                />
            );
        }
        return <Text style={[styles.optionRowAmountInput, styles.pl3]}>{`${splitItem.percentage ?? 0}%`}</Text>;
    }, [StyleUtils, styles, splitItem.isEditable, splitItem.percentage, onSplitExpensePercentageChange, focusHandler, onInputBlur]);

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.p3, styles.br3]}
            isFocused={isFocused}
            containerStyle={[styles.mh4, styles.mv1, styles.reportPreviewBoxHoverBorder, styles.br2, splitItem.isSelected && StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG)]}
            hoverStyle={[styles.br2]}
            pressableStyle={[styles.br2]}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={onSelectRow}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            shouldUseDefaultRightHandSideCheckmark={false}
            keyForList={item.keyForList}
            onFocus={onFocus}
            pendingAction={item.pendingAction}
        >
            <View style={[styles.flexRow, styles.containerWithSpaceBetween]}>
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
                                        src={Folder}
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
                                        src={Tag}
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
                    <View style={[styles.justifyContentCenter]}>{splitItem.mode === CONST.IOU.SPLIT_TYPE.PERCENTAGE ? SplitPercentageComponent : SplitAmountComponent}</View>
                    <View style={[styles.popoverMenuIcon]}>
                        {!splitItem.isEditable ? null : (
                            <View style={styles.pointerEventsAuto}>
                                <Icon
                                    src={ArrowRight}
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
