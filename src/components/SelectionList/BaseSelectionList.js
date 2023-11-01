import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import SectionList from '../SectionList';
import Text from '../Text';
import styles from '../../styles/styles';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import variables from '../../styles/variables';
import {propTypes as selectionListPropTypes} from './selectionListPropTypes';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import SafeAreaConsumer from '../SafeAreaConsumer';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';
import Checkbox from '../Checkbox';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import FixedFooter from '../FixedFooter';
import Button from '../Button';
import useLocalize from '../../hooks/useLocalize';
import Log from '../../libs/Log';
import OptionsListSkeletonView from '../OptionsListSkeletonView';
import useActiveElement from '../../hooks/useActiveElement';
import BaseListItem from './BaseListItem';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';
import themeColors from '../../styles/themes/default';

const propTypes = {
    ...keyboardStatePropTypes,
    ...selectionListPropTypes,
};

function BaseSelectionList({
    sections,
    canSelectMultiple = false,
    onSelectRow,
    onSelectAll,
    onDismissError,
    textInputLabel = '',
    textInputPlaceholder = '',
    textInputValue = '',
    textInputMaxLength,
    keyboardType = CONST.KEYBOARD_TYPE.DEFAULT,
    onChangeText,
    initiallyFocusedOptionKey = '',
    onScroll,
    onScrollBeginDrag,
    headerMessage = '',
    confirmButtonText = '',
    onConfirm,
    headerContent,
    footerContent,
    showScrollIndicator = false,
    showLoadingPlaceholder = false,
    showConfirmButton = false,
    shouldPreventDefaultFocusOnSelectRow = false,
    isKeyboardShown = false,
    inputRef = null,
    disableKeyboardShortcuts = false,
    children,
}) {
    const {translate} = useLocalize();
    const firstLayoutRef = useRef(true);
    const listRef = useRef(null);
    const textInputRef = useRef(null);
    const focusTimeoutRef = useRef(null);
    const shouldShowTextInput = Boolean(textInputLabel);
    const shouldShowSelectAll = Boolean(onSelectAll);
    const activeElement = useActiveElement();
    const isFocused = useIsFocused();
    /**
     * Iterates through the sections and items inside each section, and builds 3 arrays along the way:
     * - `allOptions`: Contains all the items in the list, flattened, regardless of section
     * - `disabledOptionsIndexes`: Contains the indexes of all the disabled items in the list, to be used by the ArrowKeyFocusManager
     * - `itemLayouts`: Contains the layout information for each item, header and footer in the list,
     * so we can calculate the position of any given item when scrolling programmatically
     *
     * @return {{itemLayouts: [{offset: number, length: number}], disabledOptionsIndexes: *[], allOptions: *[]}}
     */
    const flattenedSections = useMemo(() => {
        const allOptions = [];

        const disabledOptionsIndexes = [];
        let disabledIndex = 0;

        let offset = 0;
        const itemLayouts = [{length: 0, offset}];

        const selectedOptions = [];

        _.each(sections, (section, sectionIndex) => {
            const sectionHeaderHeight = variables.optionsListSectionHeaderHeight;
            itemLayouts.push({length: sectionHeaderHeight, offset});
            offset += sectionHeaderHeight;

            _.each(section.data, (item, optionIndex) => {
                // Add item to the general flattened array
                allOptions.push({
                    ...item,
                    sectionIndex,
                    index: optionIndex,
                });

                // If disabled, add to the disabled indexes array
                if (section.isDisabled || item.isDisabled) {
                    disabledOptionsIndexes.push(disabledIndex);
                }
                disabledIndex += 1;

                // Account for the height of the item in getItemLayout
                const fullItemHeight = variables.optionRowHeight;
                itemLayouts.push({length: fullItemHeight, offset});
                offset += fullItemHeight;

                if (item.isSelected) {
                    selectedOptions.push(item);
                }
            });

            // We're not rendering any section footer, but we need to push to the array
            // because React Native accounts for it in getItemLayout
            itemLayouts.push({length: 0, offset});
        });

        // We're not rendering the list footer, but we need to push to the array
        // because React Native accounts for it in getItemLayout
        itemLayouts.push({length: 0, offset});

        if (selectedOptions.length > 1 && !canSelectMultiple) {
            Log.alert(
                'Dev error: SelectionList - multiple items are selected but prop `canSelectMultiple` is false. Please enable `canSelectMultiple` or make your list have only 1 item with `isSelected: true`.',
            );
        }

        return {
            allOptions,
            selectedOptions,
            disabledOptionsIndexes,
            itemLayouts,
            allSelected: selectedOptions.length > 0 && selectedOptions.length === allOptions.length - disabledOptionsIndexes.length,
        };
    }, [canSelectMultiple, sections]);

    // If `initiallyFocusedOptionKey` is not passed, we fall back to `-1`, to avoid showing the highlight on the first member
    const [focusedIndex, setFocusedIndex] = useState(() => _.findIndex(flattenedSections.allOptions, (option) => option.keyForList === initiallyFocusedOptionKey));

    // Disable `Enter` shortcut if the active element is a button or checkbox
    const disableEnterShortcut = activeElement && [CONST.ACCESSIBILITY_ROLE.BUTTON, CONST.ACCESSIBILITY_ROLE.CHECKBOX].includes(activeElement.role);

    /**
     * Scrolls to the desired item index in the section list
     *
     * @param {Number} index - the index of the item to scroll to
     * @param {Boolean} animated - whether to animate the scroll
     */
    const scrollToIndex = useCallback(
        (index, animated = true) => {
            const item = flattenedSections.allOptions[index];

            if (!listRef.current || !item) {
                return;
            }

            const itemIndex = item.index;
            const sectionIndex = item.sectionIndex;

            // Note: react-native's SectionList automatically strips out any empty sections.
            // So we need to reduce the sectionIndex to remove any empty sections in front of the one we're trying to scroll to.
            // Otherwise, it will cause an index-out-of-bounds error and crash the app.
            let adjustedSectionIndex = sectionIndex;
            for (let i = 0; i < sectionIndex; i++) {
                if (_.isEmpty(lodashGet(sections, `[${i}].data`))) {
                    adjustedSectionIndex--;
                }
            }

            listRef.current.scrollToLocation({sectionIndex: adjustedSectionIndex, itemIndex, animated, viewOffset: variables.contentHeaderHeight});
        },

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [flattenedSections.allOptions],
    );

    /**
     * Logic to run when a row is selected, either with click/press or keyboard hotkeys.
     *
     * @param {Object} item - the list item
     * @param {Boolean} shouldUnfocusRow - flag to decide if we should unfocus all rows. True when selecting a row with click or press (not keyboard)
     */
    const selectRow = (item, shouldUnfocusRow = false) => {
        // In single-selection lists we don't care about updating the focused index, because the list is closed after selecting an item
        if (canSelectMultiple) {
            if (sections.length > 1) {
                // If the list has only 1 section (e.g. Workspace Members list), we do nothing.
                // If the list has multiple sections (e.g. Workspace Invite list), and `shouldUnfocusRow` is false,
                // we focus the first one after all the selected (selected items are always at the top).
                const selectedOptionsCount = item.isSelected ? flattenedSections.selectedOptions.length - 1 : flattenedSections.selectedOptions.length + 1;

                if (!shouldUnfocusRow) {
                    setFocusedIndex(selectedOptionsCount);
                }

                if (!item.isSelected) {
                    // If we're selecting an item, scroll to it's position at the top, so we can see it
                    scrollToIndex(Math.max(selectedOptionsCount - 1, 0), true);
                }
            }

            if (shouldUnfocusRow) {
                // Unfocus all rows when selecting row with click/press
                setFocusedIndex(-1);
            }
        }

        onSelectRow(item);

        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && textInputRef.current) {
            textInputRef.current.focus();
        }
    };

    const selectAllRow = () => {
        onSelectAll();
        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow && textInputRef.current) {
            textInputRef.current.focus();
        }
    };

    const selectFocusedOption = () => {
        const focusedOption = flattenedSections.allOptions[focusedIndex];

        if (!focusedOption || focusedOption.isDisabled) {
            return;
        }

        selectRow(focusedOption);
    };

    /**
     * This function is used to compute the layout of any given item in our list.
     * We need to implement it so that we can programmatically scroll to items outside the virtual render window of the SectionList.
     *
     * @param {Array} data - This is the same as the data we pass into the component
     * @param {Number} flatDataArrayIndex - This index is provided by React Native, and refers to a flat array with data from all the sections. This flat array has some quirks:
     *
     *     1. It ALWAYS includes a list header and a list footer, even if we don't provide/render those.
     *     2. Each section includes a header, even if we don't provide/render one.
     *
     *     For example, given a list with two sections, two items in each section, no header, no footer, and no section headers, the flat array might look something like this:
     *
     *     [{header}, {sectionHeader}, {item}, {item}, {sectionHeader}, {item}, {item}, {footer}]
     *
     * @returns {Object}
     */
    const getItemLayout = (data, flatDataArrayIndex) => {
        const targetItem = flattenedSections.itemLayouts[flatDataArrayIndex];

        if (!targetItem) {
            return {
                length: 0,
                offset: 0,
                index: flatDataArrayIndex,
            };
        }

        return {
            length: targetItem.length,
            offset: targetItem.offset,
            index: flatDataArrayIndex,
        };
    };

    const renderSectionHeader = ({section}) => {
        if (!section.title || _.isEmpty(section.data)) {
            return null;
        }

        return (
            // Note: The `optionsListSectionHeader` style provides an explicit height to section headers.
            // We do this so that we can reference the height in `getItemLayout` –
            // we need to know the heights of all list items up-front in order to synchronously compute the layout of any given list item.
            // So be aware that if you adjust the content of the section header (for example, change the font size), you may need to adjust this explicit height as well.
            <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                <Text style={[styles.ph5, styles.textLabelSupporting]}>{section.title}</Text>
            </View>
        );
    };

    const renderItem = ({item, index, section}) => {
        const normalizedIndex = index + lodashGet(section, 'indexOffset', 0);
        const isDisabled = section.isDisabled || item.isDisabled;
        const isItemFocused = !isDisabled && focusedIndex === normalizedIndex;
        // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
        const showTooltip = normalizedIndex < 10;

        return (
            <BaseListItem
                item={item}
                isFocused={isItemFocused}
                isDisabled={isDisabled}
                showTooltip={showTooltip}
                canSelectMultiple={canSelectMultiple}
                onSelectRow={() => selectRow(item, true)}
                onDismissError={onDismissError}
                shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
            />
        );
    };

    const scrollToFocusedIndexOnFirstRender = useCallback(() => {
        if (!firstLayoutRef.current) {
            return;
        }
        scrollToIndex(focusedIndex, false);
        firstLayoutRef.current = false;
    }, [focusedIndex, scrollToIndex]);

    const updateAndScrollToFocusedIndex = useCallback(
        (newFocusedIndex) => {
            setFocusedIndex(newFocusedIndex);
            scrollToIndex(newFocusedIndex, true);
        },
        [scrollToIndex],
    );

    /** Focuses the text input when the component comes into focus and after any navigation animations finish. */
    useFocusEffect(
        useCallback(() => {
            if (shouldShowTextInput) {
                focusTimeoutRef.current = setTimeout(() => textInputRef.current.focus(), CONST.ANIMATED_TRANSITION);
            }
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, [shouldShowTextInput]),
    );

    /** Selects row when pressing Enter */
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: () => !flattenedSections.allOptions[focusedIndex],
        isActive: !disableKeyboardShortcuts && !disableEnterShortcut && isFocused,
    });

    /** Calls confirm action when pressing CTRL (CMD) + Enter */
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER, onConfirm, {
        captureOnInputs: true,
        shouldBubble: () => !flattenedSections.allOptions[focusedIndex],
        isActive: !disableKeyboardShortcuts && Boolean(onConfirm) && isFocused,
    });

    return (
        <ArrowKeyFocusManager
            disabledIndexes={flattenedSections.disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={flattenedSections.allOptions.length - 1}
            onFocusedIndexChanged={updateAndScrollToFocusedIndex}
        >
            <SafeAreaConsumer>
                {({safeAreaPaddingBottomStyle}) => (
                    <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle]}>
                        {shouldShowTextInput && (
                            <View style={[styles.ph5, styles.pb3]}>
                                <TextInput
                                    ref={(el) => {
                                        if (inputRef) {
                                            // eslint-disable-next-line no-param-reassign
                                            inputRef.current = el;
                                        }
                                        textInputRef.current = el;
                                    }}
                                    label={textInputLabel}
                                    accessibilityLabel={textInputLabel}
                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                    value={textInputValue}
                                    placeholder={textInputPlaceholder}
                                    maxLength={textInputMaxLength}
                                    onChangeText={onChangeText}
                                    keyboardType={keyboardType}
                                    selectTextOnFocus
                                    spellCheck={false}
                                    onSubmitEditing={selectFocusedOption}
                                    blurOnSubmit={Boolean(flattenedSections.allOptions.length)}
                                />
                            </View>
                        )}
                        {Boolean(headerMessage) && (
                            <View style={[styles.ph5, styles.pb5]}>
                                <Text style={[styles.textLabel, styles.colorMuted]}>{headerMessage}</Text>
                            </View>
                        )}
                        {Boolean(headerContent) && headerContent}
                        {flattenedSections.allOptions.length === 0 && showLoadingPlaceholder ? (
                            <OptionsListSkeletonView shouldAnimate />
                        ) : (
                            <>
                                {!headerMessage && canSelectMultiple && shouldShowSelectAll && (
                                    <PressableWithFeedback
                                        style={[styles.peopleRow, styles.userSelectNone, styles.ph5, styles.pb3]}
                                        onPress={selectAllRow}
                                        accessibilityLabel={translate('workspace.people.selectAll')}
                                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                        accessibilityState={{checked: flattenedSections.allSelected}}
                                        disabled={flattenedSections.allOptions.length === flattenedSections.disabledOptionsIndexes.length}
                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                        onMouseDown={shouldPreventDefaultFocusOnSelectRow ? (e) => e.preventDefault() : undefined}
                                    >
                                        <Checkbox
                                            accessibilityLabel={translate('workspace.people.selectAll')}
                                            isChecked={flattenedSections.allSelected}
                                            onPress={selectAllRow}
                                            disabled={flattenedSections.allOptions.length === flattenedSections.disabledOptionsIndexes.length}
                                        />
                                        <View style={[styles.flex1]}>
                                            <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                                        </View>
                                    </PressableWithFeedback>
                                )}
                                <SectionList
                                    ref={listRef}
                                    sections={sections}
                                    stickySectionHeadersEnabled={false}
                                    renderSectionHeader={renderSectionHeader}
                                    renderItem={renderItem}
                                    getItemLayout={getItemLayout}
                                    onScroll={onScroll}
                                    onScrollBeginDrag={onScrollBeginDrag}
                                    keyExtractor={(item) => item.keyForList}
                                    extraData={focusedIndex}
                                    indicatorStyle={themeColors.white}
                                    keyboardShouldPersistTaps="always"
                                    showsVerticalScrollIndicator={showScrollIndicator}
                                    initialNumToRender={12}
                                    maxToRenderPerBatch={5}
                                    windowSize={5}
                                    viewabilityConfig={{viewAreaCoveragePercentThreshold: 95}}
                                    testID="selection-list"
                                    style={[styles.flexGrow0]}
                                    onLayout={scrollToFocusedIndexOnFirstRender}
                                />
                                {children}
                            </>
                        )}
                        {showConfirmButton && (
                            <FixedFooter style={[styles.mtAuto]}>
                                <Button
                                    success
                                    style={[styles.w100]}
                                    text={confirmButtonText || translate('common.confirm')}
                                    onPress={onConfirm}
                                    pressOnEnter
                                    enterKeyEventListenerPriority={1}
                                />
                            </FixedFooter>
                        )}
                        {Boolean(footerContent) && <FixedFooter style={[styles.mtAuto]}>{footerContent}</FixedFooter>}
                    </View>
                )}
            </SafeAreaConsumer>
        </ArrowKeyFocusManager>
    );
}

BaseSelectionList.displayName = 'BaseSelectionList';
BaseSelectionList.propTypes = propTypes;

export default withKeyboardState(BaseSelectionList);
