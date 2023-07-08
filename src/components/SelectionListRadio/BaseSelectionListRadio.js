import React, {useEffect, useRef, useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import SectionList from '../SectionList';
import Text from '../Text';
import styles from '../../styles/styles';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import variables from '../../styles/variables';
import {propTypes as selectionListRadioPropTypes} from './selectionListRadioPropTypes';
import RadioListItem from './RadioListItem';
import useArrowKeyFocusManager from '../../hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import useKeyboardState from '../../hooks/useKeyboardState';
import SafeAreaConsumer from '../SafeAreaConsumer';

const propTypes = selectionListRadioPropTypes;

function BaseSelectionListRadio({
    onSelectRow,
    sections,
    initiallyFocusedOptionKey = '',
    headerMessage = '',
    keyboardType = CONST.KEYBOARD_TYPE.DEFAULT,
    onChangeText = () => {},
    onScroll = () => {},
    onScrollBeginDrag = () => {},
    shouldDelayFocus = false,
    textInputLabel = '',
    textInputPlaceholder = '',
    textInputValue = '',
    textInputMaxLength = undefined,
}) {
    const listRef = useRef(null);
    const textInputRef = useRef(null);
    const focusTimeoutRef = useRef(null);
    const shouldShowTextInput = Boolean(textInputLabel);

    const {isKeyboardShown} = useKeyboardState();

    /**
     * Iterates through the sections and items inside each section, and builds 3 arrays along the way:
     * - `allOptions`: Contains all the items in the list, flattened, regardless of section
     * - `disabledOptionsIndexes`: Contains the indexes of all the disabled items in the list, to be used by the ArrowKeyFocusManager
     * - `itemLayouts`: Contains the layout information for each item, header and footer in the list,
     * so we can calculate the position of any given item when scrolling programmatically
     *
     * @return {{itemLayouts: [{offset: number, length: number}], disabledOptionsIndexes: *[], allOptions: *[]}}
     */
    const getFlattenedSections = () => {
        const allOptions = [];

        const disabledOptionsIndexes = [];
        let disabledIndex = 0;

        let offset = 0;
        const itemLayouts = [{length: 0, offset}];

        _.each(sections, (section, sectionIndex) => {
            // We're not rendering any section header, but we need to push to the array
            // because React Native accounts for it in getItemLayout
            const sectionHeaderHeight = 0;
            itemLayouts.push({length: sectionHeaderHeight, offset});
            offset += sectionHeaderHeight;

            _.each(section.data, (option, optionIndex) => {
                // Add item to the general flattened array
                allOptions.push({
                    ...option,
                    sectionIndex,
                    index: optionIndex,
                });

                // If disabled, add to the disabled indexes array
                if (section.isDisabled || option.isDisabled) {
                    disabledOptionsIndexes.push(disabledIndex);
                }
                disabledIndex += 1;

                // Account for the height of the item in getItemLayout
                const fullItemHeight = variables.optionRowHeight;
                itemLayouts.push({length: fullItemHeight, offset});
                offset += fullItemHeight;
            });

            // We're not rendering any section footer, but we need to push to the array
            // because React Native accounts for it in getItemLayout
            itemLayouts.push({length: 0, offset});
        });

        // We're not rendering the list footer, but we need to push to the array
        // because React Native accounts for it in getItemLayout
        itemLayouts.push({length: 0, offset});

        return {
            allOptions,
            disabledOptionsIndexes,
            itemLayouts,
        };
    };

    const {allOptions, disabledOptionsIndexes, itemLayouts} = getFlattenedSections();

    /**
     * Scrolls to the desired item index in the section list
     *
     * @param {Number} index - the index of the item to scroll to
     * @param {Boolean} animated - whether to animate the scroll
     */
    const scrollToIndex = (index, animated) => {
        const item = allOptions[index];

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

        listRef.current.scrollToLocation({sectionIndex: adjustedSectionIndex, itemIndex, animated});
    };

    // Calculate the initial focused index only on first render
    const initialFocusedIndex = useMemo(() => {
        const initialIndex = _.findIndex(allOptions, (option) => option.keyForList === initiallyFocusedOptionKey);
        if (initialIndex <= 0) {
            return 0;
        }
        return initialIndex;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [focusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex,
        maxIndex: allOptions.length - 1,
        disabledIndexes: disabledOptionsIndexes,
        onFocusedIndexChanged: (newFocusedIndex) => scrollToIndex(newFocusedIndex, true),
    });

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
        const targetItem = itemLayouts[flatDataArrayIndex];

        return {
            length: targetItem.length,
            offset: targetItem.offset,
            index: flatDataArrayIndex,
        };
    };

    const renderItem = ({item, index, section}) => {
        const isFocused = focusedIndex === index + lodashGet(section, 'indexOffset', 0);

        return (
            <RadioListItem
                item={item}
                isFocused={isFocused}
                onSelectRow={onSelectRow}
            />
        );
    };

    /** Focuses the text input when the component mounts. If `shouldDelayFocus` is true, we wait for the animation to finish */
    useEffect(() => {
        if (shouldShowTextInput) {
            if (shouldDelayFocus) {
                focusTimeoutRef.current = setTimeout(() => textInputRef.current.focus(), CONST.ANIMATED_TRANSITION);
            } else {
                textInputRef.current.focus();
            }
        }

        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, [shouldDelayFocus, shouldShowTextInput]);

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            const focusedOption = allOptions[focusedIndex];

            if (!focusedOption) {
                return;
            }

            onSelectRow(focusedOption);
        },
        {
            captureOnInputs: true,
            shouldBubble: () => !allOptions[focusedIndex],
        },
    );

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle]}>
                    {shouldShowTextInput && (
                        <View style={[styles.ph5, styles.pv5]}>
                            <TextInput
                                ref={textInputRef}
                                label={textInputLabel}
                                value={textInputValue}
                                placeholder={textInputPlaceholder}
                                maxLength={textInputMaxLength}
                                onChangeText={onChangeText}
                                keyboardType={keyboardType}
                                selectTextOnFocus
                            />
                        </View>
                    )}
                    {Boolean(headerMessage) && (
                        <View style={[styles.ph5, styles.pb5]}>
                            <Text style={[styles.textLabel, styles.colorMuted]}>{headerMessage}</Text>
                        </View>
                    )}
                    <SectionList
                        ref={listRef}
                        sections={sections}
                        renderItem={renderItem}
                        getItemLayout={getItemLayout}
                        onScroll={onScroll}
                        onScrollBeginDrag={onScrollBeginDrag}
                        keyExtractor={(item) => item.keyForList}
                        extraData={focusedIndex}
                        indicatorStyle="white"
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={false}
                        OP
                        initialNumToRender={12}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        viewabilityConfig={{viewAreaCoveragePercentThreshold: 95}}
                        onLayout={() => scrollToIndex(focusedIndex, false)}
                    />
                </View>
            )}
        </SafeAreaConsumer>
    );
}

BaseSelectionListRadio.displayName = 'BaseSelectionListRadio';
BaseSelectionListRadio.propTypes = propTypes;

export default BaseSelectionListRadio;
