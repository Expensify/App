import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {Folder, Tag} from '@components/Icon/Expensicons';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import {getCleanedTagName} from '@libs/PolicyUtils';
import variables from '@styles/variables';
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
}: SplitListItemProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const splitItem = item as unknown as SplitListItemType;

    const formattedOriginalAmount = convertToDisplayStringWithoutCurrency(splitItem.originalAmount, splitItem.currency);

    const onSplitExpenseAmountChange = (amount: string) => {
        splitItem.onSplitExpenseAmountChange(splitItem.transactionID, Number(amount));
    };

    const isBottomVisible = !!splitItem.category || !!splitItem.tags?.at(0);

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.p2, styles.br2]}
            isFocused={isFocused}
            containerStyle={[
                styles.mh4,
                styles.mv1,
                styles.reportPreviewBoxHoverBorder,
                styles.br2,
                splitItem.isTransactionLinked && StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG),
            ]}
            hoverStyle={[styles.br2]}
            pressableStyle={[styles.br2, styles.p1]}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={onSelectRow}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
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
                                        {splitItem.category}
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
                                        {getCleanedTagName(splitItem.tags?.at(0) ?? '')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
                <View style={[styles.flexRow]}>
                    <View style={[styles.justifyContentCenter]}>
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
                            prefixContainerStyle={[styles.pv0]}
                            inputStyle={[styles.optionRowAmountInput]}
                            containerStyle={[styles.textInputContainer]}
                            touchableInputWrapperStyle={[styles.ml3]}
                            maxLength={formattedOriginalAmount.length}
                            contentWidth={formattedOriginalAmount.length * 8}
                        />
                    </View>
                    <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto]}>
                        <Icon
                            src={Expensicons.ArrowRight}
                            fill={theme.icon}
                        />
                    </View>
                </View>
            </View>
        </BaseListItem>
    );
}

SplitListItem.displayName = 'SplitListItem';

export default SplitListItem;
