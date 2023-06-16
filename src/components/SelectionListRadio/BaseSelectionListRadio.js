import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import SectionList from '../SectionList';
import Text from '../Text';
import styles from '../../styles/styles';
import Icon from '../Icon';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import TextInput from '../TextInput';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';
import CONST from '../../CONST';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import variables from '../../styles/variables';

const propTypes = {
    /** Sections for the section list */
    sections: PropTypes.arrayOf(PropTypes.shape({})).isRequired,

    /** Callback to fire when a row is tapped */
    onSelectRow: PropTypes.func,

    textInputLabel: PropTypes.string,
    textInputPlaceholder: PropTypes.string,
    textInputValue: PropTypes.string,
    onChangeText: PropTypes.func,
    initiallyFocusedOptionKey: PropTypes.string,
    hideSectionHeaders: PropTypes.bool,
    shouldDelayFocus: PropTypes.bool,
    onScroll: PropTypes.func,
    onScrollBeginDrag: PropTypes.func,
};

const defaultProps = {
    onSelectRow: () => {},
    textInputLabel: '',
    textInputPlaceholder: '',
    textInputValue: '',
    onChangeText: () => {},
    initiallyFocusedOptionKey: '',
    hideSectionHeaders: true,
    shouldDelayFocus: false,
    onScroll: () => {},
    onScrollBeginDrag: () => {},
};

const SelectionListRadio = (props) => {
    const listRef = useRef(null);
    const pressableRef = useRef(null);
    const textInputRef = useRef(null);
    const shouldShowTextInput = Boolean(props.textInputLabel);

    const flattenedSections = useMemo(() => {
        const allOptions = [];

        const disabledOptionsIndexes = [];
        let disabledIndex = 0;

        let offset = 0;
        const itemLayouts = [{length: 0, offset}];

        _.each(props.sections, (section, sectionIndex) => {
            // Add the section header dimensions to the itemLayouts array
            const sectionHeaderHeight = section.title && !props.hideSectionHeaders ? variables.optionsListSectionHeaderHeight : 0;
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

                // Add the item dimensions to the itemLayouts array
                const fullItemHeight = variables.optionRowHeight + variables.borderTopWidth;
                itemLayouts.push({length: fullItemHeight, offset});
                offset += fullItemHeight;
            });

            // Add the section footer dimensions to the itemLayouts array
            itemLayouts.push({length: 0, offset});
        });

        // Add the list footer dimensions to the itemLayouts array
        itemLayouts.push({length: 0, offset});

        return {
            allOptions,
            disabledOptionsIndexes,
            itemLayouts,
        };
    }, [props.hideSectionHeaders, props.sections]);

    const [focusedIndex, setFocusedIndex] = React.useState(() => {
        const defaultIndex = 0;

        const indexOfInitiallyFocusedOption = _.findIndex(flattenedSections.allOptions, (option) => option.keyForList === props.initiallyFocusedOptionKey);

        if (indexOfInitiallyFocusedOption >= 0) {
            return indexOfInitiallyFocusedOption;
        }

        return defaultIndex;
    });

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} index
     * @param {Boolean} animated
     */
    const scrollToIndex = useCallback(
        (index) => {
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

            listRef.current.scrollToLocation({sectionIndex: adjustedSectionIndex, itemIndex, viewPosition: 0.5, animated: true});
        },
        [flattenedSections.allOptions, props.sections],
    );

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
            // length: 0,
            offset: targetItem.offset,
            // offset: 0,
            index: flatDataArrayIndex,
        };
    };

    const renderItem = ({item, index, section}) => {
        const isSelected = Boolean(item.customIcon);
        const isFocused = focusedIndex === index + section.indexOffset;

        return (
            <PressableWithFeedback
                ref={pressableRef}
                onPress={() => props.onSelectRow(item)}
                accessibilityLabel={item.text}
                accessibilityRole="button"
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                focusStyle={styles.hoveredComponentBG}
            >
                <View style={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.optionRow, styles.borderTop, isFocused && styles.sidebarLinkActive]}>
                    <Text style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, item.boldStyle && styles.sidebarLinkTextBold]}>
                        {item.text}
                    </Text>

                    {isSelected && (
                        <View
                            style={[styles.flexRow, styles.alignItemsCenter]}
                            accessible={false}
                        >
                            <View>
                                <Icon
                                    src={lodashGet(item, 'customIcon.src', '')}
                                    fill={lodashGet(item, 'customIcon.color')}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </PressableWithFeedback>
        );
    };

    useEffect(() => {
        let focusTimeout;

        if (shouldShowTextInput) {
            if (props.shouldDelayFocus) {
                focusTimeout = setTimeout(() => textInputRef.current.focus(), CONST.ANIMATED_TRANSITION);
            } else {
                textInputRef.current.focus();
            }
        }

        return () => {
            if (!focusTimeout) {
                return;
            }
            clearTimeout(focusTimeout);
        };
    }, [props.shouldDelayFocus, shouldShowTextInput]);

    useEffect(() => {
        scrollToIndex(focusedIndex);
    }, [focusedIndex, scrollToIndex]);

    useEffect(() => {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        const unsubscribeEnter = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            () => {
                const focusedOption = flattenedSections.allOptions[focusedIndex];

                if (!focusedOption) {
                    return;
                }

                props.onSelectRow(focusedOption);
            },
            enterConfig.descriptionKey,
            enterConfig.modifiers,
            true,
            () => !flattenedSections.allOptions[focusedIndex],
        );

        const CTRLEnterConfig = CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER;
        const unsubscribeCTRLEnter = KeyboardShortcut.subscribe(
            CTRLEnterConfig.shortcutKey,
            () => {
                const focusedOption = flattenedSections.allOptions[focusedIndex];

                if (!focusedOption) {
                    return;
                }

                props.onSelectRow(focusedOption);
            },
            CTRLEnterConfig.descriptionKey,
            CTRLEnterConfig.modifiers,
            true,
        );

        return () => {
            if (unsubscribeEnter) {
                unsubscribeEnter();
            }

            if (unsubscribeCTRLEnter) {
                unsubscribeCTRLEnter();
            }
        };
    }, [flattenedSections.allOptions, focusedIndex, props]);

    return (
        <ArrowKeyFocusManager
            disabledIndexes={flattenedSections.disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={flattenedSections.allOptions.length - 1}
            onFocusedIndexChanged={setFocusedIndex}
        >
            <View style={[styles.flex1]}>
                {shouldShowTextInput && (
                    <View style={[styles.ph5, styles.pv5]}>
                        <TextInput
                            ref={textInputRef}
                            value={props.textInputValue}
                            label={props.textInputLabel}
                            onChangeText={props.onChangeText}
                            placeholder={props.textInputPlaceholder}
                            selectTextOnFocus
                        />
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
                    initialNumToRender={12}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    viewabilityConfig={{viewAreaCoveragePercentThreshold: 95}}
                />
            </View>
        </ArrowKeyFocusManager>
    );
};

SelectionListRadio.displayName = 'SelectionListRadio';
SelectionListRadio.propTypes = propTypes;
SelectionListRadio.defaultProps = defaultProps;

export default SelectionListRadio;
