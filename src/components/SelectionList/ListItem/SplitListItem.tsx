import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ListItemComposed from '@components/SelectionList/ListItemComposed';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useRowHighlightAnimation from '@hooks/useRowHighlightAnimation';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedFullCategoryName} from '@libs/CategoryUtils';
import {getCommaSeparatedTagNameWithSanitizedColons} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useCallback, useState} from 'react';
import {View} from 'react-native';

import type {ListItemProps, SplitListItemType} from './types';

import SplitAmountDisplay from './SplitListItem/SplitAmountDisplay';
import SplitListItemInput from './SplitListItem/SplitListItemInput';

/**
 * A rich row showing merchant, date, category/tags, and an editable amount or percentage input.
 * Used in split expense flows to allocate amounts across participants.
 */
function SplitListItem<TItem extends SplitListItemType>({item, isFocused, showTooltip, isDisabled, onSelectRow, shouldPreventEnterKeySubmit, onFocus}: ListItemProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Folder', 'Tag']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayStringWithoutCurrency} = useCurrencyListActions();

    const formattedOriginalAmount = convertToDisplayStringWithoutCurrency(item.originalAmount, item.currency);

    const onSplitExpenseValueChange = useCallback(
        (value: string) => {
            const numericValue = Number(value);
            // Skip update if value is just "-" or produces NaN (intermediate input state)
            if (Number.isNaN(numericValue)) {
                return;
            }
            item.onSplitExpenseValueChange(item.transactionID, numericValue, item.mode);
        },
        [item],
    );

    const {inputCallbackRef: autoFocusCallbackRef} = useAutoFocusInput();

    // Animated highlight style for selected item
    const animatedHighlightStyle = useRowHighlightAnimation({
        shouldHighlight: item.isSelected ?? false,
        isSelected: item.isSelected,
        skipInitialFade: true,
        itemEnterDelay: 0,
    });

    const isBottomVisible = !!item.category || !!item.tags?.at(0);

    const contentWidth = (formattedOriginalAmount.length + 1) * CONST.CHARACTER_WIDTH;
    const [percentageDraft, setPercentageDraft] = useState<string | undefined>();
    const focusHandler = useCallback(() => {
        item.onInputFocus?.(item);
    }, [item]);

    // Only connect the auto-focus ref to the selected item so useAutoFocusInput's useFocusEffect
    // cleanup can cancel any pending focus task when the screen starts closing, preventing
    // the focused input from interfering with the close animation.
    const inputCallbackRef: (ref: BaseTextInputRef | null) => void = (ref) => {
        if (!item.isSelected || !item.isEditable) {
            return;
        }
        (autoFocusCallbackRef as unknown as (ref: BaseTextInputRef | null) => void)(ref);
    };

    const isPercentageMode = item.mode === CONST.TAB.SPLIT.PERCENTAGE;

    // Build accessibility label for the grouped text content (date, merchant, category, tags)
    const textContentAccessibilityLabel = [
        item.headerText,
        item.merchant,
        item.category ? getDecodedFullCategoryName(item.category) : undefined,
        item.tags?.at(0) ? getCommaSeparatedTagNameWithSanitizedColons(item.tags.at(0) ?? '') : undefined,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <ListItemComposed
            item={item}
            isFocused={isFocused}
            pressableWrapperStyle={[styles.mh4, styles.mv1, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.br3, animatedHighlightStyle]}
            hoverStyle={[styles.br2, {borderColor: theme.hoverComponentBG}]}
            pressableStyle={[styles.br2, styles.bgTransparent]}
            isDisabled={isDisabled}
            shouldShowTooltip={showTooltip}
            onSelectRow={onSelectRow}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            onFocus={onFocus}
            accessible={!item.isEditable}
        >
            <View style={[styles.flexRow, styles.containerWithSpaceBetween, styles.p3]}>
                <View
                    style={styles.flex1}
                    accessible={item.isEditable}
                    accessibilityLabel={textContentAccessibilityLabel}
                    aria-label={item.isEditable ? textContentAccessibilityLabel : undefined}
                    tabIndex={item.isEditable ? 0 : undefined}
                    role={item.isEditable ? CONST.ROLE.SUMMARY : undefined}
                >
                    <View
                        style={[styles.containerWithSpaceBetween, !isBottomVisible && styles.justifyContentCenter]}
                        aria-hidden={item.isEditable ? true : undefined}
                    >
                        <View style={[styles.minHeight5, styles.justifyContentCenter]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                            >
                                {item.headerText}
                            </Text>
                        </View>
                        <View style={[styles.minHeight5, styles.justifyContentCenter]}>
                            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.gap1]}>
                                <Text
                                    style={styles.flexShrink1}
                                    numberOfLines={1}
                                >
                                    {item.merchant}
                                </Text>
                                {isPercentageMode && (
                                    <SplitAmountDisplay
                                        shouldRemoveSpacing
                                        splitItem={item}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                    {isBottomVisible && (
                        <View
                            style={styles.splitItemBottomContent}
                            aria-hidden={item.isEditable ? true : undefined}
                        >
                            {!!item.category && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.pr1, styles.flexShrink1, !!item.tags?.at(0) && styles.mw50]}>
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
                                        {getDecodedFullCategoryName(item.category)}
                                    </Text>
                                </View>
                            )}
                            {!!item.tags?.at(0) && (
                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.pl1, !!item.category && styles.mw50]}>
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
                                        {getCommaSeparatedTagNameWithSanitizedColons(item.tags?.at(0) ?? '')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
                <View style={styles.flexRow}>
                    <View style={styles.justifyContentCenter}>
                        <SplitListItemInput
                            isPercentageMode={isPercentageMode}
                            splitItem={item}
                            contentWidth={contentWidth}
                            formattedOriginalAmount={formattedOriginalAmount}
                            percentageDraft={percentageDraft}
                            onSplitExpenseValueChange={onSplitExpenseValueChange}
                            setPercentageDraft={setPercentageDraft}
                            focusHandler={focusHandler}
                            inputCallbackRef={inputCallbackRef}
                        />
                    </View>
                    <View style={styles.popoverMenuIcon}>
                        {!item.isEditable ? null : (
                            <PressableWithFeedback
                                onPress={() => onSelectRow(item)}
                                accessibilityLabel={translate('common.edit')}
                                role="button"
                                style={styles.pointerEventsAuto}
                                sentryLabel={CONST.SENTRY_LABEL.SELECTION_LIST.SPLIT_LIST_ITEM_EDIT_BUTTON}
                            >
                                <Icon
                                    src={icons.ArrowRight}
                                    fill={theme.icon}
                                />
                            </PressableWithFeedback>
                        )}
                    </View>
                </View>
            </View>
        </ListItemComposed>
    );
}

export default SplitListItem;
