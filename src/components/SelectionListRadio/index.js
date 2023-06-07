import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component, useEffect, useMemo, useRef, useState} from 'react';
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
import {propTypes as optionsSelectorPropTypes, defaultProps as optionsSelectorDefaultProps} from './selectionListRadioPropTypes';
import setSelection from '../../libs/setSelection';
import compose from '../../libs/compose';

const propTypes = {
    /** Whether we should wait before focusing the TextInput, useful when using transitions on Android */
    shouldDelayFocus: PropTypes.bool,

    /** padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...optionsSelectorPropTypes,
    ...withLocalizePropTypes,
    ...withNavigationFocusPropTypes,
};

const SelectionListRadio = (props) => {
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

    // const disabledOptionsIndexes = useMemo(() => {
    //     const result = [];
    //
    //     let index = 0;
    //     _.each(props.sections, (section) => {
    //         _.each(section.data, (option) => {
    //             if (section.isDisabled || option.isDisabled) {
    //                 result.push(index);
    //             }
    //
    //             index += 1;
    //         });
    //     });
    //
    //     return result;
    // }, [props.sections]);

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

    // useEffect(() => {
    //     const newOptions = flattenSections();
    //     const newFocusedIndex = props.selectedOptions.length;
    //
    //     // TODO: Turn into a reducer
    //     setAllOptions(newOptions);
    //     setFocusedIndex(newFocusedIndex);
    //
    //     // TODO: If we just toggled an option on a multi-selection page or cleared the search input, scroll to top
    //     // TODO: Otherwise, scroll to the focused index (as long as it's in range)
    // }, [props.sections]);

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
    const optionsList = (
        <OptionsList
            ref={listRef}
            optionHoveredStyle={props.optionHoveredStyle}
            onSelectRow={selectRow}
            sections={props.sections}
            focusedIndex={focusedIndex}
            selectedOptions={props.selectedOptions}
            canSelectMultipleOptions={props.canSelectMultipleOptions}
            hideSectionHeaders={props.hideSectionHeaders}
            headerMessage={props.headerMessage}
            boldStyle={props.boldStyle}
            showTitleTooltip={props.showTitleTooltip}
            isDisabled={props.isDisabled}
            shouldHaveOptionSeparator={props.shouldHaveOptionSeparator}
            onLayout={() => {
                if (props.selectedOptions.length === 0) {
                    scrollToIndex(focusedIndex, false);
                }

                if (props.onLayout) {
                    props.onLayout();
                }
            }}
            contentContainerStyles={shouldShowFooter ? undefined : [props.safeAreaPaddingBottomStyle]}
            isLoading={!props.shouldShowOptions}
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
                        <View style={[styles.flexGrow0, styles.flexShrink1, styles.flexBasisAuto, styles.w100, styles.flexRow]}>{optionsList}</View>
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
                        {optionsList}
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

const defaultProps = {
    shouldDelayFocus: false,
    safeAreaPaddingBottomStyle: {},
    ...optionsSelectorDefaultProps,
};

SelectionListRadio.defaultProps = defaultProps;
SelectionListRadio.propTypes = propTypes;

export default compose(withLocalize, withNavigationFocus)(SelectionListRadio);
