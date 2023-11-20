import {useIsFocused} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import ArrowKeyFocusManager from '@components/ArrowKeyFocusManager';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import OptionsList from '@components/OptionsList';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import getPlatform from '@libs/getPlatform';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import setSelection from '@libs/setSelection';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import {defaultProps as optionsSelectorDefaultProps, propTypes as optionsSelectorPropTypes} from './optionsSelectorPropTypes';

const propTypes = {
    /** padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Content container styles for OptionsList */
    contentContainerStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** List container styles for OptionsList */
    listContainerStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** List styles for OptionsList */
    listStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...optionsSelectorPropTypes,
};

const defaultProps = {
    shouldDelayFocus: false,
    safeAreaPaddingBottomStyle: {},
    contentContainerStyles: [],
    listContainerStyles: [styles.flex1],
    listStyles: [],
    ...optionsSelectorDefaultProps,
};

const BaseOptionsSelector = ({
    onSelectRow,
    sections,
    value,
    onChangeText,
    maxLength,
    textInputLabel,
    keyboardType,
    placeholderText,
    selectedOptions,
    headerMessage,
    canSelectMultipleOptions,
    shouldShowMultipleOptionSelectorAsButton,
    multipleOptionSelectorButtonText,
    onAddToSelection,
    highlightSelectedOptions,
    hideSectionHeaders,
    disableArrowKeysActions,
    isDisabled,
    boldStyle,
    showTitleTooltip,
    shouldPreventDefaultFocusOnSelectRow,
    autoFocus,
    shouldShowConfirmButton,
    confirmButtonText,
    onConfirmSelection,
    shouldTextInputAppearBelowOptions,
    shouldShowTextInput,
    footerContent,
    optionHoveredStyle,
    sectionHeaderStyle,
    shouldShowOptions,
    shouldHaveOptionSeparator,
    initiallyFocusedOptionKey,
    shouldUseStyleForChildren,
    isRowMultilineSupported,
    initialFocusedIndex,
    shouldTextInputInterceptSwipe,
    shouldAllowScrollingChildren,
    nestedScrollEnabled,
}) => {
    const isFocused = useIsFocused();
    const {translate} = useLocalize();

    /**
     * Flattens the sections into a single array of options.
     * Each object in this array is enhanced to have:
     *
     *   1. A `sectionIndex`, which represents the index of the section it came from
     *   2. An `index`, which represents the index of the option within the section it came from.
     *
     * @returns {Array<Object>}
     */
    const flattenSections = () => {
        const allOptions = [];
        const calcDisabledOptionsIndexes = [];
        let index = 0;
        _.each(sections, (section, sectionIndex) => {
            _.each(section.data, (option, optionIndex) => {
                allOptions.push({
                    ...option,
                    sectionIndex,
                    index: optionIndex,
                });
                if (section.isDisabled || option.isDisabled) {
                    calcDisabledOptionsIndexes.push(index);
                }
                index += 1;
            });
        });

        setDisabledOptionsIndexes(calcDisabledOptionsIndexes);
        return allOptions;
    };

    /**
     * @param {Array<Object>} allOptions
     * @returns {Number}
     */
    const getInitiallyFocusedIndex = (allOptions) => {
        if (_.isNumber(initialFocusedIndex)) {
            return initialFocusedIndex;
        }

        if (selectedOptions.length > 0) {
            return selectedOptions.length;
        }
        const defaultIndex = shouldTextInputAppearBelowOptions ? allOptions.length : 0;
        if (_.isUndefined(initiallyFocusedOptionKey)) {
            return defaultIndex;
        }

        const indexOfInitiallyFocusedOption = _.findIndex(allOptions, (option) => option.keyForList === initiallyFocusedOptionKey);

        if (indexOfInitiallyFocusedOption >= 0) {
            return indexOfInitiallyFocusedOption;
        }

        return defaultIndex;
    };

    const relatedTarget = useRef(null);
    const listRef = useRef();
    const textInputRef = useRef();
    const enterSubscription = useRef();
    const CTRLEnterSubscription = useRef();

    const prevLocale = useRef(preferredLocale);
    const prevSelectedOptions = useRef(selectedOptions);

    const [disabledOptionsIndexes, setDisabledOptionsIndexes] = useState([]);

    const initialAllOptions = useMemo(() => {
        return flattenSections();
    }, []);

    const [allOptions, setAllOptions] = useState(initialAllOptions);
    const [focusedIndex, setFocusedIndex] = useState(getInitiallyFocusedIndex(initialAllOptions));
    const [shouldDisableRowSelection, setShouldDisableRowSelection] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const focusTimeout = useRef();

    useEffect(() => {
        subscribeToKeyboardShortcut();

        if (isFocused && autoFocus && textInputRef.current) {
            focusTimeout.current = setTimeout(() => {
                textInputRef.current.focus();
            }, CONST.ANIMATED_TRANSITION);
        }

        scrollToIndex(selectedOptions.length ? 0 : focusedIndex, false);

        return () => {
            if (focusTimeout.current) {
                clearTimeout(focusTimeout.current);
            }

            unSubscribeFromKeyboardShortcut();
        };
    }, []);

    useEffect(() => {
        if (isFocused) {
            subscribeToKeyboardShortcut();
        } else {
            unSubscribeFromKeyboardShortcut();
        }

        // Screen coming back into focus, for example
        // when doing Cmd+Shift+K, then Cmd+K, then Cmd+Shift+K.
        // Only applies to platforms that support keyboard shortcuts
        if ([CONST.PLATFORM.DESKTOP, CONST.PLATFORM.WEB].includes(getPlatform()) && isFocused && autoFocus && textInputRef.current) {
            setTimeout(() => {
                textInputRef.current.focus();
            }, CONST.ANIMATED_TRANSITION);
        }
    }, [isFocused]);

    useEffect(() => {
        const newOptions = flattenSections();

        if (prevLocale.current !== preferredLocale) {
            prevLocale.current = preferredLocale;
            setAllOptions(newOptions);

            return;
        }

        const newFocusedIndex = selectedOptions.length;

        setAllOptions(newOptions);
        setFocusedIndex(_.isNumber(initialFocusedIndex) ? initialFocusedIndex : newFocusedIndex);
    }, [sections]);

    useEffect(() => {
        const isNewFocusedIndex = selectedOptions.length !== focusedIndex;

        // If we just toggled an option on a multi-selection page or cleared the search input, scroll to top
        if (selectedOptions.length !== prevSelectedOptions.current.length || !value) {
            prevSelectedOptions.current = selectedOptions;
            scrollToIndex(0);
            return;
        }

        // Otherwise, scroll to the focused index (as long as it's in range)
        if (allOptions.length <= focusedIndex || !isNewFocusedIndex) {
            return;
        }
        scrollToIndex(focusedIndex);
    }, [focusedIndex]);

    const updateSearchValue = (value) => {
        setErrorMessage(value.length > maxLength ? translate('common.error.characterLimitExceedCounter', {length: value.length, limit: maxLength}) : '');
        onChangeText(value);
    };

    const subscribeToKeyboardShortcut = () => {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        enterSubscription.current = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            selectFocusedOption,
            enterConfig.descriptionKey,
            enterConfig.modifiers,
            true,
            () => !allOptions[focusedIndex],
        );

        const CTRLEnterConfig = CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER;
        CTRLEnterSubscription.current = KeyboardShortcut.subscribe(
            CTRLEnterConfig.shortcutKey,
            () => {
                if (canSelectMultipleOptions) {
                    onConfirmSelection();
                    return;
                }

                const focusedOption = allOptions[focusedIndex];
                if (!focusedOption) {
                    return;
                }

                selectRow(focusedOption);
            },
            CTRLEnterConfig.descriptionKey,
            CTRLEnterConfig.modifiers,
            true,
        );
    };

    const unSubscribeFromKeyboardShortcut = () => {
        if (enterSubscription.current) {
            enterSubscription.current();
        }

        if (CTRLEnterSubscription.current) {
            CTRLEnterSubscription.current();
        }
    };

    const selectFocusedOption = () => {
        const focusedOption = allOptions[focusedIndex];

        if (!focusedOption || !isFocused) {
            return;
        }

        if (canSelectMultipleOptions) {
            selectRow(focusedOption);
        } else if (!shouldDisableRowSelection) {
            setShouldDisableRowSelection(true);

            let result = selectRow(focusedOption);
            if (!(result instanceof Promise)) {
                result = Promise.resolve();
            }

            setTimeout(() => {
                result.finally(() => {
                    setShouldDisableRowSelection(false);
                });
            }, 500);
        }
    };

    const focus = () => {
        if (!textInputRef.current) {
            return;
        }

        textInputRef.current.focus();
    };

    /**
     * @param {Number} index
     */
    const updateFocusedIndex = (index) => {
        setFocusedIndex(index);
    };

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} index
     * @param {Boolean} animated
     */
    const scrollToIndex = (index, animated = true) => {
        const option = allOptions[index];
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
            if (_.isEmpty(lodashGet(sections, `[${i}].data`))) {
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
            if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow) {
                if (relatedTarget.current && ref === relatedTarget.current) {
                    textInputRef.current.focus();
                    relatedTarget.current = null;
                }
                if (textInputRef.current.isFocused()) {
                    setSelection(textInputRef.current, 0, value.length);
                }
            }
            const selectedOption = onSelectRow(option);
            resolve(selectedOption);

            if (!canSelectMultipleOptions) {
                return;
            }

            // Focus the first unselected item from the list (i.e: the best result according to the current search term)
            setFocusedIndex(selectedOptions.length);
        });
    };

    /**
     * Completes the follow-up action after clicking on multiple select button
     * @param {Object} option
     */
    const addToSelection = (option) => {
        if (shouldShowTextInput && shouldPreventDefaultFocusOnSelectRow) {
            textInputRef.current.focus();
            if (textInputRef.current.isFocused()) {
                setSelection(textInputRef.current, 0, value.length);
            }
        }
        onAddToSelection(option);
    };

    const shouldShowFooter = !isReadOnly && (shouldShowConfirmButton || footerContent) && !(canSelectMultipleOptions && _.isEmpty(selectedOptions));
    const defaultConfirmButtonText = _.isUndefined(confirmButtonText) ? translate('common.confirm') : confirmButtonText;
    const shouldShowDefaultConfirmButton = !footerContent && defaultConfirmButtonText;
    const safeAreaPaddingBottomStyle = shouldShowFooter ? undefined : safeAreaPaddingBottomStyle;
    const textInput = (
        <TextInput
            ref={textInputRef}
            value={value}
            label={textInputLabel}
            accessibilityLabel={textInputLabel}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            onChangeText={updateSearchValue}
            errorText={errorMessage}
            onSubmitEditing={selectFocusedOption}
            placeholder={placeholderText}
            maxLength={maxLength + CONST.ADDITIONAL_ALLOWED_CHARACTERS}
            keyboardType={keyboardType}
            onBlur={(e) => {
                if (!shouldPreventDefaultFocusOnSelectRow) {
                    return;
                }
                relatedTarget.current = e.relatedTarget;
            }}
            selectTextOnFocus
            blurOnSubmit={Boolean(allOptions.length)}
            spellCheck={false}
            shouldInterceptSwipe={shouldTextInputInterceptSwipe}
            isLoading={isLoadingNewOptions}
        />
    );
    const optionsList = (
        <OptionsList
            ref={listRef}
            optionHoveredStyle={optionHoveredStyle}
            onSelectRow={onSelectRow ? selectRow : undefined}
            sections={sections}
            focusedIndex={focusedIndex}
            selectedOptions={selectedOptions}
            canSelectMultipleOptions={canSelectMultipleOptions}
            shouldShowMultipleOptionSelectorAsButton={shouldShowMultipleOptionSelectorAsButton}
            multipleOptionSelectorButtonText={multipleOptionSelectorButtonText}
            onAddToSelection={addToSelection}
            hideSectionHeaders={hideSectionHeaders}
            headerMessage={errorMessage ? '' : headerMessage}
            boldStyle={boldStyle}
            showTitleTooltip={showTitleTooltip}
            isDisabled={isDisabled}
            shouldHaveOptionSeparator={shouldHaveOptionSeparator}
            highlightSelectedOptions={highlightSelectedOptions}
            onLayout={() => {
                if (selectedOptions.length === 0) {
                    scrollToIndex(focusedIndex, false);
                }

                if (onLayout) {
                    onLayout();
                }
            }}
            contentContainerStyles={[safeAreaPaddingBottomStyle, ...contentContainerStyles]}
            sectionHeaderStyle={sectionHeaderStyle}
            listContainerStyles={listContainerStyles}
            listStyles={listStyles}
            isLoading={!shouldShowOptions}
            showScrollIndicator={showScrollIndicator}
            isRowMultilineSupported={isRowMultilineSupported}
            isLoadingNewOptions={isLoadingNewOptions}
            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
            nestedScrollEnabled={nestedScrollEnabled}
            bounces={!shouldTextInputAppearBelowOptions || !shouldAllowScrollingChildren}
        />
    );

    const optionsAndInputsBelowThem = (
        <>
            <View style={[styles.flexGrow0, styles.flexShrink1, styles.flexBasisAuto, styles.w100, styles.flexRow]}>{optionsList}</View>
            <View style={shouldUseStyleForChildren ? [styles.ph5, styles.pv5, styles.flexGrow1, styles.flexShrink0] : []}>
                {children}
                {shouldShowTextInput && textInput}
            </View>
        </>
    );

    return (
        <ArrowKeyFocusManager
            disabledIndexes={disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={allOptions.length - 1}
            onFocusedIndexChanged={disableArrowKeysActions ? () => {} : updateFocusedIndex}
            shouldResetIndexOnEndReached={false}
        >
            <View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto]}>
                {/*
                 * The OptionsList component uses a SectionList which uses a VirtualizedList internally.
                 * VirtualizedList cannot be directly nested within ScrollViews of the same orientation.
                 * To work around this, we wrap the OptionsList component with a horizontal ScrollView.
                 */}
                {shouldTextInputAppearBelowOptions && shouldAllowScrollingChildren && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                        <ScrollView
                            horizontal
                            bounces={false}
                            contentContainerStyle={[styles.flex1, styles.flexColumn]}
                        >
                            {optionsAndInputsBelowThem}
                        </ScrollView>
                    </ScrollView>
                )}

                {shouldTextInputAppearBelowOptions && !shouldAllowScrollingChildren && optionsAndInputsBelowThem}

                {!shouldTextInputAppearBelowOptions && (
                    <>
                        <View style={shouldUseStyleForChildren ? [styles.ph5, styles.pb3] : []}>
                            {children}
                            {shouldShowTextInput && textInput}
                            {Boolean(textInputAlert) && (
                                <FormHelpMessage
                                    message={textInputAlert}
                                    style={[styles.mb3]}
                                    isError={false}
                                />
                            )}
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
                            onPress={onConfirmSelection}
                            pressOnEnter
                            enterKeyEventListenerPriority={1}
                        />
                    )}
                    {footerContent}
                </FixedFooter>
            )}
        </ArrowKeyFocusManager>
    );
};

BaseOptionsSelector.defaultProps = defaultProps;
BaseOptionsSelector.propTypes = propTypes;

export default BaseOptionsSelector;
