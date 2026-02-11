import React, {useCallback, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import {getCommaSeparatedTagNameWithSanitizedColons} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import SplitAmountDisplay from './SplitListItem/SplitAmountDisplay';
import SplitListItemInput from './SplitListItem/SplitListItemInput';
import type {SplitListItemProps, SplitListItemType} from './types';

function SplitListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    onFocus,
    onInputFocus,
    onInputBlur,
}: SplitListItemProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Folder', 'Tag'] as const);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();

    const splitItem = item as unknown as SplitListItemType;

    const formattedOriginalAmount = convertToDisplayStringWithoutCurrency(splitItem.originalAmount, splitItem.currency);

    const onSplitExpenseValueChange = useCallback((value: string) => splitItem.onSplitExpenseValueChange(splitItem.transactionID, Number(value), splitItem.mode), [splitItem]);

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
    const [percentageDraft, setPercentageDraft] = useState<string | undefined>();
    const focusHandler = useCallback(() => {
        onInputFocus?.(item);
    }, [onInputFocus, item]);

    // Auto-focus input when item is selected and screen transition ends
    useEffect(() => {
        if (!didScreenTransitionEnd || !splitItem.isSelected || !splitItem.isEditable || !inputRef.current) {
            return;
        }

        // Use InteractionManager to ensure input focus happens after all animations/interactions complete.
        // This prevents focus from interrupting modal close/open animations which would cause UI glitches
        // and "jumping" behavior when quickly navigating between screens.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            inputRef.current?.focus();
        });
    }, [didScreenTransitionEnd, splitItem.isSelected, splitItem.isEditable]);

    const inputCallbackRef = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
    };

    const isPercentageMode = splitItem.mode === CONST.TAB.SPLIT.PERCENTAGE;

    // Build accessibility label for the grouped text content (date, merchant, category, tags)
    const textContentAccessibilityLabel = [
        splitItem.headerText,
        splitItem.merchant,
        splitItem.category ? getDecodedCategoryName(splitItem.category) : undefined,
        splitItem.tags?.at(0) ? getCommaSeparatedTagNameWithSanitizedColons(splitItem.tags.at(0) ?? '') : undefined,
    ]
        .filter(Boolean)
        .join(', ');

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
            accessible={!splitItem.isEditable}
        >
            <View style={[styles.flexRow, styles.containerWithSpaceBetween, styles.p3]}>
                <View
                    style={[styles.flex1]}
                    accessible={splitItem.isEditable}
                    accessibilityLabel={textContentAccessibilityLabel}
                    aria-label={splitItem.isEditable ? textContentAccessibilityLabel : undefined}
                    tabIndex={splitItem.isEditable ? 0 : undefined}
                    role={splitItem.isEditable ? CONST.ROLE.SUMMARY : undefined}
                >
                    <View
                        style={[styles.containerWithSpaceBetween, !isBottomVisible && styles.justifyContentCenter]}
                        aria-hidden={splitItem.isEditable ? true : undefined}
                    >
                        <View style={[styles.minHeight5, styles.justifyContentCenter]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                            >
                                {splitItem.headerText}
                            </Text>
                        </View>
                        <View style={[styles.minHeight5, styles.justifyContentCenter]}>
                            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.gap1]}>
                                <Text
                                    fontSize={variables.fontSizeNormal}
                                    style={[styles.flexShrink1]}
                                    numberOfLines={1}
                                >
                                    {splitItem.merchant}
                                </Text>
                                {isPercentageMode && (
                                    <SplitAmountDisplay
                                        shouldRemoveSpacing
                                        splitItem={splitItem}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                    {isBottomVisible && (
                        <View
                            style={[styles.splitItemBottomContent]}
                            aria-hidden={splitItem.isEditable ? true : undefined}
                        >
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
                        <SplitListItemInput
                            isPercentageMode={isPercentageMode}
                            splitItem={splitItem}
                            contentWidth={contentWidth}
                            formattedOriginalAmount={formattedOriginalAmount}
                            percentageDraft={percentageDraft}
                            onSplitExpenseValueChange={onSplitExpenseValueChange}
                            setPercentageDraft={setPercentageDraft}
                            focusHandler={focusHandler}
                            onInputBlur={onInputBlur}
                            inputCallbackRef={inputCallbackRef}
                        />
                    </View>
                    <View style={[styles.popoverMenuIcon]}>
                        {!splitItem.isEditable ? null : (
                            <PressableWithFeedback
                                onPress={() => onSelectRow(item)}
                                accessibilityLabel={translate('common.edit')}
                                role="button"
                                style={styles.pointerEventsAuto}
                                sentryLabel="SplitListItem-EditButton"
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
        </BaseListItem>
    );
}

export default SplitListItem;
