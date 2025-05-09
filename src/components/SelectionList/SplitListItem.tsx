import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {Folder, Tag} from '@components/Icon/Expensicons';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import Text from '@components/Text';
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

    const splitItem = item as unknown as SplitListItemType;

    const formattedOriginalAmount = convertToDisplayStringWithoutCurrency(splitItem.originalAmount, splitItem.currency);

    const onSplitExpenseAmountChange = (amount: string) => {
        splitItem.onSplitExpenseAmountChange(splitItem.transactionID, Number(amount));
    };

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.p3, styles.br2]}
            isFocused={isFocused}
            containerStyle={[styles.mh4, styles.mv2, styles.reportPreviewBoxHoverBorder, styles.br2]}
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
            <View>
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                    >
                        {splitItem.headerText}
                    </Text>
                </View>
                <View style={[styles.flexRow, styles.mtn2]}>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.justifyContentBetween]}>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <Text
                                fontSize={variables.fontSizeNormal}
                                style={[styles.flexShrink1]}
                                numberOfLines={1}
                            >
                                {splitItem.merchant}
                            </Text>
                        </View>
                        <View style={[styles.flexRow]}>
                            <MoneyRequestAmountInput
                                autoGrow={false}
                                amount={splitItem.amount}
                                currency={splitItem.currency}
                                prefixCharacter={splitItem.currencySymbol}
                                disableKeyboard={false}
                                isCurrencyPressable={false}
                                hideFocusedState={false}
                                hideCurrencySymbol
                                formatAmountOnBlur
                                onAmountChange={onSplitExpenseAmountChange}
                                prefixContainerStyle={[styles.pv0]}
                                inputStyle={[styles.optionRowAmountInput]}
                                containerStyle={[styles.textInputContainer]}
                                touchableInputWrapperStyle={[styles.ml3]}
                                maxLength={formattedOriginalAmount.length}
                                contentWidth={formattedOriginalAmount.length * 8}
                            />
                            <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto]}>
                                <Icon
                                    src={Expensicons.ArrowRight}
                                    fill={theme.icon}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.splitItemBottomContent]}>
                    {!!splitItem.category && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.mw50, styles.pr1, styles.flexShrink1]}>
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
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.pl1]}>
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
                    <View style={[styles.textInputContainer, styles.pr10, styles.borderNone, styles.ml3]} />
                </View>
            </View>
        </BaseListItem>
    );
}

SplitListItem.displayName = 'SplitListItem';

export default SplitListItem;
