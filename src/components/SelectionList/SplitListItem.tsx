import React, {useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import Accordion from '@components/Accordion';
import Icon from '@components/Icon';
import {Folder, Tag} from '@components/Icon/Expensicons';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {initDraftSplitExpenseDataForEdit} from '@libs/actions/IOU';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import {getCleanedTagName} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import BaseListItem from './BaseListItem';
import type {ListItem, SplitListItemProps, SplitListItemType} from './types';

function SplitListItem<TItem extends ListItem>({item, isFocused, showTooltip, isDisabled, shouldPreventEnterKeySubmit, rightHandSideComponent, onFocus}: SplitListItemProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isExpanded, setIsExpanded] = useState(false);
    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isExpanded);
    const {translate} = useLocalize();

    const splitItem = item as unknown as SplitListItemType;

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.p2, styles.br2]}
            isFocused={isFocused}
            containerStyle={[styles.mh4, styles.mv1, styles.reportPreviewBoxHoverBorder, styles.br2]}
            hoverStyle={[styles.br2]}
            pressableStyle={[styles.br2, styles.p1]}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={() => setIsExpanded(!isExpanded)}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            keyForList={item.keyForList}
            onFocus={onFocus}
            pendingAction={item.pendingAction}
        >
            <View style={[styles.flexColumn]}>
                <View style={[styles.flexRow, styles.containerWithSpaceBetween]}>
                    {/* TODO: category icon */}
                    <View style={[styles.flex1]}>
                        <View style={[styles.containerWithSpaceBetween]}>
                            <View style={[styles.minHeight5, styles.justifyContentCenter]}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                                >
                                    {splitItem.dateRange}
                                </Text>
                            </View>
                            <View style={[styles.minHeight5, styles.justifyContentCenter, styles.gap2]}>
                                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                                    <Text
                                        fontSize={variables.fontSizeNormal}
                                        style={[styles.flexShrink1]}
                                        numberOfLines={1}
                                    >
                                        {splitItem.category}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto]}>
                        <Icon
                            src={isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow}
                            fill={theme.icon}
                        />
                    </View>
                </View>
                <Accordion
                    isExpanded={isAccordionExpanded}
                    isToggleTriggered={shouldAnimateAccordionSection}
                    style={[styles.mt3]}
                >
                    {splitItem.expenses.map((expense) => {
                        const formattedOriginalAmount = convertToDisplayStringWithoutCurrency(expense.originalAmount, expense.currency);
                        return (
                            <PressableWithFeedback
                                onPress={() => {
                                    // Keyboard.dismiss();
                                    // InteractionManager.runAfterInteractions(() => {
                                    //     initDraftSplitExpenseDataForEdit(draftTransaction, expense.transactionID, reportID);
                                    // });
                                }}
                                accessibilityLabel={translate('iou.splitExpense')}
                                style={[
                                    styles.flexRow,
                                    styles.pv3,
                                    styles.borderTop,
                                    styles.containerWithSpaceBetween,
                                    expense.isTransactionLinked && StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG),
                                ]}
                            >
                                <View style={[styles.flex1]}>
                                    <View style={[styles.containerWithSpaceBetween]}>
                                        <View style={[styles.minHeight5, styles.justifyContentCenter]}>
                                            <Text
                                                numberOfLines={1}
                                                style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                                            >
                                                {expense.headerText}
                                            </Text>
                                        </View>
                                        <View style={[styles.minHeight5, styles.justifyContentCenter, styles.gap2]}>
                                            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                                                <Text
                                                    fontSize={variables.fontSizeNormal}
                                                    style={[styles.flexShrink1]}
                                                    numberOfLines={1}
                                                >
                                                    {expense.description ?? expense.merchant}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.flexRow]}>
                                    <View style={[styles.justifyContentCenter]}>
                                        <MoneyRequestAmountInput
                                            autoGrow={false}
                                            amount={expense.amount}
                                            currency={expense.currency}
                                            prefixCharacter={expense.currencySymbol}
                                            disableKeyboard={false}
                                            isCurrencyPressable={false}
                                            hideFocusedState={false}
                                            hideCurrencySymbol
                                            submitBehavior="blurAndSubmit"
                                            formatAmountOnBlur
                                            onAmountChange={(amount) => expense.onSplitExpenseAmountChange(expense.transactionID, Number(amount))}
                                            prefixContainerStyle={[styles.pv0, styles.h100]}
                                            prefixStyle={styles.lineHeightUndefined}
                                            inputStyle={[styles.optionRowAmountInput, styles.lineHeightUndefined]}
                                            containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]}
                                            touchableInputWrapperStyle={[styles.ml3]}
                                            maxLength={formattedOriginalAmount.length + 1}
                                            contentWidth={(formattedOriginalAmount.length + 1) * 8}
                                            shouldApplyPaddingToContainer
                                        />
                                    </View>
                                    <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto]}>
                                        <Icon
                                            src={Expensicons.ArrowRight}
                                            fill={theme.icon}
                                        />
                                    </View>
                                </View>
                            </PressableWithFeedback>
                        );
                    })}
                </Accordion>
            </View>
        </BaseListItem>
    );
}

SplitListItem.displayName = 'SplitListItem';

export default SplitListItem;
