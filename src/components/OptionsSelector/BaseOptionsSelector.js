import {useIsFocused} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import ArrowKeyFocusManager from '@components/ArrowKeyFocusManager';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import OptionsList from '@components/OptionsList';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import ShowMoreButton from '@components/ShowMoreButton';
import TextInput from '@components/TextInput';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import setSelection from '@libs/setSelection';
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

    /** Whether referral CTA should be displayed */
    shouldShowReferralCTA: PropTypes.bool,

    /** Referral content type */
    referralContentType: PropTypes.string,

    ...optionsSelectorPropTypes,
};

const defaultProps = {
    shouldShowReferralCTA: false,
    referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND,
    safeAreaPaddingBottomStyle: {},
    contentContainerStyles: [],
    listContainerStyles: undefined,
    listStyles: [],
    ...optionsSelectorDefaultProps,
};

function BaseOptionsSelector(props) {
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const themeStyles = useThemeStyles();

    const getInitiallyFocusedIndex = useCallback(
        (allOptions) => {
            let defaultIndex;
            if (props.shouldTextInputAppearBelowOptions) {
                defaultIndex = allOptions.length;
            } else if (props.focusedIndex >= 0) {
                defaultIndex = props.focusedIndex;
            } else {
                defaultIndex = props.selectedOptions.length;
            }
            if (_.isUndefined(props.initiallyFocusedOptionKey)) {
                return defaultIndex;
            }

            const indexOfInitiallyFocusedOption = _.findIndex(allOptions, (option) => option.keyForList === props.initiallyFocusedOptionKey);

            return indexOfInitiallyFocusedOption;
        },
        [props.shouldTextInputAppearBelowOptions, props.initiallyFocusedOptionKey, props.selectedOptions.length, props.focusedIndex],
    );

    const isWebOrDesktop = [CONST.PLATFORM.DESKTOP, CONST.PLATFORM.WEB].includes(getPlatform());
    const accessibilityRoles = _.values(CONST.ROLE);

    const [disabledOptionsIndexes, setDisabledOptionsIndexes] = useState([]);
    const [sections, setSections] = useState();
    const [shouldDisableRowSelection, setShouldDisableRowSelection] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [value, setValue] = useState('');
    const [paginationPage, setPaginationPage] = useState(1);
    const [disableEnterShortCut, setDisableEnterShortCut] = useState(false);

    const relatedTarget = useRef(null);
    const listRef = useRef();
    const textInputRef = useRef();
    const enterSubscription = useRef();
    const CTRLEnterSubscription = useRef();
    const focusTimeout = useRef();
    const prevLocale = useRef(props.preferredLocale);
    const prevPaginationPage = useRef(paginationPage);
    const prevSelectedOptions = useRef(props.selectedOptions);
    const prevValue = useRef(value);

    useImperativeHandle(props.forwardedRef, () => textInputRef.current);

    /**
     * Flattens the sections into a single array of options.
     * Each object in this array is enhanced to have:
     *
     *   1. A `sectionIndex`, which represents the index of the section it came from
     *   2. An `index`, which represents the index of the option within the section it came from.
     *
     * @returns {Array<Object>}
     */
    const flattenSections = useCallback(() => {
        const calcAllOptions = [];
        const calcDisabledOptionsIndexes = [];
        let index = 0;
        _.each(props.sections, (section, sectionIndex) => {
            _.each(section.data, (option, optionIndex) => {
                calcAllOptions.push({
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
        return calcAllOptions;
    }, [props.sections]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initialAllOptions = useMemo(() => flattenSections(), []);
    const [allOptions, setAllOptions] = useState(initialAllOptions);
    const [focusedIndex, setFocusedIndex] = useState(getInitiallyFocusedIndex(initialAllOptions));
    const [focusedOption, setFocusedOption] = useState(allOptions[focusedIndex]);

    /**
     * Maps sections to render only allowed count of them per section.
     *
     * @returns {Objects[]}
     */
    const sliceSections = useCallback(
        () =>
            _.map(props.sections, (section) => {
                if (_.isEmpty(section.data)) {
                    return section;
                }

                const pagination = paginationPage || 1;

                return {
                    ...section,
                    data: section.data.slice(0, CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * pagination),
                };
            }),
        [paginationPage, props.sections],
    );

    /**
     * Completes the follow-up actions after a row is selected
     *
     * @param {Object} option
     * @param {Object} ref
     * @returns {Promise}
     */
    const selectRow = useCallback(
        (option, ref) =>
            new Promise((resolve) => {
                if (props.shouldShowTextInput && props.shouldPreventDefaultFocusOnSelectRow) {
                    if (relatedTarget.current && ref === relatedTarget.current) {
                        textInputRef.current.focus();
                        relatedTarget.current = null;
                    }
                    if (textInputRef.current.isFocused()) {
                        setSelection(textInputRef.current, 0, value.length);
                    }
                }
                const selectedOption = props.onSelectRow(option);
                resolve(selectedOption);

                if (!props.canSelectMultipleOptions) {
                    return;
                }

                // Focus the first unselected item from the list (i.e: the best result according to the current search term)
                setFocusedIndex(props.selectedOptions.length);
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.shouldShowTextInput, props.shouldPreventDefaultFocusOnSelectRow, value.length, props.canSelectMultipleOptions, props.selectedOptions.length],
    );

    const selectFocusedOption = useCallback(
        (e) => {
            const focusedItemKey = lodashGet(e, ['target', 'attributes', 'id', 'value']);
            const localFocusedOption = focusedItemKey ? _.find(allOptions, (option) => option.keyForList === focusedItemKey) : allOptions[focusedIndex];

            if (!localFocusedOption || !isFocused) {
                return;
            }

            if (props.canSelectMultipleOptions) {
                selectRow(localFocusedOption);
            } else if (!shouldDisableRowSelection) {
                setShouldDisableRowSelection(true);

                let result = selectRow(localFocusedOption);
                if (!(result instanceof Promise)) {
                    result = Promise.resolve();
                }

                setTimeout(() => {
                    result.finally(() => {
                        setShouldDisableRowSelection(false);
                    });
                }, 500);
            }
        },
        [props.canSelectMultipleOptions, focusedIndex, allOptions, isFocused, selectRow, shouldDisableRowSelection],
    );

    const handleFocusIn = () => {
        const activeElement = document.activeElement;
        setDisableEnterShortCut(activeElement && accessibilityRoles.includes(activeElement.role) && activeElement.role !== CONST.ROLE.PRESENTATION);
    };

    const handleFocusOut = () => {
        setDisableEnterShortCut(false);
    };

    const subscribeActiveElement = () => {
        if (!isWebOrDesktop) {
            return;
        }
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);
    };

    const subscribeToEnterShortcut = () => {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        enterSubscription.current = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            selectFocusedOption,
            enterConfig.descriptionKey,
            enterConfig.modifiers,
            true,
            () => !allOptions[focusedIndex],
        );
    };

    const subscribeToCtrlEnterShortcut = () => {
        const CTRLEnterConfig = CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER;
        CTRLEnterSubscription.current = KeyboardShortcut.subscribe(
            CTRLEnterConfig.shortcutKey,
            () => {
                if (props.canSelectMultipleOptions) {
                    props.onConfirmSelection();
                    return;
                }

                const localFocusedOption = allOptions[focusedIndex];
                if (!localFocusedOption) {
                    return;
                }

                selectRow(localFocusedOption);
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

    const selectOptions = useCallback(() => {
        if (props.canSelectMultipleOptions) {
            props.onConfirmSelection();
            return;
        }

        const localFocusedOption = allOptions[focusedIndex];
        if (!localFocusedOption) {
            return;
        }

        selectRow(localFocusedOption);
        // we don't need to include the whole props object as the dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allOptions, focusedIndex, props.canSelectMultipleOptions, props.onConfirmSelection, selectRow]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        shouldBubble: !allOptions[focusedIndex],
        captureOnInputs: true,
    });
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER, selectOptions, {captureOnInputs: true});

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} index
     * @param {Boolean} animated
     */
    const scrollToIndex = useCallback(
        (index, animated = true) => {
            const option = allOptions[index];
            if (!listRef.current || !option) {
                return;
            }

            const itemIndex = option.index;
            const sectionIndex = option.sectionIndex;

            if (!lodashGet(sections, `[${sectionIndex}].data[${itemIndex}]`, null)) {
                return;
            }

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
        },
        [allOptions, sections],
    );

    useEffect(() => {
        subscribeToEnterShortcut();
        subscribeToCtrlEnterShortcut();
        subscribeActiveElement();

        if (props.isFocused && props.autoFocus && textInputRef.current) {
            focusTimeout.current = setTimeout(() => {
                textInputRef.current.focus();
            }, CONST.ANIMATED_TRANSITION);
        }

        scrollToIndex(props.selectedOptions.length ? 0 : focusedIndex, false);

        return () => {
            if (focusTimeout.current) {
                clearTimeout(focusTimeout.current);
            }

            unSubscribeFromKeyboardShortcut();
        };
        // we want to run this effect only once, when the component is mounted
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Unregister the shortcut before registering a new one to avoid lingering shortcut listener
        enterSubscription.current();
        if (!disableEnterShortCut) {
            subscribeToEnterShortcut();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disableEnterShortCut]);

    useEffect(() => {
        if (props.isFocused) {
            subscribeToEnterShortcut();
            subscribeToCtrlEnterShortcut();
        } else {
            unSubscribeFromKeyboardShortcut();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isFocused]);

    useEffect(() => {
        const newSections = sliceSections();

        if (prevPaginationPage.current !== paginationPage) {
            prevPaginationPage.current = paginationPage;
            setSections(newSections);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationPage]);

    useEffect(() => {
        setFocusedOption(allOptions[focusedIndex]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusedIndex]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        // Screen coming back into focus, for example
        // when doing Cmd+Shift+K, then Cmd+K, then Cmd+Shift+K.
        // Only applies to platforms that support keyboard shortcuts
        if (isWebOrDesktop && isFocused && props.autoFocus && textInputRef.current) {
            setTimeout(() => {
                textInputRef.current.focus();
            }, CONST.ANIMATED_TRANSITION);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, props.autoFocus]);

    useEffect(() => {
        const newSections = sliceSections();
        const newOptions = flattenSections();

        if (prevLocale.current !== props.preferredLocale) {
            prevLocale.current = props.preferredLocale;
            setAllOptions(newOptions);
            setSections(newSections);
            return;
        }

        const newFocusedIndex = props.selectedOptions.length;
        const prevFocusedOption = _.find(newOptions, (option) => focusedOption && option.keyForList === focusedOption.keyForList);
        const prevFocusedOptionIndex = prevFocusedOption ? _.findIndex(newOptions, (option) => focusedOption && option.keyForList === focusedOption.keyForList) : undefined;

        setSections(newSections);
        setAllOptions(newOptions);
        setFocusedIndex(prevFocusedOptionIndex || (_.isNumber(props.focusedIndex) ? props.focusedIndex : newFocusedIndex));
        // we want to run this effect only when the sections change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.sections]);

    useEffect(() => {
        // If we just toggled an option on a multi-selection page or cleared the search input, scroll to top
        if (props.selectedOptions.length !== prevSelectedOptions.current.length || (!!prevValue.current && !value)) {
            prevSelectedOptions.current = props.selectedOptions;
            prevValue.current = value;
            scrollToIndex(0);
            return;
        }

        // Otherwise, scroll to the focused index (as long as it's in range)
        if (allOptions.length <= focusedIndex) {
            return;
        }
        scrollToIndex(focusedIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allOptions.length, focusedIndex, props.focusedIndex, props.selectedOptions, value]);

    const updateSearchValue = useCallback(
        (searchValue) => {
            setValue(searchValue);
            setErrorMessage(
                searchValue.length > props.maxLength
                    ? translate('common.error.characterLimitExceedCounter', {
                        length: searchValue.length,
                        limit: props.maxLength,
                    })
                    : '',
            );
            props.onChangeText(searchValue);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.onChangeText, props.maxLength, translate],
    );

    const debouncedUpdateSearchValue = _.debounce(updateSearchValue, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

    /**
     * Calculates all currently visible options based on the sections that are currently being shown
     * and the number of items of those sections.
     *
     * @returns {Number}
     */
    const calculateAllVisibleOptionsCount = useCallback(() => {
        let count = 0;

        _.forEach(sections, (section) => {
            count += lodashGet(section, 'data.length', 0);
        });

        return count;
    }, [sections]);

    /**
     * @param {Number} index
     */
    const updateFocusedIndex = useCallback((index) => {
        setFocusedIndex(index);
    }, []);

    /**
     * Completes the follow-up action after clicking on multiple select button
     * @param {Object} option
     */
    const addToSelection = useCallback(
        (option) => {
            if (props.shouldShowTextInput && props.shouldPreventDefaultFocusOnSelectRow) {
                textInputRef.current.focus();
                if (textInputRef.current.isFocused()) {
                    setSelection(textInputRef.current, 0, value.length);
                }
            }
            props.onAddToSelection(option);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.onAddToSelection, props.shouldShowTextInput, props.shouldPreventDefaultFocusOnSelectRow, value.length],
    );

    /**
     * Increments a pagination page to show more items
     */
    const incrementPage = useCallback(() => {
        setPaginationPage((prev) => prev + 1);
    }, []);

    const shouldShowShowMoreButton = allOptions.length > CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * paginationPage;
    const shouldShowFooter = !props.isReadOnly && (props.shouldShowConfirmButton || props.footerContent) && !(props.canSelectMultipleOptions && _.isEmpty(props.selectedOptions));
    const defaultConfirmButtonText = _.isUndefined(props.confirmButtonText) ? translate('common.confirm') : props.confirmButtonText;
    const shouldShowDefaultConfirmButton = !props.footerContent && defaultConfirmButtonText;
    const safeAreaPaddingBottomStyle = shouldShowFooter ? undefined : props.safeAreaPaddingBottomStyle;
    const listContainerStyles = props.listContainerStyles || [themeStyles.flex1];
    const optionHoveredStyle = props.optionHoveredStyle || themeStyles.hoveredComponentBG;

    const textInput = (
        <TextInput
            ref={textInputRef}
            label={props.textInputLabel}
            accessibilityLabel={props.textInputLabel}
            role={CONST.ROLE.PRESENTATION}
            onChangeText={debouncedUpdateSearchValue}
            errorText={errorMessage}
            onSubmitEditing={selectFocusedOption}
            placeholder={props.placeholderText}
            maxLength={props.maxLength + CONST.ADDITIONAL_ALLOWED_CHARACTERS}
            keyboardType={props.keyboardType}
            onBlur={(e) => {
                if (!props.shouldPreventDefaultFocusOnSelectRow) {
                    return;
                }
                relatedTarget.current = e.relatedTarget;
            }}
            selectTextOnFocus
            blurOnSubmit={Boolean(allOptions.length)}
            spellCheck={false}
            shouldInterceptSwipe={props.shouldTextInputInterceptSwipe}
            isLoading={props.isLoadingNewOptions}
            iconLeft={props.textIconLeft}
            testID="options-selector-input"
        />
    );
    const optionsList = (
        <OptionsList
            ref={listRef}
            optionHoveredStyle={optionHoveredStyle}
            onSelectRow={props.onSelectRow ? selectRow : undefined}
            sections={props.sections}
            focusedIndex={focusedIndex}
            selectedOptions={props.selectedOptions}
            disableFocusOptions={props.disableFocusOptions}
            canSelectMultipleOptions={props.canSelectMultipleOptions}
            shouldShowMultipleOptionSelectorAsButton={props.shouldShowMultipleOptionSelectorAsButton}
            multipleOptionSelectorButtonText={props.multipleOptionSelectorButtonText}
            onAddToSelection={addToSelection}
            hideSectionHeaders={props.hideSectionHeaders}
            headerMessage={errorMessage ? '' : props.headerMessage}
            boldStyle={props.boldStyle}
            showTitleTooltip={props.showTitleTooltip}
            isDisabled={props.isDisabled}
            shouldHaveOptionSeparator={props.shouldHaveOptionSeparator}
            highlightSelectedOptions={props.highlightSelectedOptions}
            onLayout={() => {
                if (props.selectedOptions.length === 0) {
                    scrollToIndex(focusedIndex, false);
                }

                if (props.onLayout) {
                    props.onLayout();
                }
            }}
            contentContainerStyles={[safeAreaPaddingBottomStyle, ...props.contentContainerStyles]}
            sectionHeaderStyle={props.sectionHeaderStyle}
            listContainerStyles={listContainerStyles}
            listStyles={props.listStyles}
            isLoading={!props.shouldShowOptions}
            showScrollIndicator={props.showScrollIndicator}
            isRowMultilineSupported={props.isRowMultilineSupported}
            isLoadingNewOptions={props.isLoadingNewOptions}
            shouldPreventDefaultFocusOnSelectRow={props.shouldPreventDefaultFocusOnSelectRow}
            nestedScrollEnabled={props.nestedScrollEnabled}
            bounces={!props.shouldTextInputAppearBelowOptions || !props.shouldAllowScrollingChildren}
            renderFooterContent={() =>
                shouldShowShowMoreButton && (
                    <ShowMoreButton
                        containerStyle={{...themeStyles.mt2, ...themeStyles.mb5}}
                        currentCount={CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * paginationPage}
                        totalCount={allOptions.length}
                        onPress={incrementPage}
                    />
                )
            }
        />
    );

    const optionsAndInputsBelowThem = (
        <>
            <View style={[themeStyles.flexGrow0, themeStyles.flexShrink1, themeStyles.flexBasisAuto, themeStyles.w100, themeStyles.flexRow]}>{optionsList}</View>
            <View style={props.shouldUseStyleForChildren ? [themeStyles.ph5, themeStyles.pv5, themeStyles.flexGrow1, themeStyles.flexShrink0] : []}>
                {props.children}
                {props.shouldShowTextInput && textInput}
            </View>
        </>
    );

    return (
        <ArrowKeyFocusManager
            disabledIndexes={disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={calculateAllVisibleOptionsCount() - 1}
            onFocusedIndexChanged={props.disableArrowKeysActions ? () => {} : updateFocusedIndex}
            shouldResetIndexOnEndReached={false}
        >
            <View style={[themeStyles.flexGrow1, themeStyles.flexShrink1, themeStyles.flexBasisAuto]}>
                {/*
                 * The OptionsList component uses a SectionList which uses a VirtualizedList internally.
                 * VirtualizedList cannot be directly nested within ScrollViews of the same orientation.
                 * To work around this, we wrap the OptionsList component with a horizontal ScrollView.
                 */}
                {props.shouldTextInputAppearBelowOptions && props.shouldAllowScrollingChildren && (
                    <ScrollView contentContainerStyle={[themeStyles.flexGrow1]}>
                        <ScrollView
                            horizontal
                            bounces={false}
                            contentContainerStyle={[themeStyles.flex1, themeStyles.flexColumn]}
                        >
                            {optionsAndInputsBelowThem}
                        </ScrollView>
                    </ScrollView>
                )}

                {props.shouldTextInputAppearBelowOptions && !props.shouldAllowScrollingChildren && optionsAndInputsBelowThem}

                {!props.shouldTextInputAppearBelowOptions && (
                    <>
                        <View style={props.shouldUseStyleForChildren ? [themeStyles.ph5, themeStyles.pb3] : []}>
                            {props.children}
                            {props.shouldShowTextInput && textInput}
                            {Boolean(props.textInputAlert) && (
                                <FormHelpMessage
                                    message={props.textInputAlert}
                                    style={[themeStyles.mb3]}
                                    isError={false}
                                />
                            )}
                        </View>
                        {optionsList}
                    </>
                )}
            </View>
            {props.shouldShowReferralCTA && (
                <View style={[themeStyles.ph5, themeStyles.pb5, themeStyles.flexShrink0]}>
                    <ReferralProgramCTA referralContentType={props.referralContentType} />
                </View>
            )}

            {shouldShowFooter && (
                <FixedFooter>
                    {shouldShowDefaultConfirmButton && (
                        <Button
                            success
                            style={[themeStyles.w100]}
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
}

BaseOptionsSelector.defaultProps = defaultProps;
BaseOptionsSelector.propTypes = propTypes;

const BaseOptionsSelectorWithRef = forwardRef((props, ref) => (
    <BaseOptionsSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

BaseOptionsSelectorWithRef.displayName = 'BaseOptionsSelectorWithRef';

export default BaseOptionsSelectorWithRef;
