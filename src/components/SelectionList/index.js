import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Button from '../Button';
import FixedFooter from '../FixedFooter';
import OptionsList from '../OptionsList';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withNavigationFocus, {withNavigationFocusPropTypes} from '../withNavigationFocus';
import TextInput from '../TextInput';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import {propTypes as optionsSelectorPropTypes, defaultProps as optionsSelectorDefaultProps} from './selectionListPropTypes';
import setSelection from '../../libs/setSelection';
import compose from '../../libs/compose';
import SelectionListItemDefault from './SelectionListItemDefault';
import SelectionListItemSingle from './SelectionListItemSingle';
import SelectionListItemMultiple from './SelectionListItemMultiple';
import SectionList from '../SectionList';
import variables from '../../styles/variables';

const propTypes = {
    /** Whether we should wait before focusing the TextInput, useful when using transitions on Android */
    shouldDelayFocus: PropTypes.bool,

    /** padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    // TODO: TYPES - REVIEW
    canSelectSingle: PropTypes.bool,
    canSelectMultiple: PropTypes.bool,

    ...optionsSelectorPropTypes,
    ...withLocalizePropTypes,
    ...withNavigationFocusPropTypes,
};

const defaultProps = {
    shouldDelayFocus: false,
    safeAreaPaddingBottomStyle: {},
    ...optionsSelectorDefaultProps,
};

const SelectionList = (props) => {
    const [shouldDisableRowSelection, setShouldDisableRowSelection] = useState(false);
    const shouldShowFooter = !props.isReadOnly && (props.shouldShowConfirmButton || props.footerContent) && !(props.canSelectMultipleOptions && _.isEmpty(props.selectedOptions));
    const defaultConfirmButtonText = _.isUndefined(props.confirmButtonText) ? props.translate('common.confirm') : props.confirmButtonText;
    const shouldShowDefaultConfirmButton = !props.footerContent && defaultConfirmButtonText;
    const listRef = useRef(null);
    const textInputRef = useRef(null);

    /**
     * Flattens the sections into a single array of options.
     * Each object in this array is enhanced to have:
     *
     *   1. A `sectionIndex`, which represents the index of the section it came from
     *   2. An `index`, which represents the index of the option within the section it came from.
     *
     * @returns {Array<Object>}
     */
    const flattenedSections = useMemo(() => {
        const allOptions = [];
        const disabledOptionsIndexes = [];
        let index = 0;

        _.each(props.sections, (section, sectionIndex) => {
            _.each(section.data, (option, optionIndex) => {
                allOptions.push({
                    ...option,
                    sectionIndex,
                    index: optionIndex,
                });

                if (section.isDisabled || option.isDisabled) {
                    disabledOptionsIndexes.push(index);
                }

                index += 1;
            });
        });

        return {
            allOptions,
            disabledOptionsIndexes,
        };
    }, [props.sections]);
    const getInitiallyFocusedIndex = (allOptions) => {
        if (props.selectedOptions.length > 0) {
            return props.selectedOptions.length;
        }

        const defaultIndex = props.shouldTextInputAppearBelowOptions ? allOptions.length : 0;
        if (_.isUndefined(props.initiallyFocusedOptionKey)) {
            return defaultIndex;
        }

        const indexOfInitiallyFocusedOption = _.findIndex(allOptions, (option) => option.keyForList === props.initiallyFocusedOptionKey);

        if (indexOfInitiallyFocusedOption >= 0) {
            return indexOfInitiallyFocusedOption;
        }

        return defaultIndex;
    };

    const [focusedIndex, setFocusedIndex] = useState(() => getInitiallyFocusedIndex(flattenedSections.allOptions));

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} index
     * @param {Boolean} animated
     */
    const scrollToIndex = (index, animated = true) => {
        const option = flattenedSections.allOptions[index];

        if (!listRef.current || !option) {
            return;
        }

        const itemIndex = option.index;
        const sectionIndex = option.sectionIndex;

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
     * Completes the follow-up actions after a row is selected
     *
     * @param {Object} option
     * @param {Object} ref
     * @returns {Promise}
     */
    const selectRow = (option, ref) => {
        return new Promise((resolve) => {
            if (props.shouldShowTextInput && props.shouldFocusOnSelectRow) {
                // if (this.relatedTarget && ref === this.relatedTarget) {
                //     this.textInput.focus();
                //     this.relatedTarget = null;
                // }

                if (textInputRef.current.isFocused()) {
                    setSelection(textInputRef.current, 0, props.value.length);
                }
            }

            const selectedOption = props.onSelectRow(option);
            resolve(selectedOption);

            if (!props.canSelectMultipleOptions) {
                return;
            }

            // Focus the first unselected item from the list (i.e: the best result according to the current search term)
            setFocusedIndex(props.selectedOptions.length);
        });
    };

    const renderItem = ({item, index, section}) => {
        let Item = SelectionListItemDefault;

        if (props.canSelectSingle) {
            Item = SelectionListItemSingle;
        }

        if (props.canSelectMultiple) {
            Item = SelectionListItemMultiple;
        }

        const isDisabled = props.isDisabled || section.isDisabled;
        const isSelected = Boolean(item.customIcon); // TODO: Adjust how this is coming from TimezoneSelectPage

        return (
            <Item
                item={item}
                isDisabled={isDisabled}
                isSelected={isSelected}
                onPress={selectRow}
            />
        );
    };

    /**
     * This helper function is used to memoize the computation needed for getItemLayout. It is run whenever section data changes.
     *
     * @returns {Array<Object>}
     */
    const buildFlatSectionArray = () => {
        let offset = 0;

        // Start with just an empty list header
        const flatArray = [{length: 0, offset}];

        // Build the flat array
        for (let sectionIndex = 0; sectionIndex < props.sections.length; sectionIndex++) {
            const section = props.sections[sectionIndex];

            // Add the section header
            const sectionHeaderHeight = section.title && !props.hideSectionHeaders ? variables.optionsListSectionHeaderHeight : 0;
            flatArray.push({length: sectionHeaderHeight, offset});
            offset += sectionHeaderHeight;

            // Add section items
            for (let i = 0; i < section.data.length; i++) {
                let fullOptionHeight = variables.optionRowHeight;
                if (i > 0 && props.shouldHaveOptionSeparator) {
                    fullOptionHeight += variables.borderTopWidth;
                }
                flatArray.push({length: fullOptionHeight, offset});
                offset += fullOptionHeight;
            }

            // Add the section footer
            flatArray.push({length: 0, offset});
        }

        // Then add the list footer
        flatArray.push({length: 0, offset});
        return flatArray;
    };

    const flattenedData = buildFlatSectionArray();

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
        // if (!_.has(this.flattenedData, flatDataArrayIndex)) {
        //     this.flattenedData = this.buildFlatSectionArray();
        // }

        const targetItem = flattenedData[flatDataArrayIndex];

        return {
            length: targetItem.length,
            offset: targetItem.offset,
            index: flatDataArrayIndex,
        };
    };

    useEffect(() => {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        const unsubscribeEnter = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            () => {
                const focusedOption = flattenedSections.allOptions[focusedIndex];

                if (!focusedOption || !props.isFocused) {
                    return;
                }

                if (props.canSelectMultipleOptions) {
                    selectRow(focusedOption);
                } else if (!shouldDisableRowSelection) {
                    setShouldDisableRowSelection(true);

                    let result = selectRow(focusedOption);
                    if (!(result instanceof Promise)) {
                        result = Promise.resolve();
                    }
                    setTimeout(() => result.finally(() => setShouldDisableRowSelection(false)), 500);
                }
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
                if (props.canSelectMultipleOptions) {
                    props.onConfirmSelection();
                    return;
                }

                const focusedOption = flattenedSections.allOptions[focusedIndex];
                if (!focusedOption) {
                    return;
                }

                selectRow(focusedOption);
            },
            CTRLEnterConfig.descriptionKey,
            CTRLEnterConfig.modifiers,
            true,
        );

        scrollToIndex(props.selectedOptions.length ? 0 : focusedIndex, false);

        if (!props.autoFocus) {
            return;
        }

        let focusTimeout;
        if (props.shouldShowTextInput) {
            if (props.shouldDelayFocus) {
                focusTimeout = setTimeout(() => textInputRef.current.focus(), CONST.ANIMATED_TRANSITION);
            } else {
                textInputRef.current.focus();
            }
        }

        return () => {
            if (focusTimeout) {
                clearTimeout(focusTimeout);
            }

            if (unsubscribeEnter) {
                unsubscribeEnter();
            }

            if (unsubscribeCTRLEnter) {
                unsubscribeCTRLEnter();
            }
        };
    }, []);

    useEffect(() => {
        scrollToIndex(focusedIndex);
    }, [focusedIndex]);

    const textInput = (
        <TextInput
            ref={textInputRef}
            value={props.value}
            label={props.textInputLabel}
            onChangeText={props.onChangeText}
            placeholder={props.placeholderText}
            maxLength={props.maxLength}
            keyboardType={props.keyboardType}
            // onBlur={(e) => {
            //     if (!props.shouldFocusOnSelectRow) {
            //         return;
            //     }
            //     this.relatedTarget = e.relatedTarget;
            // }}
            selectTextOnFocus
            blurOnSubmit={Boolean(flattenedSections.allOptions.length)}
        />
    );

    const list = (
        <SectionList
            ref={listRef}
            indicatorStyle="white"
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            initialNumToRender={12}
            maxToRenderPerBatch={5}
            windowSize={5}
            viewabilityConfig={{viewAreaCoveragePercentThreshold: 95}}
            sections={props.sections}
            keyExtractor={(item) => item.keyForList}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            extraData={props.focusedIndex}
            contentContainerStyle={shouldShowFooter ? undefined : [props.safeAreaPaddingBottomStyle]}
        />
    );

    return (
        <ArrowKeyFocusManager
            disabledIndexes={flattenedSections.disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={flattenedSections.allOptions.length - 1}
            onFocusedIndexChanged={props.disableArrowKeysActions ? () => {} : setFocusedIndex}
        >
            <View style={[styles.flex1]}>
                {props.shouldTextInputAppearBelowOptions ? (
                    <>
                        <View style={[styles.flexGrow0, styles.flexShrink1, styles.flexBasisAuto, styles.w100, styles.flexRow]}>{list}</View>
                        <View style={props.shouldUseStyleForChildren ? [styles.ph5, styles.pv5, styles.flexGrow1, styles.flexShrink0] : []}>
                            {props.children}
                            {props.shouldShowTextInput && textInput}
                        </View>
                    </>
                ) : (
                    <>
                        <View style={props.shouldUseStyleForChildren ? [styles.ph5, styles.pb3] : []}>
                            {props.children}
                            {props.shouldShowTextInput && textInput}
                        </View>
                        {list}
                    </>
                )}
            </View>
            {shouldShowFooter && (
                <FixedFooter>
                    {shouldShowDefaultConfirmButton && (
                        <Button
                            success
                            style={[styles.w100]}
                            text={defaultConfirmButtonText}
                            onPress={props.onConfirmSelection}
                            pressOnEnter
                            enterKeyEventListenerPriority={1}
                        />
                    )}
                    {props.footerContent}
                </FixedFooter>
            )}
        </ArrowKeyFocusManager>
    );
};

SelectionList.displayName = 'SelectionList';
SelectionList.defaultProps = defaultProps;
SelectionList.propTypes = propTypes;

export default compose(withLocalize, withNavigationFocus)(SelectionList);
