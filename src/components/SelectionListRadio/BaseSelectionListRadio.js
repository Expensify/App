import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import SectionList from '../SectionList';
import Text from '../Text';
import styles from '../../styles/styles';
import TextInput from '../TextInput';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';
import CONST from '../../CONST';
import variables from '../../styles/variables';
import {propTypes as selectionListRadioPropTypes, defaultProps as selectionListRadioDefaultProps} from './selectionListRadioPropTypes';
import RadioListItem from './RadioListItem';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import SafeAreaConsumer from '../SafeAreaConsumer';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';

const propTypes = {
    ...keyboardStatePropTypes,
    ...selectionListRadioPropTypes,
};

function BaseSelectionListRadio(props) {
    const firstLayoutRef = useRef(true);
    const listRef = useRef(null);
    const textInputRef = useRef(null);
    const focusTimeoutRef = useRef(null);
    const shouldShowTextInput = Boolean(props.textInputLabel);

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

        _.each(props.sections, (section, sectionIndex) => {
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

    const flattenedSections = getFlattenedSections();

    const [focusedIndex, setFocusedIndex] = useState(() => {
        const defaultIndex = 0;

        const indexOfInitiallyFocusedOption = _.findIndex(flattenedSections.allOptions, (option) => option.keyForList === props.initiallyFocusedOptionKey);

        if (indexOfInitiallyFocusedOption >= 0) {
            return indexOfInitiallyFocusedOption;
        }

        return defaultIndex;
    });

    /**
     * Scrolls to the desired item index in the section list
     *
     * @param {Number} index - the index of the item to scroll to
     * @param {Boolean} animated - whether to animate the scroll
     */
    const scrollToIndex = (index, animated) => {
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
            if (_.isEmpty(lodashGet(props.sections, `[${i}].data`))) {
                adjustedSectionIndex--;
            }
        }

        listRef.current.scrollToLocation({sectionIndex: adjustedSectionIndex, itemIndex, animated});
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

        return {
            length: targetItem.length,
            offset: targetItem.offset,
            index: flatDataArrayIndex,
        };
    };

    const renderItem = ({item, index, section}) => {
        const isDisabled = section.isDisabled;
        const isFocused = !isDisabled && focusedIndex === index + lodashGet(section, 'indexOffset', 0);

        return (
            <RadioListItem
                item={item}
                isFocused={isFocused}
                isDisabled={isDisabled}
                onSelectRow={props.onSelectRow}
            />
        );
    };

    /** Focuses the text input when the component mounts. If `props.shouldDelayFocus` is true, we wait for the animation to finish */
    useEffect(() => {
        if (shouldShowTextInput) {
            if (props.shouldDelayFocus) {
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
    }, [props.shouldDelayFocus, shouldShowTextInput]);

    const selectFocusedOption = () => {
        const focusedOption = flattenedSections.allOptions[focusedIndex];

        if (!focusedOption) {
            return;
        }

        props.onSelectRow(focusedOption);
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        captureOnInputs: true,
        shouldBubble: () => !flattenedSections.allOptions[focusedIndex],
    });

    return (
        <ArrowKeyFocusManager
            disabledIndexes={flattenedSections.disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={flattenedSections.allOptions.length - 1}
            onFocusedIndexChanged={(newFocusedIndex) => {
                setFocusedIndex(newFocusedIndex);
                scrollToIndex(newFocusedIndex, true);
            }}
        >
            <SafeAreaConsumer>
                {({safeAreaPaddingBottomStyle}) => (
                    <View style={[styles.flex1, !props.isKeyboardShown && safeAreaPaddingBottomStyle]}>
                        {shouldShowTextInput && (
                            <View style={[styles.ph5, styles.pb3]}>
                                <TextInput
                                    ref={textInputRef}
                                    label={props.textInputLabel}
                                    accessibilityLabel={props.textInputLabel}
                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                    value={props.textInputValue}
                                    placeholder={props.textInputPlaceholder}
                                    maxLength={props.textInputMaxLength}
                                    onChangeText={props.onChangeText}
                                    keyboardType={props.keyboardType}
                                    selectTextOnFocus
                                    spellCheck={false}
                                    onSubmitEditing={selectFocusedOption}
                                />
                            </View>
                        )}
                        {Boolean(props.headerMessage) && (
                            <View style={[styles.ph5, styles.pb5]}>
                                <Text style={[styles.textLabel, styles.colorMuted]}>{props.headerMessage}</Text>
                            </View>
                        )}
                        <SectionList
                            ref={listRef}
                            sections={props.sections}
                            renderItem={renderItem}
                            getItemLayout={getItemLayout}
                            onScroll={props.onScroll}
                            onScrollBeginDrag={props.onScrollBeginDrag}
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
                            onLayout={() => {
                                if (!firstLayoutRef.current) {
                                    return;
                                }
                                scrollToIndex(focusedIndex, false);
                                firstLayoutRef.current = false;
                            }}
                        />
                    </View>
                )}
            </SafeAreaConsumer>
        </ArrowKeyFocusManager>
    );
}

BaseSelectionListRadio.displayName = 'BaseSelectionListRadio';
BaseSelectionListRadio.propTypes = propTypes;
BaseSelectionListRadio.defaultProps = selectionListRadioDefaultProps;

export default withKeyboardState(BaseSelectionListRadio);
